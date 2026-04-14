"use client";

import { useActionState, useState } from "react";
import { saveAppointmentSummary } from "@/server/actions/appointments";
import type { AppointmentSummaryState } from "@/server/actions/appointments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

const initialState: AppointmentSummaryState = {};

type Props = {
  appointmentId: string;
  existingSummary: string | null;
};

export function AppointmentSummaryForm({ appointmentId, existingSummary }: Props) {
  const { tr } = useLocale();
  const [open, setOpen] = useState(false);
  const action = saveAppointmentSummary.bind(null, appointmentId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (!open && !state.success) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-primary hover:underline underline-offset-4 transition-colors"
      >
        {existingSummary ? tr.appointments.editSummary : tr.appointments.addSummary}
      </button>
    );
  }

  if (state.success) {
    return (
      <p className="text-xs text-primary/80 italic">{tr.appointments.summarySaved}</p>
    );
  }

  return (
    <form action={formAction} className="space-y-2 pt-1">
      {state.errors?._form && (
        <p className="text-xs text-destructive">{state.errors._form[0]}</p>
      )}
      <Textarea
        name="summary"
        defaultValue={existingSummary ?? ""}
        placeholder={tr.appointments.summaryPlaceholder}
        rows={3}
        className={cn("text-sm", state.errors?.summary && "border-destructive")}
      />
      {state.errors?.summary && (
        <p className="text-xs text-destructive">{state.errors.summary[0]}</p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? tr.saving : tr.save}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {tr.cancel}
        </button>
      </div>
    </form>
  );
}
