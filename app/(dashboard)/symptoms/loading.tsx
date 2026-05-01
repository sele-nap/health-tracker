export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 rounded-lg bg-muted/40" />
          <div className="h-4 w-32 rounded bg-muted/30" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-muted/40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-4 w-36 rounded bg-muted/40" />
              <div className="h-6 w-6 rounded-full bg-muted/30" />
            </div>
            <div className="flex gap-6">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-3 w-16 rounded bg-muted/30" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
