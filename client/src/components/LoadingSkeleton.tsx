/* Career Canvas: Minimal loading states */
import { Loader2 } from 'lucide-react';

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border p-6 space-y-4">
      <div className="h-5 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-muted rounded-full w-16" />
        <div className="h-6 bg-muted rounded-full w-20" />
        <div className="h-6 bg-muted rounded-full w-14" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function AIThinking({ text = 'AI анализирует...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
      <span className="text-sm text-primary font-medium">{text}</span>
    </div>
  );
}
