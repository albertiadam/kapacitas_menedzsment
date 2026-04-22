import { Progress } from '@/components/ui/progress';

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <Progress value={value} className="h-2 flex-1 bg-muted [&>div]:bg-primary" />
      <span className="text-xs font-mono text-muted-foreground w-9 text-right">{value}%</span>
    </div>
  );
}
