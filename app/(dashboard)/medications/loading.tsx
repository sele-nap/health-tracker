export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-9 w-44 rounded-lg bg-muted/40" />
          <div className="h-4 w-24 rounded bg-muted/30" />
        </div>
        <div className="h-9 w-20 rounded-lg bg-muted/40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 rounded bg-muted/40" />
              <div className="flex gap-2">
                <div className="h-5 w-14 rounded-full bg-muted/30" />
                <div className="h-5 w-24 rounded-md bg-muted/30" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-32 rounded bg-muted/30" />
              <div className="h-3 w-44 rounded bg-muted/30" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
