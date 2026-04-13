"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto mt-16 text-center space-y-6">
      <div className="space-y-2">
        <p className="text-4xl">🌿</p>
        <h2 className="font-heading italic text-2xl text-foreground">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          An unexpected error occurred. You can try again or come back later.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">ref: {error.digest}</p>
        )}
      </div>
      <Button onClick={unstable_retry} variant="outline">
        Try again
      </Button>
    </div>
  );
}
