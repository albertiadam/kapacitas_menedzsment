import { useRef, useState } from 'react';
import type {
  Project, ProjectSkillEmployee, ProjectStatus,
  Employee, SkillEmployee, Skill,
  SuggestTeamResultItem, EmployeeAvailability,
} from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ChevronDown, ChevronUp, Pencil, Check, X, Plus, Trash2, Wand2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { suggestTeam } from '@/api/projects';
import { useAvailableEmployeesBySkill } from '@/hooks/queries';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('hu-HU').format(value) + ' HUF';
}

function toDateStr(d: Date | string | undefined | null): string {
  if (!d) return '';
  return String(d).slice(0, 10);
}

function safeParseISO(d: Date | string | undefined | null): Date | undefined {
  const s = toDateStr(d);
  return s ? parseISO(s) : undefined;
}

function availColor(a: EmployeeAvailability['availability']) {
  if (a === 'fully') return 'text-green-500';
  if (a === 'partially') return 'text-yellow-500';
  return 'text-red-500';
}

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' },
];

interface Props {
  project: Project;
  projectSkillEmployees: ProjectSkillEmployee[];
}

type PendingRow = {
  localId: number;
  skillId: string;
  proficiency: string;
  capacity: string;
  start: string;
  end: string;
  selectedEmployeeId: string;
  suggestion: SuggestTeamResultItem | null;
  rowError: string | null;
};

