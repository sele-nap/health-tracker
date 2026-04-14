"use client";

import { useActionState } from "react";
import { createCondition, type ConditionState } from "@/server/actions/conditions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

const initialState: ConditionState = {};

export function ConditionForm() {
  const { tr } = useLocale();
  const [state, formAction, pending] = useActionState(createCondition, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.errors?._form && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          {state.errors._form[0]}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">{tr.conditions.nameLabel}</Label>
        <Input
          id="name"
          name="name"
          placeholder={tr.conditions.namePlaceholder}
          className={cn(state.errors?.name && "border-destructive")}
        />
        {state.errors?.name && (
          <p className="text-xs text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosedAt">
          {tr.conditions.diagnosedAtLabel}{" "}
          <span className="text-muted-foreground font-normal text-xs">{tr.optional}</span>
        </Label>
        <Input
          id="diagnosedAt"
          name="diagnosedAt"
          type="date"
          className={cn(state.errors?.diagnosedAt && "border-destructive")}
        />
        {state.errors?.diagnosedAt && (
          <p className="text-xs text-destructive">{state.errors.diagnosedAt[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? tr.saving : tr.conditions.addBtn}
        </Button>
        <a
          href="/conditions"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {tr.cancel}
        </a>
      </div>
    </form>
  );
}
