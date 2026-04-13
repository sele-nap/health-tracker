"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAppointment, deleteAppointment, type AppointmentState } from "@/server/actions/appointments";
import { SPECIALTIES } from "@/lib/validations/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AppointmentData = {
  id: string;
  title: string;
  doctorName: string;
  specialty: string;
  location: string;
  scheduledAt: string;
  durationMin: number | null;
  purpose: string;
};

const initialState: AppointmentState = {};

export function AppointmentEditForm({ appointment }: { appointment: AppointmentData }) {
  const action = updateAppointment.bind(null, appointment.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [delPending, startDelete] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete "${appointment.title}"? This cannot be undone.`)) return;
    startDelete(async () => {
      await deleteAppointment(appointment.id);
      router.push("/appointments");
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.errors?._form && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          {state.errors._form[0]}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={appointment.title}
          className={cn(state.errors?.title && "border-destructive")}
        />
        {state.errors?.title && (
          <p className="text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doctorName">
            Doctor{" "}
            <span className="text-muted-foreground font-normal text-xs">(optional)</span>
          </Label>
          <Input
            id="doctorName"
            name="doctorName"
            defaultValue={appointment.doctorName}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty">
            Specialty{" "}
            <span className="text-muted-foreground font-normal text-xs">(optional)</span>
          </Label>
          <Select name="specialty" defaultValue={appointment.specialty || undefined}>
            <SelectTrigger id="specialty" className="w-full">
              <SelectValue placeholder="Select specialty…" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Date &amp; time</Label>
          <Input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            defaultValue={appointment.scheduledAt}
            className={cn(state.errors?.scheduledAt && "border-destructive")}
          />
          {state.errors?.scheduledAt && (
            <p className="text-xs text-destructive">{state.errors.scheduledAt[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMin">
            Duration (min){" "}
            <span className="text-muted-foreground font-normal text-xs">(optional)</span>
          </Label>
          <Input
            id="durationMin"
            name="durationMin"
            type="number"
            min={1}
            max={480}
            defaultValue={appointment.durationMin ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">
          Location{" "}
          <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        </Label>
        <Input
          id="location"
          name="location"
          defaultValue={appointment.location}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">
          Purpose{" "}
          <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        </Label>
        <Textarea
          id="purpose"
          name="purpose"
          defaultValue={appointment.purpose}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={pending || delPending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
          <a
            href="/appointments"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </a>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending || delPending}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          {delPending ? "Deleting…" : "Delete appointment"}
        </button>
      </div>
    </form>
  );
}