export function ProjectCard({ project, projectSkillEmployees }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(project.description);
  const [editStart, setEditStart] = useState<Date | undefined>(safeParseISO(project.start));
  const [editEnd, setEditEnd] = useState<Date | undefined>(safeParseISO(project.end));
  const [editFixCost, setEditFixCost] = useState(String(project.fix_cost ?? ''));
  const [editRevenue, setEditRevenue] = useState(String(project.revenue ?? ''));

  const [showBatch, setShowBatch] = useState(false);
  const [pendingRows, setPendingRows] = useState<PendingRow[]>([]);
  const [preference, setPreference] = useState<'cost' | 'capacity'>('cost');
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState('');
  const [savingRows, setSavingRows] = useState<Set<number>>(new Set());
  const nextRowId = useRef(0);

  const { isPM, isManager } = useAuth();
  const {
    updateProject, deleteProject, deleteProjectSkillEmployee, updateProjectSkillEmployee,
    createProjectSkillEmployee, skills, employees, employeeSkills,
  } = useData();

  const handleSave = () => {
    updateProject(project.id, {
      description: editDesc,
      start: editStart ? format(editStart, 'yyyy-MM-dd') : toDateStr(project.start),
      end: editEnd ? format(editEnd, 'yyyy-MM-dd') : toDateStr(project.end),
      fix_cost: editFixCost === '' ? undefined : Number(editFixCost),
      revenue: editRevenue === '' ? undefined : Number(editRevenue),
    });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditDesc(project.description);
    setEditStart(safeParseISO(project.start));
    setEditEnd(safeParseISO(project.end));
    setEditFixCost(String(project.fix_cost ?? ''));
    setEditRevenue(String(project.revenue ?? ''));
  };

  const makeEmptyRow = (): PendingRow => ({
    localId: nextRowId.current++,
    skillId: '',
    proficiency: '1',
    capacity: '',
    start: toDateStr(project.start),
    end: toDateStr(project.end),
    selectedEmployeeId: '',
    suggestion: null,
    rowError: null,
  });

  const addRow = () => setPendingRows(prev => [...prev, makeEmptyRow()]);

  const updateRow = <K extends keyof PendingRow>(localId: number, field: K, value: PendingRow[K]) => {
    setPendingRows(prev =>
      prev.map(r => {
        if (r.localId !== localId) return r;
        const resetEmployee = field === 'skillId' || field === 'proficiency';
        return {
          ...r,
          [field]: value,
          suggestion: null,
          rowError: null,
          ...(resetEmployee ? { selectedEmployeeId: '' } : {}),
        };
      }),
    );
  };

  const removeRow = (localId: number) => setPendingRows(prev => prev.filter(r => r.localId !== localId));

  const handleSuggest = async () => {
    setSuggestError('');
    setPendingRows(prev => prev.map(r => ({ ...r, suggestion: null, rowError: null })));

    for (const row of pendingRows) {
      if (!row.skillId) { setSuggestError('Each row must have a skill selected'); return; }
      const cap = Number(row.capacity);
      if (Number.isNaN(cap) || cap <= 0 || cap > 1) {
        setSuggestError('Each row needs a capacity between 0 and 1');
        return;
      }
      if (!row.start || !row.end) { setSuggestError('Each row needs start and end dates'); return; }
      if (row.end <= row.start) { setSuggestError('End date must be after start date in every row'); return; }
    }

    setSuggesting(true);
    try {
      const result = await suggestTeam({
        preference,
        skills: pendingRows.map(r => ({
          skill_id: Number(r.skillId),
          start: `${r.start}T00:00:00`,
          end: `${r.end}T00:00:00`,
          needed_proficiency: Number(r.proficiency),
          needed_capacity: Number(r.capacity),
        })),
      });

      setPendingRows(prev =>
        prev.map((r, i) => ({
          ...r,
          suggestion: result.team[i] ?? null,
          selectedEmployeeId: result.team[i] ? String(result.team[i].employee_id) : r.selectedEmployeeId,
        })),
      );
    } catch (err: any) {
      setSuggestError(err.message || 'Suggestion failed');
    } finally {
      setSuggesting(false);
    }
  };

  const handleSaveRow = async (localId: number) => {
    const row = pendingRows.find(r => r.localId === localId);
    if (!row?.selectedEmployeeId) return;

    setSavingRows(prev => new Set(prev).add(localId));
    try {
      const start = row.suggestion ? toDateStr(row.suggestion.start) : row.start;
      const end = row.suggestion ? toDateStr(row.suggestion.end) : row.end;
      await createProjectSkillEmployee({
        project_id: project.id,
        skill_id: Number(row.skillId),
        employee_id: Number(row.selectedEmployeeId),
        needed_proficiency: Number(row.proficiency),
        capacity_on_project: Number(row.capacity),
        skill_start: start,
        skill_end: end,
      });
      setPendingRows(prev => prev.filter(r => r.localId !== localId));
    } catch (err: any) {
      setPendingRows(prev =>
        prev.map(r =>
          r.localId === localId ? { ...r, rowError: err.message || 'Save failed' } : r,
        ),
      );
    } finally {
      setSavingRows(prev => {
        const next = new Set(prev);
        next.delete(localId);
        return next;
      });
    }
  };

  const closeBatch = () => {
    setShowBatch(false);
    setPendingRows([]);
    setSuggestError('');
  };

  return (
    <div className="border border-border rounded-lg bg-card transition-all duration-200 hover:border-primary/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
          {project.short_name}
        </span>
        <span className="text-sm font-medium text-foreground truncate flex-1">{project.name}</span>
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground font-mono hidden lg:inline border-l border-border pl-3">
          {toDateStr(project.start)}
        </span>
        <span className="text-xs text-muted-foreground font-mono hidden lg:inline border-l border-border pl-3">
          {toDateStr(project.end)}
        </span>
        {isManager && (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); deleteProject(project.id); }}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
            aria-label="Delete project"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </span>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border animate-fade-in">
          {/* Details header */}
          <div className="flex items-center justify-between mt-4 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Details
            </h3>
            <div className="flex gap-2">
              {isPM && (
                <Select
                  value={project.status}
                  onValueChange={v => updateProject(project.id, { status: v as ProjectStatus })}
                >
                  <SelectTrigger className="w-32 h-7 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="default" size="sm" className="h-7 text-xs" onClick={handleSave}>
                    <Check className="w-3 h-3 mr-1" /> Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editing ? (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <Textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="bg-background text-sm"
                  rows={2}
                />
              </div>
            ) : (
              <DetailItem label="Description" value={project.description || '—'} />
            )}

            {editing ? (
              <DatePickerField label="Start Date" value={editStart} onChange={setEditStart} />
            ) : (
              <DetailItem label="Start Date" value={toDateStr(project.start)} />
            )}

            {editing ? (
              <DatePickerField label="End Date" value={editEnd} onChange={setEditEnd} />
            ) : (
              <DetailItem label="End Date" value={toDateStr(project.end)} />
            )}

            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fixed Cost (HUF)</p>
                <Input
                  type="number"
                  value={editFixCost}
                  onChange={e => setEditFixCost(e.target.value)}
                  className="bg-background h-8 text-sm"
                />
              </div>
            ) : (
              <DetailItem
                label="Fixed Cost"
                value={typeof project.fix_cost === 'number' ? formatCurrency(project.fix_cost) : '—'}
              />
            )}

            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Revenue (HUF)</p>
                <Input
                  type="number"
                  value={editRevenue}
                  onChange={e => setEditRevenue(e.target.value)}
                  className="bg-background h-8 text-sm"
                />
              </div>
            ) : (
              <DetailItem
                label="Revenue"
                value={typeof project.revenue === 'number' ? formatCurrency(project.revenue) : '—'}
              />
            )}

            <DetailItem
              label="Employee Cost"
              value={typeof project.employee_cost === 'number' ? formatCurrency(project.employee_cost) : '—'}
            />
            <DetailItem
              label="Actual Employee Cost"
              value={typeof project.employee_actual_cost === 'number' ? formatCurrency(project.employee_actual_cost) : '—'}
            />
          </div>

          {/* Skill assignments */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Skill Assignments
              </h4>
              {isPM && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    if (!showBatch) {
                      setShowBatch(true);
                      if (pendingRows.length === 0) setPendingRows([makeEmptyRow()]);
                    } else {
                      closeBatch();
                    }
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Assignments
                </Button>
              )}
            </div>

            {projectSkillEmployees.length > 0 && (
              <div
                className="grid gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wider px-3 py-1.5 border-b border-border mb-1"
                style={{ gridTemplateColumns: project.status === 'completed' ? '1fr 50px 1fr 80px 80px 1fr 40px' : '1fr 50px 1fr 90px 1fr 40px' }}
              >
                <span>Skill</span>
                <span>Lv.</span>
                <span>Interval</span>
                <span>Cap.</span>
                {project.status === 'completed' && <span>Actual</span>}
                <span>Assigned</span>
                <span />
              </div>
            )}

            <div className="space-y-1">
              {projectSkillEmployees.map(pse => (
                <PseRow
                  key={pse.id}
                  pse={pse}
                  isPM={isPM}
                  isCompleted={project.status === 'completed'}
                  employees={employees}
                  employeeSkills={employeeSkills}
                  onReassign={empId => updateProjectSkillEmployee(pse.id, { employee_id: empId })}
                  onRemove={() => deleteProjectSkillEmployee(pse.id)}
                  onUpdateActualCap={val => updateProjectSkillEmployee(pse.id, { capacity_worked_on_project: val })}
                />
              ))}
            </div>

            {/* Batch assignment panel */}
            {showBatch && isPM && (
              <div className="mt-3 p-3 border border-primary/30 rounded-md bg-background animate-fade-in space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pending assignments
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={closeBatch}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {pendingRows.map((row, idx) => (
                  <PendingRowForm
                    key={row.localId}
                    row={row}
                    index={idx}
                    skills={skills}
                    isSaving={savingRows.has(row.localId)}
                    onUpdate={(field, value) => updateRow(row.localId, field, value as any)}
                    onRemove={() => removeRow(row.localId)}
                    onSave={() => handleSaveRow(row.localId)}
                  />
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs w-full"
                  onClick={addRow}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Row
                </Button>

                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <Select
                    value={preference}
                    onValueChange={v => setPreference(v as 'cost' | 'capacity')}
                  >
                    <SelectTrigger className="h-8 text-xs bg-card w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cost">Prefer cheapest</SelectItem>
                      <SelectItem value="capacity">Prefer available</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    className="h-8 text-xs flex-1"
                    onClick={handleSuggest}
                    disabled={suggesting || pendingRows.length === 0}
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    {suggesting ? 'Suggesting…' : 'Suggest Team'}
                  </Button>
                </div>

                {suggestError && (
                  <p className="text-xs text-destructive">{suggestError}</p>
                )}
              </div>
            )}

            {projectSkillEmployees.length === 0 && !showBatch && (
              <p className="text-xs text-muted-foreground italic py-2">No assignments yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface PendingRowFormProps {
  row: {
    localId: number;
    skillId: string;
    proficiency: string;
    capacity: string;
    start: string;
    end: string;
    selectedEmployeeId: string;
    suggestion: SuggestTeamResultItem | null;
    rowError: string | null;
  };
  index: number;
  skills: Skill[];
  isSaving: boolean;
  onUpdate: (field: keyof PendingRow, value: string) => void;
  onRemove: () => void;
  onSave: () => void;
}

function PendingRowForm({ row, index, skills, isSaving, onUpdate, onRemove, onSave }: PendingRowFormProps) {
  const cap = Number(row.capacity);
  const { data: available, isFetching } = useAvailableEmployeesBySkill({
    skill_id: row.skillId ? Number(row.skillId) : null,
    start: row.start,
    end: row.end,
    proficiency: Number(row.proficiency),
    needed_capacity: cap > 0 ? cap : 0,
  });

  const suggestion = row.suggestion;
  const canSave = !!row.selectedEmployeeId;

  return (
    <div className="p-2.5 border border-border rounded bg-card space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">#{index + 1}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        <Select
          value={row.skillId}
          onValueChange={v => onUpdate('skillId', v)}
        >
          <SelectTrigger className="h-8 text-xs bg-background">
            <SelectValue placeholder="Select skill..." />
          </SelectTrigger>
          <SelectContent>
            {skills.map(s => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={row.proficiency}
          onValueChange={v => onUpdate('proficiency', v)}
        >
          <SelectTrigger className="h-8 text-xs bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3].map(l => (
              <SelectItem key={l} value={String(l)}>
                Level {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          step="0.01"
          min="0.01"
          max="1"
          placeholder="Cap. 0–1"
          value={row.capacity}
          onChange={e => onUpdate('capacity', e.target.value)}
          className="h-8 text-xs bg-background"
        />

        <Input
          type="date"
          value={row.start}
          onChange={e => onUpdate('start', e.target.value)}
          className="h-8 text-xs bg-background"
        />

        <Input
          type="date"
          value={row.end}
          onChange={e => onUpdate('end', e.target.value)}
          className="h-8 text-xs bg-background"
        />

        {/* Employee selector with availability colors */}
        {row.skillId && row.start && row.end && row.start < row.end && (
          <Select
            value={row.selectedEmployeeId}
            onValueChange={v => onUpdate('selectedEmployeeId', v)}
            disabled={isFetching}
          >
            <SelectTrigger className="h-8 text-xs bg-background">
              <SelectValue placeholder={isFetching ? 'Loading…' : 'Select employee…'} />
            </SelectTrigger>
            <SelectContent>
              {(available ?? []).map(emp => (
                <SelectItem key={emp.id} value={String(emp.id)}>
                  <span className={availColor(emp.availability)}>●</span>
                  {' '}{emp.name}
                </SelectItem>
              ))}
              {available?.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">No eligible employees</div>
              )}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Suggestion result */}
      {suggestion && (
        <div className="flex items-center gap-2 pt-1.5 border-t border-border">
          <span className="text-xs text-muted-foreground flex-1">
            Suggested: <span className="text-primary font-medium">{suggestion.employee_name}</span>
            {' · '}est. {new Intl.NumberFormat('hu-HU').format(suggestion.estimated_cost)} HUF
          </span>
        </div>
      )}

      {row.rowError && <p className="text-xs text-destructive">{row.rowError}</p>}

      {canSave && (
        <div className="flex justify-end">
          <Button size="sm" className="h-7 text-xs" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  );
}

interface PseRowProps {
  pse: ProjectSkillEmployee;
  isPM: boolean;
  isCompleted: boolean;
  employees: Employee[];
  employeeSkills: SkillEmployee[];
  onReassign: (empId: number) => void;
  onRemove: () => void;
  onUpdateActualCap: (val: number) => void;
}

function PseRow({ pse, isPM, isCompleted, employees, employeeSkills, onReassign, onRemove, onUpdateActualCap }: PseRowProps) {
  const [actualCap, setActualCap] = useState(String(pse.capacity_worked_on_project ?? ''));

  const handleActualCapBlur = () => {
    const val = Number(actualCap);
    if (!Number.isNaN(val) && val >= 0 && val <= 1) {
      onUpdateActualCap(val);
    }
  };

  return (
    <div
      className="grid gap-3 items-center bg-background rounded-md px-3 py-2 text-sm"
      style={{ gridTemplateColumns: isCompleted ? '1fr 50px 1fr 80px 80px 1fr 40px' : '1fr 50px 1fr 90px 1fr 40px' }}
    >
      <span className="font-medium text-foreground truncate">{pse.skill_name}</span>
      <Badge variant="outline" className="text-xs font-mono w-fit">
        Lv.{pse.needed_proficiency}
      </Badge>
      <span className="text-xs text-muted-foreground font-mono">
        {toDateStr(pse.skill_start)} – {toDateStr(pse.skill_end)}
      </span>
      <span className="text-xs text-muted-foreground font-mono">
        {pse.capacity_on_project.toFixed(2)}
      </span>
      {isCompleted && (
        <Input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={actualCap}
          onChange={e => setActualCap(e.target.value)}
          onBlur={handleActualCapBlur}
          onKeyDown={e => e.key === 'Enter' && handleActualCapBlur()}
          className="h-7 text-xs bg-card px-2"
          placeholder="0–1"
        />
      )}
      <div>
        {isPM ? (
          <PseReassignSelect pse={pse} employees={employees} employeeSkills={employeeSkills} onReassign={onReassign} />
        ) : (
          <span className="text-xs text-primary">{pse.employee_name}</span>
        )}
      </div>
      <div className="flex justify-end">
        {isPM && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

function PseReassignSelect({
  pse,
  employees,
  employeeSkills,
  onReassign,
}: {
  pse: ProjectSkillEmployee;
  employees: Employee[];
  employeeSkills: SkillEmployee[];
  onReassign: (empId: number) => void;
}) {
  const { data: available } = useAvailableEmployeesBySkill({
    skill_id: pse.skill_id,
    start: toDateStr(pse.skill_start),
    end: toDateStr(pse.skill_end),
    proficiency: pse.needed_proficiency,
    needed_capacity: pse.capacity_on_project,
  });

  // Fall back to local list (without colors) while loading
  const fallback = employeeSkills
    .filter(es => es.skill_id === pse.skill_id && es.proficiency >= pse.needed_proficiency)
    .map(es => employees.find(e => e.id === es.employee_id))
    .filter((e): e is Employee => Boolean(e));

  return (
    <Select value={String(pse.employee_id)} onValueChange={v => onReassign(Number(v))}>
      <SelectTrigger className="h-7 text-xs bg-card w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {available
          ? available.map(emp => (
              <SelectItem key={emp.id} value={String(emp.id)}>
                <span className={availColor(emp.availability)}>●</span>
                {' '}{emp.name}
              </SelectItem>
            ))
          : fallback.map(emp => (
              <SelectItem key={emp.id} value={String(emp.id)}>
                {emp.name}
              </SelectItem>
            ))}
      </SelectContent>
    </Select>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn('w-full h-8 text-xs justify-start', !value && 'text-muted-foreground')}
          >
            <CalendarIcon className="w-3 h-3 mr-1" />
            {value ? format(value, 'yyyy-MM-dd') : 'Pick date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
