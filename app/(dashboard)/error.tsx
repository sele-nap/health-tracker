"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { tr } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto mt-16 text-center space-y-6">
      <div className="space-y-2">
        <p className="text-4xl">🌿</p>
        <h2 className="font-heading italic text-2xl text-foreground">{tr.error.title}</h2>
        <p className="text-muted-foreground text-sm">{tr.error.description}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">ref: {error.digest}</p>
        )}
      </div>
      <Button onClick={unstable_retry} variant="outline">
        {tr.error.retry}
      </Button>
    </div>
  );
}
