import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-sm px-6">
        <p className="text-6xl">🌿</p>
        <div className="space-y-2">
          <h1 className="font-heading italic text-3xl text-foreground">Page not found</h1>
          <p className="text-muted-foreground text-sm">
            This page doesn't exist or may have moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
