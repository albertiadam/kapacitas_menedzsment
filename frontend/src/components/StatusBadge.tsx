import { ProjectStatus } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<ProjectStatus, string> = {
  Planned: 'bg-muted text-muted-foreground border-border',
  Ongoing: 'bg-primary/15 text-primary border-primary/30',
  Completed: 'bg-accent text-accent-foreground border-border',
  Cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
  'On Hold': 'bg-warning/15 text-warning border-warning/30',
  // legacy aliases
  Canceled: 'bg-destructive/15 text-destructive border-destructive/30',
  Finished: 'bg-accent text-accent-foreground border-border',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className={cn('text-xs font-mono', statusStyles[status])}>
      {status}
    </Badge>
  );
}
