import { useState } from 'react';
import { Project, ProjectStatus, ProjectSkill } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { ChevronDown, ChevronUp, User, Pencil, Check, X, Plus, Trash2, Lock, Unlock, Calculator, GripVertical } from 'lucide-react';
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {DragEndEvent} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('hu-HU').format(value) + ' HUF';
}

type AssignPreference = 'cost' | 'capacity';

export function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(project.description);
  const [editStart, setEditStart] = useState<Date | undefined>(project.startDate ? parseISO(project.startDate) : undefined);
  const [editEnd, setEditEnd] = useState<Date | undefined>(project.endDate ? parseISO(project.endDate) : undefined);
  const [editFixedCost, setEditFixedCost] = useState(String(project.fixedCost ?? ''));
  const [editRevenue, setEditRevenue] = useState(String(project.revenue ?? ''));
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('1');
  const [newSkillCapacity, setNewSkillCapacity] = useState('');
  const [newSkillStart, setNewSkillStart] = useState('');
  const [newSkillEnd, setNewSkillEnd] = useState('');
  const [capacityError, setCapacityError] = useState('');
  // Preference selectors for auto-assignment
  const [bulkPreference, setBulkPreference] = useState<AssignPreference | ''>('');
  const [rowPreference, setRowPreference] = useState<Record<string, AssignPreference>>({});
  const { isPM } = useAuth();
  const {
    updateProjectStatus, updateProject, skills: globalSkills,
    addProjectSkill, removeProjectSkill, updateProjectSkill,
    reorderProjectSkills, autoAssignSkill, autoAssignAllEmptySkills,
    employees,
  } = useData();

  const statuses: ProjectStatus[] = ['Planned', 'Ongoing', 'Completed', 'Cancelled', 'On Hold'];

  const hasAssignedSkills = project.skills.some(s => s.assignedEmployeeId);
  const showPersonColumn = !(project.status === 'Planned' && !hasAssignedSkills);

  const newSkillAllFilled = newSkillId && newSkillLevel && newSkillStart && newSkillEnd && newSkillCapacity !== '';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = project.skills.map(s => s.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(ids, oldIndex, newIndex);
    reorderProjectSkills(project.id, reordered);
  };

  const handleSaveEdit = () => {
    updateProject(project.id, {
      description: editDesc,
      startDate: editStart ? format(editStart, 'yyyy-MM-dd') : project.startDate,
      endDate: editEnd ? format(editEnd, 'yyyy-MM-dd') : project.endDate,
      fixedCost: editFixedCost === '' ? undefined : Number(editFixedCost),
      revenue: editRevenue === '' ? undefined : Number(editRevenue),
    });
    setEditing(false);
  };

  const handleAddSkill = () => {
    if (!newSkillAllFilled) return;
    const cap = Number(newSkillCapacity);
    if (Number.isNaN(cap) || cap < 0 || cap > 1) {
      setCapacityError('Capacity on project must be between 0 and 1');
      return;
    }
    const skill = globalSkills.find(s => s.id === newSkillId);
    if (!skill) return;
    addProjectSkill(project.id, {
      skillId: skill.id,
      skillName: skill.name,
      level: Number(newSkillLevel),
      duration: Math.max(1, Math.round(cap * 20)), // legacy compat
      capacityOnProject: cap,
      startDate: newSkillStart,
      endDate: newSkillEnd,
      assignedEmployeeId: null,
      assignedEmployeeName: null,
      fixed: false,
    });
    setNewSkillId('');
    setNewSkillLevel('1');
    setNewSkillCapacity('');
    setNewSkillStart('');
    setNewSkillEnd('');
    setCapacityError('');
    setAddingSkill(false);
  };

  const getEmployeeAvailability = (emp: typeof employees[0], skill: ProjectSkill): 'available' | 'overtime' => {
    const hasSkill = emp.skills.find(s => s.skillId === skill.skillId && s.level >= skill.level);
    if (!hasSkill) return 'overtime';
    const usedBefore = emp.plannedCapacity + emp.allocatedCapacity;
    const usedAfter = usedBefore + skill.duration;
    if (usedBefore >= emp.totalCapacity || usedAfter > emp.totalCapacity) return 'overtime';
    return 'available';
  };

  const isSkillRowComplete = (skill: ProjectSkill) =>
    Boolean(skill.skillId && skill.level && skill.startDate && skill.endDate && typeof skill.capacityOnProject === 'number');

  const emptySkillCount = project.skills.filter(s => !s.assignedEmployeeId && !s.fixed).length;

  // Grid columns: Drag | Skill | Level | Interval | Cap. on proj. | (Assigned) | Actions
  const gridCols = showPersonColumn
    ? '24px 1fr 50px 1fr 110px 1fr 90px'
    : '24px 1fr 50px 1fr 110px 90px';

  return (
    <div className="border border-border rounded-lg bg-card transition-all duration-200 hover:border-primary/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
          {project.shortName}
        </span>
        <span className="text-sm font-medium text-foreground truncate flex-1">{project.name}</span>
        <StatusBadge status={project.status} />
        <span className="text-xs text-muted-foreground font-mono hidden lg:inline border-l border-border pl-3">{project.startDate}</span>
        <div className="hidden sm:block border-l border-border pl-3"><ProgressBar value={project.progress} /></div>
        <span className="text-xs text-muted-foreground font-mono hidden lg:inline border-l border-border pl-3">{project.endDate}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border animate-fade-in">
          <div className="flex items-center justify-between mt-4 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
            <div className="flex gap-2">
              {isPM && (
                <Select value={project.status} onValueChange={(v) => updateProjectStatus(project.id, v as ProjectStatus)}>
                  <SelectTrigger className="w-32 h-7 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {!editing ? (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditing(true)}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button variant="default" size="sm" className="h-7 text-xs" onClick={handleSaveEdit}>
                    <Check className="w-3 h-3 mr-1" /> Save
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                    setEditing(false);
                    setEditDesc(project.description);
                    setEditStart(project.startDate ? parseISO(project.startDate) : undefined);
                    setEditEnd(project.endDate ? parseISO(project.endDate) : undefined);
                    setEditFixedCost(String(project.fixedCost ?? ''));
                    setEditRevenue(String(project.revenue ?? ''));
                  }}>
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editing ? (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="bg-background text-sm" rows={2} />
              </div>
            ) : (
              <DetailItem label="Description" value={project.description} />
            )}
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-8 text-xs justify-start", !editStart && "text-muted-foreground")}>
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {editStart ? format(editStart, 'yyyy-MM-dd') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editStart} onSelect={setEditStart} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <DetailItem label="Start Date" value={project.startDate} />
            )}
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-8 text-xs justify-start", !editEnd && "text-muted-foreground")}>
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {editEnd ? format(editEnd, 'yyyy-MM-dd') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editEnd} onSelect={setEditEnd} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <DetailItem label="End Date" value={project.endDate} />
            )}
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fixed Cost (HUF)</p>
                <Input type="number" value={editFixedCost} onChange={e => setEditFixedCost(e.target.value)} className="bg-background h-8 text-sm" />
              </div>
            ) : (
              <DetailItem label="Fixed Cost" value={typeof project.fixedCost === 'number' ? formatCurrency(project.fixedCost) : '—'} />
            )}
            {editing ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Revenue (HUF)</p>
                <Input type="number" value={editRevenue} onChange={e => setEditRevenue(e.target.value)} className="bg-background h-8 text-sm" />
              </div>
            ) : (
              <DetailItem label="Revenue" value={typeof project.revenue === 'number' ? formatCurrency(project.revenue) : '—'} />
            )}
          </div>

          {/* Skills section */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Skills</h4>
              <div className="flex gap-2 items-center flex-wrap">
                {isPM && emptySkillCount > 0 && (
                  <>
                    <Select value={bulkPreference} onValueChange={(v) => setBulkPreference(v as AssignPreference)}>
                      <SelectTrigger className="w-44 h-7 text-xs bg-background">
                        <SelectValue placeholder="Optimization preference…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cost">Minimize Cost</SelectItem>
                        <SelectItem value="capacity">Maximize Capacity</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={!bulkPreference}
                      onClick={() => bulkPreference && autoAssignAllEmptySkills(project.id, bulkPreference)}
                      title={!bulkPreference ? 'Select an optimization preference first' : 'Auto-assign all empty skills'}
                    >
                      <Calculator className="w-3 h-3 mr-1" /> Calculate
                    </Button>
                  </>
                )}
                {isPM && (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddingSkill(!addingSkill)}>
                    <Plus className="w-3 h-3 mr-1" /> Add Skill
                  </Button>
                )}
              </div>
            </div>

            {/* Skill list header */}
            {project.skills.length > 0 && (
              <div className="grid gap-3 text-xs text-muted-foreground font-medium uppercase tracking-wider px-3 py-1.5 border-b border-border mb-1"
                style={{ gridTemplateColumns: gridCols }}>
                <span></span>
                <span>Skill</span>
                <span>Level</span>
                <span>Interval</span>
                <span>Cap. on proj.</span>
                {showPersonColumn && <span>Assigned</span>}
                <span></span>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={project.skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {project.skills.map((skill) => (
                    <SortableSkillRow
                      key={skill.id}
                      skill={skill}
                      gridCols={gridCols}
                      showPersonColumn={showPersonColumn}
                      isPM={isPM}
                      employees={employees}
                      rowComplete={isSkillRowComplete(skill)}
                      getEmployeeAvailability={getEmployeeAvailability}
                      onAssignChange={(empId) => {
                        const emp = employees.find(e => e.id === empId);
                        updateProjectSkill(project.id, skill.id, {
                          assignedEmployeeId: empId === '_none' ? null : empId,
                          assignedEmployeeName: empId === '_none' ? null : emp?.name || null,
                        });
                      }}
                      onToggleFixed={() => updateProjectSkill(project.id, skill.id, { fixed: !skill.fixed })}
                      onRemove={() => removeProjectSkill(project.id, skill.id)}
                      preference={rowPreference[skill.id] ?? ''}
                      onPreferenceChange={(p) => setRowPreference(prev => ({ ...prev, [skill.id]: p }))}
                      onAutoAssign={() => {
                        const pref = rowPreference[skill.id];
                        if (!pref) return;
                        autoAssignSkill(project.id, skill.id, pref);
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add skill form */}
            {addingSkill && isPM && (
              <div className="mt-2 p-3 border border-border rounded-md bg-background animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Select value={newSkillId} onValueChange={setNewSkillId}>
                    <SelectTrigger className="h-8 text-xs bg-card">
                      <SelectValue placeholder="Select skill..." />
                    </SelectTrigger>
                    <SelectContent>
                      {globalSkills.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={newSkillLevel} onValueChange={setNewSkillLevel}>
                    <SelectTrigger className="h-8 text-xs bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3].map(l => <SelectItem key={l} value={String(l)}>Level {l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    placeholder="Cap. 0–1"
                    value={newSkillCapacity}
                    onChange={e => { setNewSkillCapacity(e.target.value); setCapacityError(''); }}
                    className="h-8 text-xs bg-card"
                  />
                  <Input type="date" placeholder="Start" value={newSkillStart} onChange={e => setNewSkillStart(e.target.value)} className="h-8 text-xs bg-card" />
                  <Input type="date" placeholder="End" value={newSkillEnd} onChange={e => setNewSkillEnd(e.target.value)} className="h-8 text-xs bg-card" />
                </div>
                {capacityError && <p className="text-xs text-destructive mt-1">{capacityError}</p>}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="h-7 text-xs" onClick={handleAddSkill} disabled={!newSkillAllFilled}>Add</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAddingSkill(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {project.skills.length === 0 && !addingSkill && (
              <p className="text-xs text-muted-foreground italic py-2">No skills assigned yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SortableSkillRowProps {
  skill: ProjectSkill;
  gridCols: string;
  showPersonColumn: boolean;
  isPM: boolean;
  employees: ReturnType<typeof useData>['employees'];
  rowComplete: boolean;
  getEmployeeAvailability: (emp: ReturnType<typeof useData>['employees'][0], skill: ProjectSkill) => 'available' | 'overtime';
  onAssignChange: (empId: string) => void;
  onToggleFixed: () => void;
  onRemove: () => void;
  preference: AssignPreference | '';
  onPreferenceChange: (p: AssignPreference) => void;
  onAutoAssign: () => void;
}

function SortableSkillRow({
  skill, gridCols, showPersonColumn, isPM, employees, rowComplete,
  getEmployeeAvailability, onAssignChange, onToggleFixed, onRemove,
  preference, onPreferenceChange, onAutoAssign,
}: SortableSkillRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const isEmpty = !skill.assignedEmployeeId && !skill.fixed;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, gridTemplateColumns: gridCols }}
      className="grid gap-3 items-center bg-background rounded-md px-3 py-2 text-sm"
    >
      <button
        type="button"
        className="flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="font-medium text-foreground">{skill.skillName}</span>
      <Badge variant="outline" className="text-xs font-mono w-fit">Lv.{skill.level}</Badge>
      <span className="text-xs text-muted-foreground font-mono">{skill.startDate} – {skill.endDate}</span>
      <span className="text-xs text-muted-foreground font-mono">
        {typeof skill.capacityOnProject === 'number' ? skill.capacityOnProject.toFixed(2) : '—'}
      </span>
      {showPersonColumn && (
        <div className="flex items-center gap-1">
          {isPM ? (
            <Select
              value={skill.assignedEmployeeId || '_none'}
              onValueChange={onAssignChange}
              disabled={!rowComplete}
            >
              <SelectTrigger className={cn("h-7 text-xs bg-card w-full", !rowComplete && "opacity-50 cursor-not-allowed")}>
                <SelectValue placeholder="Assign..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Unassigned</SelectItem>
                {employees.map(emp => {
                  const availability = getEmployeeAvailability(emp, skill);
                  return (
                    <SelectItem key={emp.id} value={emp.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          availability === 'available' ? 'bg-primary' : 'bg-destructive'
                        )} />
                        {emp.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : skill.assignedEmployeeName ? (
            <span className="flex items-center gap-1 text-xs text-primary">
              <User className="w-3 h-3" />
              {skill.assignedEmployeeName}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Unassigned</span>
          )}
        </div>
      )}
      <div className="flex gap-1 justify-end">
        {isPM && isEmpty && rowComplete && (
          <>
            <Select value={preference} onValueChange={(v) => onPreferenceChange(v as AssignPreference)}>
              <SelectTrigger className="h-6 text-xs bg-card w-[110px] px-2">
                <SelectValue placeholder="Pref…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cost">Min Cost</SelectItem>
                <SelectItem value="capacity">Max Capacity</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={!preference}
              onClick={onAutoAssign}
              title={preference ? 'Auto-assign optimal employee' : 'Select preference first'}
            >
              <Calculator className="w-3 h-3" />
            </Button>
          </>
        )}
        {isPM && (
          <>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggleFixed}>
              {skill.fixed ? <Lock className="w-3 h-3 text-warning" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={onRemove}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
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
