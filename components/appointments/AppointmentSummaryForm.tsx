"use client";

import { useActionState, useState } from "react";
import { saveAppointmentSummary } from "@/server/actions/appointments";
import type { AppointmentSummaryState } from "@/server/actions/appointments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialState: AppointmentSummaryState = {};

type Props = {
  appointmentId: string;
  existingSummary: string | null;
};

export function AppointmentSummaryForm({ appointmentId, existingSummary }: Props) {
  const [open, setOpen] = useState(false);
  const action = saveAppointmentSummary.bind(null, appointmentId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (!open && !state.success) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-primary hover:underline underline-offset-4 transition-colors"
      >
        {existingSummary ? "Edit summary" : "+ Add visit summary"}
      </button>
    );
  }

  if (state.success) {
    return (
      <p className="text-xs text-primary/80 italic">Summary saved.</p>
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
        placeholder="What was discussed, next steps, prescriptions changed…"
        rows={3}
        className={cn("text-sm", state.errors?.summary && "border-destructive")}
      />
      {state.errors?.summary && (
        <p className="text-xs text-destructive">{state.errors.summary[0]}</p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
