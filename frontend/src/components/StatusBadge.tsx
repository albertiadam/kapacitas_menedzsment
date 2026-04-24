import type { ProjectStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  planned:   { label: 'Planned',   className: 'bg-muted text-muted-foreground border-border' },
  ongoing:   { label: 'Ongoing',   className: 'bg-primary/15 text-primary border-primary/30' },
  completed: { label: 'Completed', className: 'bg-accent text-accent-foreground border-border' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  on_hold:   { label: 'On Hold',   className: 'bg-warning/15 text-warning border-warning/30' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={cn('text-xs font-mono', config.className)}>
      {config.label}
    </Badge>
  );
}
