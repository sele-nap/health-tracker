"use client";

import { useTransition } from "react";
import { deleteSymptomLog } from "@/server/actions/symptoms";
import { useLocale } from "@/components/providers/LocaleProvider";

export function DeleteSymptomLogButton({ logId }: { logId: string }) {
  const { tr } = useLocale();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(tr.symptoms.deleteConfirm)) return;
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
      {pending ? tr.deleting : tr.delete}
    </button>
  );
}
