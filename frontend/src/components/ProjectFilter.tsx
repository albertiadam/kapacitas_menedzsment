import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Project, ProjectStatus, EMPLOYEES } from '@/data/mockData';

type FilterLabel =
  | 'shortName' | 'name' | 'status' | 'pmNames'
  | 'startDate' | 'progress' | 'endDate' | 'overallCapacity';

interface FilterConditionDef {
  label: string;
  conditions: { value: string; label: string }[];
  paramType: 'text' | 'status' | 'pmSelect' | 'date' | 'number';
}

const FILTER_DEFS: Record<FilterLabel, FilterConditionDef> = {
  shortName: { label: 'Project short name', conditions: [{ value: 'exactly', label: 'exactly' }, { value: 'contains', label: 'contains' }, { value: 'empty', label: 'empty' }, { value: 'notEmpty', label: 'not empty' }], paramType: 'text' },
  name: { label: 'Project name', conditions: [{ value: 'exactly', label: 'exactly' }, { value: 'contains', label: 'contains' }, { value: 'empty', label: 'empty' }, { value: 'notEmpty', label: 'not empty' }], paramType: 'text' },
  status: { label: 'Project status', conditions: [{ value: 'exactly', label: 'exactly' }, { value: 'isNot', label: 'is not' }], paramType: 'status' },
  pmNames: { label: 'Project Manager(s)', conditions: [{ value: 'exactly', label: 'exactly' }, { value: 'contains', label: 'contains' }, { value: 'isNot', label: 'is not' }], paramType: 'pmSelect' },
  startDate: { label: 'Project start', conditions: [{ value: 'matches', label: 'matches' }, { value: 'earlier', label: 'earlier than' }, { value: 'later', label: 'later than' }], paramType: 'date' },
  progress: { label: 'Project progress bar', conditions: [{ value: 'equal', label: 'equal' }, { value: 'notEqual', label: 'not equal' }, { value: 'less', label: 'less than' }, { value: 'greater', label: 'greater than' }], paramType: 'number' },
  endDate: { label: 'Project end', conditions: [{ value: 'matches', label: 'matches' }, { value: 'earlier', label: 'earlier than' }, { value: 'later', label: 'later than' }], paramType: 'date' },
  overallCapacity: { label: 'Project overall capacity', conditions: [{ value: 'equal', label: 'equal' }, { value: 'notEqual', label: 'not equal' }, { value: 'less', label: 'less than' }, { value: 'greater', label: 'greater than' }], paramType: 'number' },
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
  hidePM?: boolean;
}

const STATUSES: ProjectStatus[] = ['Planned', 'Ongoing', 'Canceled', 'Finished'];

export function ProjectFilter({ filters, onChange, hidePM }: Props) {
  const addRow = () => {
    onChange([...filters, { id: `f${Date.now()}`, label: 'name', condition: 'contains', parameter: '' }]);
  };

  const updateRow = (id: string, updates: Partial<FilterRow>) => {
    onChange(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeRow = (id: string) => {
    onChange(filters.filter(f => f.id !== id));
  };

  const labels = Object.entries(FILTER_DEFS)
    .filter(([key]) => !(hidePM && key === 'pmNames'))
    .map(([key, def]) => ({ value: key as FilterLabel, label: def.label }));

  return (
    <div className="space-y-2 p-3 bg-card border border-border rounded-lg animate-fade-in">
      {filters.map((row) => {
        const def = FILTER_DEFS[row.label];
        const needsParam = !['empty', 'notEmpty'].includes(row.condition);

        return (
          <div key={row.id} className="flex items-center gap-2">
            <Select value={row.label} onValueChange={(v) => {
              const newDef = FILTER_DEFS[v as FilterLabel];
              updateRow(row.id, { label: v as FilterLabel, condition: newDef.conditions[0].value, parameter: '' });
            }}>
              <SelectTrigger className="w-44 h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {labels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={row.condition} onValueChange={(v) => updateRow(row.id, { condition: v })}>
              <SelectTrigger className="w-32 h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {def.conditions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {needsParam && (
              <>
                {def.paramType === 'text' && (
                  <Input value={row.parameter} onChange={e => updateRow(row.id, { parameter: e.target.value })} className="h-8 text-xs bg-background flex-1 max-w-48" placeholder="Value..." />
                )}
                {def.paramType === 'number' && (
                  <Input type="number" value={row.parameter} onChange={e => updateRow(row.id, { parameter: e.target.value })} className="h-8 text-xs bg-background w-28" placeholder="0" />
                )}
                {def.paramType === 'status' && (
                  <Select value={row.parameter} onValueChange={v => updateRow(row.id, { parameter: v })}>
                    <SelectTrigger className="w-32 h-8 text-xs bg-background">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                {def.paramType === 'pmSelect' && (
                  <Input value={row.parameter} onChange={e => updateRow(row.id, { parameter: e.target.value })} className="h-8 text-xs bg-background flex-1 max-w-48" placeholder="PM name..." />
                )}
                {def.paramType === 'date' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("h-8 text-xs w-36 justify-start", !row.parameter && "text-muted-foreground")}>
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {row.parameter || 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={row.parameter ? new Date(row.parameter) : undefined}
                        onSelect={(d) => updateRow(row.id, { parameter: d ? format(d, 'yyyy-MM-dd') : '' })}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </>
            )}

            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeRow(row.id)}>
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

export function applyFilters(projects: Project[], filters: FilterRow[]): Project[] {
  return projects.filter(project => {
    return filters.every(f => {
      const def = FILTER_DEFS[f.label];
      if (!def) return true;

      if (f.condition === 'empty') {
        const val = getFieldValue(project, f.label);
        return !val || val === '0';
      }
      if (f.condition === 'notEmpty') {
        const val = getFieldValue(project, f.label);
        return val && val !== '0';
      }

      const param = f.parameter;
      if (!param) return true;

      switch (def.paramType) {
        case 'text':
        case 'pmSelect': {
          const val = getFieldValue(project, f.label).toLowerCase();
          const p = param.toLowerCase();
          if (f.condition === 'exactly') return val === p;
          if (f.condition === 'contains') return val.includes(p);
          if (f.condition === 'isNot') return val !== p;
          return true;
        }
        case 'status': {
          const val = project.status;
          if (f.condition === 'exactly') return val === param;
          if (f.condition === 'isNot') return val !== param;
          return true;
        }
        case 'date': {
          const val = getFieldValue(project, f.label);
          if (f.condition === 'matches') return val === param;
          if (f.condition === 'earlier') return val < param;
          if (f.condition === 'later') return val > param;
          return true;
        }
        case 'number': {
          const val = Number(getFieldValue(project, f.label));
          const p = Number(param);
          if (f.condition === 'equal') return val === p;
          if (f.condition === 'notEqual') return val !== p;
          if (f.condition === 'less') return val < p;
          if (f.condition === 'greater') return val > p;
          return true;
        }
      }
      return true;
    });
  });
}

function getFieldValue(project: Project, label: FilterLabel): string {
  switch (label) {
    case 'shortName': return project.shortName;
    case 'name': return project.name;
    case 'status': return project.status;
    case 'pmNames': return project.pmNames.join(', ');
    case 'startDate': return project.startDate;
    case 'progress': return String(project.progress);
    case 'endDate': return project.endDate;
    case 'overallCapacity': return String(project.overallCapacity);
    default: return '';
  }
}
