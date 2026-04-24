import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectFilter, FilterRow, applyFilters } from '@/components/ProjectFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowUpDown, Search, Filter } from 'lucide-react';
import type { Project } from '@/types';

type SortColumn = 'short_name' | 'name' | 'status' | 'start' | 'end';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<string, number> = {
  ongoing: 0, planned: 1, on_hold: 2, completed: 3, cancelled: 4,
};

function defaultSort(a: Project, b: Project) {
  const oa = STATUS_ORDER[a.status] ?? 9;
  const ob = STATUS_ORDER[b.status] ?? 9;
  if (oa !== ob) return oa - ob;
  return String(a.end).localeCompare(String(b.end));
}

function getSortValue(p: Project, col: SortColumn): string {
  const v = p[col];
  return String(v ?? '').slice(0, 10);
}

export default function ProjectsPage() {
  const { isManager } = useAuth();
  const { projects, projectSkillEmployees } = useData();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<SortColumn | 'default'>('default');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterRow[]>([]);

  let filtered = [...projects];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      p => p.name.toLowerCase().includes(q) || p.short_name.toLowerCase().includes(q),
    );
  }

  if (filters.length > 0) {
    filtered = applyFilters(filtered, filters);
  }

  if (sortCol === 'default') {
    filtered = filtered.sort(defaultSort);
  } else {
    filtered = filtered.sort((a, b) => {
      const cmp = getSortValue(a, sortCol).localeCompare(getSortValue(b, sortCol));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  const sortColumns = [
    { value: 'default', label: 'Default' },
    { value: 'short_name', label: 'Short Name' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'start', label: 'Start' },
    { value: 'end', label: 'End' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isManager && (
          <Button onClick={() => navigate('/projects/new')} size="sm">
            <Plus className="w-4 h-4 mr-1" /> New Project
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border h-9"
          />
        </div>

        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="h-9"
        >
          <Filter className="w-4 h-4 mr-1" /> Filter{' '}
          {filters.length > 0 && `(${filters.length})`}
        </Button>

        <Select
          value={sortCol}
          onValueChange={v => setSortCol(v as SortColumn | 'default')}
        >
          <SelectTrigger className="w-36 h-9 bg-card text-xs">
            <ArrowUpDown className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortColumns.map(c => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {sortCol !== 'default' && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2"
            onClick={() => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))}
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="mb-4">
          <ProjectFilter filters={filters} onChange={setFilters} />
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            projectSkillEmployees={projectSkillEmployees.filter(
              pse => pse.project_id === project.id,
            )}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No projects found
          </div>
        )}
      </div>
    </div>
  );
}
