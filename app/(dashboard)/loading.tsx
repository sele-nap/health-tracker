export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-9 w-64 rounded-lg bg-muted/40" />
        <div className="h-4 w-48 rounded bg-muted/30" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="h-3 w-24 rounded bg-muted/40" />
            <div className="h-8 w-12 rounded bg-muted/40" />
            <div className="h-3 w-28 rounded bg-muted/30" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 space-y-3"
          >
            <div className="h-5 w-36 rounded bg-muted/40" />
            <div className="h-4 w-full rounded bg-muted/30" />
            <div className="h-9 w-32 rounded-lg bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
