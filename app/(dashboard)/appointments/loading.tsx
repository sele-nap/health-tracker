export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-9 w-52 rounded-lg bg-muted/40" />
          <div className="h-4 w-24 rounded bg-muted/30" />
        </div>
        <div className="h-9 w-20 rounded-lg bg-muted/40" />
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-20 rounded bg-muted/30" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="h-6 w-56 rounded bg-muted/40" />
                <div className="h-5 w-20 rounded-full bg-muted/30" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-40 rounded bg-muted/30" />
                <div className="h-3 w-28 rounded bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
