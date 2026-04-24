import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import type { ProjectStatus } from '@/types';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' },
];

export default function NewProjectPage() {
  const navigate = useNavigate();
  const { createProject, createProjectSkillEmployee, skills, employees, employeeSkills } =
    useData();

  const [step, setStep] = useState<1 | 2>(1);
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
  const [createdDates, setCreatedDates] = useState<{ start: string; end: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    short_name: '',
    description: '',
    status: 'planned' as ProjectStatus,
    start: '',
    end: '',
    fix_cost: '',
    revenue: '',
  });

  const pmSkill = skills.find(s => s.name === 'PM');

  const [pmCapacity, setPmCapacity] = useState('');
  const [pmEmployeeId, setPmEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Accepts YYYY.MM.DD → returns ISO YYYY-MM-DD or null
  const parseDottedDate = (s: string): string | null => {
    const m = s.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
    if (!m) return null;
    const [, y, mo, d] = m;
    if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return null;
    const dt = new Date(Date.UTC(+y, +mo - 1, +d));
    if (dt.getUTCMonth() !== +mo - 1 || dt.getUTCDate() !== +d) return null;
    return `${y}-${mo}-${d}`;
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Project name is required'); return; }
    if (!form.short_name.trim()) { setError('Short name is required'); return; }
    const startIso = parseDottedDate(form.start);
    const endIso = parseDottedDate(form.end);
    if (!startIso || !endIso) {
      setError('Dates must be in format YYYY.MM.DD (e.g. 2026.04.21)');
      return;
    }
    if (endIso <= startIso) { setError('End date must be after start date'); return; }

    setSubmitting(true);
    try {
      const project = await createProject({
        name: form.name.trim(),
        short_name: form.short_name.toUpperCase(),
        description: form.description,
        status: form.status,
        start: startIso,
        end: endIso,
        fix_cost: Number(form.fix_cost) || 0,
        revenue: Number(form.revenue) || 0,
      });
      setCreatedProjectId(project.id);
      setCreatedDates({ start: startIso, end: endIso });
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  // Employees who have the PM skill
  const pmEligibleEmployees = pmSkill
    ? employeeSkills
        .filter(es => es.skill_id === pmSkill.id)
        .map(es => employees.find(e => e.id === es.employee_id))
        .filter(Boolean)
    : [];

  const handleAssignPm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!createdProjectId || !pmSkill || !createdDates) return;
    const cap = Number(pmCapacity);
    if (Number.isNaN(cap) || cap <= 0 || cap > 1) {
      setError('Capacity must be a number between 0 and 1');
      return;
    }
    if (!pmEmployeeId) { setError('Please select an employee'); return; }

    setSubmitting(true);
    try {
      await createProjectSkillEmployee({
        project_id: createdProjectId,
        skill_id: pmSkill.id,
        employee_id: Number(pmEmployeeId),
        needed_proficiency: 1,
        capacity_on_project: cap,
        skill_start: createdDates.start,
        skill_end: createdDates.end,
      });
      navigate('/projects');
    } catch (err: any) {
      setError(err.message || 'Failed to assign PM');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/projects')}
        className="mb-4 text-muted-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-foreground">New Project</h1>
        <span className="text-xs text-muted-foreground">
          Step {step} of 2 — {step === 1 ? 'Project details' : 'Assign PM'}
        </span>
      </div>

      {/* ── Step 1: Project details ── */}
      {step === 1 && (
        <form
          onSubmit={handleCreateProject}
          className="space-y-5 bg-card border border-border rounded-lg p-6"
        >
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              General Info
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Project Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Short Name *</Label>
                <Input
                  value={form.short_name}
                  onChange={e => update('short_name', e.target.value)}
                  className="bg-background font-mono uppercase"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                className="bg-background"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Project Status</Label>
              <Select
                value={form.status}
                onValueChange={v => update('status', v as ProjectStatus)}
              >
                <SelectTrigger className="bg-background w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-3 pt-2 border-t border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Timeline
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Start Date *{' '}
                  <span className="text-muted-foreground/70">(YYYY.MM.DD)</span>
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="2026.04.21"
                  value={form.start}
                  onChange={e => update('start', e.target.value)}
                  className="bg-background font-mono"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  End Date *{' '}
                  <span className="text-muted-foreground/70">(YYYY.MM.DD)</span>
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="2026.12.31"
                  value={form.end}
                  onChange={e => update('end', e.target.value)}
                  className="bg-background font-mono"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-2 border-t border-border">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Financials
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Fixed Cost (HUF)</Label>
                <Input
                  type="number"
                  value={form.fix_cost}
                  onChange={e => update('fix_cost', e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Revenue (HUF)</Label>
                <Input
                  type="number"
                  value={form.revenue}
                  onChange={e => update('revenue', e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
          </section>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Continue → Assign PM'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* ── Step 2: Assign PM ── */}
      {step === 2 && createdProjectId && createdDates && (
        <form
          onSubmit={handleAssignPm}
          className="space-y-4 bg-card border border-border rounded-lg p-6"
        >
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Mandatory: assign a Project Manager
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Every project must have a PM. Choose the person and their capacity allocation.
            </p>
            {!pmSkill && (
              <p className="text-xs text-destructive mt-2">
                No "PM" skill found. Add a skill named "PM" in Resources → Skills first.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Skill</Label>
              <Input value="PM" readOnly className="bg-muted" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Level</Label>
              <Input value="Lv.1" readOnly className="bg-muted" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Start</Label>
              <Input
                value={createdDates.start.replace(/-/g, '.')}
                readOnly
                className="bg-muted font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">End</Label>
              <Input
                value={createdDates.end.replace(/-/g, '.')}
                readOnly
                className="bg-muted font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Capacity on project (0–1) *
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max="1"
                value={pmCapacity}
                onChange={e => setPmCapacity(e.target.value)}
                placeholder="e.g. 0.5"
                className="bg-background"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Assigned To *</Label>
              <Select
                value={pmEmployeeId}
                onValueChange={setPmEmployeeId}
                disabled={!pmSkill}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select person..." />
                </SelectTrigger>
                <SelectContent>
                  {pmEligibleEmployees.map(
                    emp =>
                      emp && (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.name}
                        </SelectItem>
                      ),
                  )}
                </SelectContent>
              </Select>
              {pmSkill && pmEligibleEmployees.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No employees have the PM skill assigned yet.
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={submitting || !pmSkill || pmEligibleEmployees.length === 0}
            >
              {submitting ? 'Saving…' : 'Confirm PM Assignment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/projects')}
            >
              Skip & Go to Projects
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
