"use client";

import { useTransition } from "react";
import { deleteSymptomLog } from "@/server/actions/symptoms";

export function DeleteSymptomLogButton({ logId }: { logId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this log entry?")) return;
    startTransition(async () => {
      await deleteSymptomLog(logId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
