"use client";

import { useTransition } from "react";
import { deleteCondition } from "@/server/actions/conditions";

type Props = {
  conditionId: string;
};

export function DeleteConditionButton({ conditionId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Remove this condition? This will also delete its symptom definitions.")) return;
    startTransition(async () => {
      await deleteCondition(conditionId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
