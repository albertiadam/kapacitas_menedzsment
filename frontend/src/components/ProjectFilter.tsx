import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Project, ProjectStatus } from '@/types';

type FilterLabel = 'short_name' | 'name' | 'status' | 'start' | 'end';

interface FilterConditionDef {
  label: string;
  conditions: { value: string; label: string }[];
  paramType: 'text' | 'status' | 'date';
}

const FILTER_DEFS: Record<FilterLabel, FilterConditionDef> = {
  short_name: {
    label: 'Short name',
    conditions: [{ value: 'contains', label: 'contains' }, { value: 'exactly', label: 'exactly' }],
    paramType: 'text',
  },
  name: {
    label: 'Project name',
    conditions: [{ value: 'contains', label: 'contains' }, { value: 'exactly', label: 'exactly' }],
    paramType: 'text',
  },
  status: {
    label: 'Status',
    conditions: [{ value: 'exactly', label: 'exactly' }, { value: 'isNot', label: 'is not' }],
    paramType: 'status',
  },
  start: {
    label: 'Start date',
    conditions: [
      { value: 'matches', label: 'matches' },
      { value: 'earlier', label: 'earlier than' },
      { value: 'later', label: 'later than' },
    ],
    paramType: 'date',
  },
  end: {
    label: 'End date',
    conditions: [
      { value: 'matches', label: 'matches' },
      { value: 'earlier', label: 'earlier than' },
      { value: 'later', label: 'later than' },
    ],
    paramType: 'date',
  },
};

export interface FilterRow {
  id: string;
  label: FilterLabel;
  condition: string;
  parameter: string;
}

interface Props {
  filters: FilterRow[];
  onChange: (filters: FilterRow[]) => void;
}

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' },
];

export function ProjectFilter({ filters, onChange }: Props) {
  const addRow = () => {
    onChange([
      ...filters,
      { id: `f${Date.now()}`, label: 'name', condition: 'contains', parameter: '' },
    ]);
  };

  const updateRow = (id: string, updates: Partial<FilterRow>) => {
    onChange(filters.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeRow = (id: string) => {
    onChange(filters.filter(f => f.id !== id));
  };

  const labels = Object.entries(FILTER_DEFS).map(([key, def]) => ({
    value: key as FilterLabel,
    label: def.label,
  }));

  return (
    <div className="space-y-2 p-3 bg-card border border-border rounded-lg animate-fade-in">
      {filters.map(row => {
        const def = FILTER_DEFS[row.label];
        return (
          <div key={row.id} className="flex items-center gap-2">
            <Select
              value={row.label}
              onValueChange={v => {
                const newDef = FILTER_DEFS[v as FilterLabel];
                updateRow(row.id, {
                  label: v as FilterLabel,
                  condition: newDef.conditions[0].value,
                  parameter: '',
                });
              }}
            >
              <SelectTrigger className="w-44 h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {labels.map(l => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={row.condition}
              onValueChange={v => updateRow(row.id, { condition: v })}
            >
              <SelectTrigger className="w-32 h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {def.conditions.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {def.paramType === 'text' && (
              <Input
                value={row.parameter}
                onChange={e => updateRow(row.id, { parameter: e.target.value })}
                className="h-8 text-xs bg-background flex-1 max-w-48"
                placeholder="Value..."
              />
            )}

            {def.paramType === 'status' && (
              <Select
                value={row.parameter}
                onValueChange={v => updateRow(row.id, { parameter: v })}
              >
                <SelectTrigger className="w-36 h-8 text-xs bg-background">
                  <SelectValue placeholder="Select..." />
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

            {def.paramType === 'date' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-8 text-xs w-36 justify-start',
                      !row.parameter && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {row.parameter || 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={row.parameter ? new Date(row.parameter) : undefined}
                    onSelect={d =>
                      updateRow(row.id, { parameter: d ? format(d, 'yyyy-MM-dd') : '' })
                    }
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeRow(row.id)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      })}

      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addRow}>
        <Plus className="w-3 h-3 mr-1" /> Add Filter
      </Button>
    </div>
  );
}

function toDateStr(d: Date | string): string {
  return String(d).slice(0, 10);
}

export function applyFilters(projects: Project[], filters: FilterRow[]): Project[] {
  return projects.filter(project =>
    filters.every(f => {
      const def = FILTER_DEFS[f.label];
      if (!def) return true;
      const param = f.parameter;
      if (!param) return true;

      switch (f.label) {
        case 'short_name':
        case 'name': {
          const val = (project[f.label] ?? '').toLowerCase();
          const p = param.toLowerCase();
          if (f.condition === 'contains') return val.includes(p);
          if (f.condition === 'exactly') return val === p;
          return true;
        }
        case 'status': {
          if (f.condition === 'exactly') return project.status === param;
          if (f.condition === 'isNot') return project.status !== param;
          return true;
        }
        case 'start': {
          const val = toDateStr(project.start);
          if (f.condition === 'matches') return val === param;
          if (f.condition === 'earlier') return val < param;
          if (f.condition === 'later') return val > param;
          return true;
        }
        case 'end': {
          const val = toDateStr(project.end);
          if (f.condition === 'matches') return val === param;
          if (f.condition === 'earlier') return val < param;
          if (f.condition === 'later') return val > param;
          return true;
        }
      }
      return true;
    }),
  );
}
