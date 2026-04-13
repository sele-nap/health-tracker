"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAppointmentStatus } from "@/server/actions/appointments";

type Status = "COMPLETED" | "CANCELLED" | "RESCHEDULED" | "UPCOMING";

type Action = {
  label: string;
  status: Status;
  className: string;
};

const ACTIONS_FOR: Record<string, Action[]> = {
  UPCOMING: [
    {
      label: "Mark completed",
      status: "COMPLETED",
      className:
        "text-xs px-2.5 py-1 rounded-md border border-primary/40 text-primary hover:bg-primary/10 transition-colors",
    },
    {
      label: "Cancel",
      status: "CANCELLED",
      className:
        "text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors",
    },
  ],
  COMPLETED: [
    {
      label: "Reopen",
      status: "UPCOMING",
      className:
        "text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors",
    },
  ],
  CANCELLED: [
    {
      label: "Reopen",
      status: "UPCOMING",
      className:
        "text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors",
    },
  ],
  RESCHEDULED: [
    {
      label: "Mark completed",
      status: "COMPLETED",
      className:
        "text-xs px-2.5 py-1 rounded-md border border-primary/40 text-primary hover:bg-primary/10 transition-colors",
    },
  ],
};

type Props = {
  appointmentId: string;
  currentStatus: string;
};

export function AppointmentStatusButton({ appointmentId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const actions = ACTIONS_FOR[currentStatus] ?? [];

  if (actions.length === 0) return null;

  function handleClick(status: Status) {
    startTransition(async () => {
      await updateAppointmentStatus(appointmentId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => (
        <button
          key={action.status}
          onClick={() => handleClick(action.status)}
          disabled={pending}
          className={action.className + (pending ? " opacity-50 cursor-not-allowed" : "")}
        >
          {pending ? "…" : action.label}
        </button>
      ))}
    </div>
  );
}
