export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-9 w-36 rounded-lg bg-muted/40" />
          <div className="h-4 w-40 rounded bg-muted/30" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-muted/40" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 space-y-2"
          >
            <div className="h-3 w-20 rounded bg-muted/30" />
            <div className="h-7 w-12 rounded bg-muted/40" />
          </div>
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="h-6 w-48 rounded bg-muted/40" />
          <div className="h-60 w-full rounded-lg bg-muted/20" />
        </div>
      ))}
    </div>
  );
}
