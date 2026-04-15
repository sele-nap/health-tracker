"use client";

import { useState, useTransition } from "react";
import { Bell, BellOff, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createReminderSchedule,
  deleteReminderSchedule,
  toggleReminderEnabled,
} from "@/server/actions/reminders";
import { useLocale } from "@/components/providers/LocaleProvider";

export type ReminderSchedule = {
  id: string;
  frequency: string;
  times: string[];
  daysOfWeek: number[];
  reminderEnabled: boolean;
};

type Props = {
  medicationId: string;
  schedules: ReminderSchedule[];
};

const DAY_INDICES = [0, 1, 2, 3, 4, 5, 6];

export function ReminderScheduleSection({ medicationId, schedules }: Props) {
  const { tr } = useLocale();
  const rtr = tr.reminders;
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [error, setError] = useState<string | null>(null);

  function addTime() {
    if (times.length < 4) setTimes((prev) => [...prev, "08:00"]);
  }

  function removeTime(i: number) {
    setTimes((prev) => prev.filter((_, j) => j !== i));
  }

  function updateTime(i: number, value: string) {
    setTimes((prev) => prev.map((t, j) => (j === i ? value : t)));
  }

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (times.length === 0) {
      setError("Add at least one time.");
      return;
    }
    if (frequency === "weekly" && daysOfWeek.length === 0) {
      setError("Select at least one day.");
      return;
    }
    startTransition(async () => {
      try {
        await createReminderSchedule(medicationId, frequency, times, daysOfWeek);
        setShowForm(false);
        setTimes(["08:00"]);
        setDaysOfWeek([1, 2, 3, 4, 5]);
        setFrequency("daily");
      } catch {
        setError("Failed to save reminder.");
      }
    });
  }

  function handleDelete(scheduleId: string) {
    if (!confirm(rtr.deleteConfirm)) return;
    startTransition(async () => {
      try {
        await deleteReminderSchedule(scheduleId, medicationId);
      } catch {}
    });
  }

  function handleToggle(scheduleId: string) {
    startTransition(async () => {
      try {
        await toggleReminderEnabled(scheduleId, medicationId);
      } catch {}
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {rtr.sectionTitle}
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-primary hover:opacity-80 transition-opacity flex items-center gap-1"
          >
            <Plus size={13} />
            {rtr.add}
          </button>
        )}
      </div>

      {schedules.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">{rtr.noReminders}</p>
      )}

      <div className="space-y-2">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg bg-card border border-border text-sm"
          >
            <div className="space-y-0.5 min-w-0">
              <p className="font-medium">
                {s.frequency === "daily" ? rtr.daily : rtr.weekly}
                {" · "}
                {s.times.join(", ")}
              </p>
              {s.frequency === "weekly" && s.daysOfWeek.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {[...s.daysOfWeek].sort((a, b) => a - b).map((d) => rtr.days[d]).join(", ")}
                </p>
              )}
              <p className="text-xs text-muted-foreground/70">{rtr.setupNote}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleToggle(s.id)}
                disabled={isPending}
                title={rtr.toggle}
                className={cn(
                  "p-1.5 rounded-md border transition-colors",
                  s.reminderEnabled
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {s.reminderEnabled ? <Bell size={13} /> : <BellOff size={13} />}
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                disabled={isPending}
                title={rtr.delete}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl border border-border bg-card space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{rtr.add}</p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">{rtr.frequencyLabel}</p>
            <div className="flex rounded-lg border border-border overflow-hidden text-sm w-fit">
              {(["daily", "weekly"] as const).map((f, i) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "px-3 py-1.5 transition-colors",
                    i > 0 && "border-l border-border",
                    frequency === f
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {f === "daily" ? rtr.daily : rtr.weekly}
                </button>
              ))}
            </div>
          </div>

          {frequency === "weekly" && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{rtr.daysLabel}</p>
              <div className="flex gap-1 flex-wrap">
                {DAY_INDICES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={cn(
                      "w-9 h-9 rounded-lg text-xs border transition-colors",
                      daysOfWeek.includes(d)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {rtr.days[d]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">{rtr.timesLabel}</p>
            <div className="space-y-2">
              {times.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={t}
                    onChange={(e) => updateTime(i, e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {times.length < 4 && (
                <button
                  type="button"
                  onClick={addTime}
                  className="text-xs text-primary hover:opacity-80 transition-opacity"
                >
                  {rtr.addTime}
                </button>
              )}
            </div>
          </div>

          <Button type="submit" size="sm" disabled={isPending}>
            {rtr.save}
          </Button>
        </form>
      )}
    </div>
  );
}
