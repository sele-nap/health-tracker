'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { SPECIALTIES } from '@/lib/validations/appointments';
import {
  createAppointment,
  type AppointmentState,
} from '@/server/actions/appointments';
import { useActionState } from 'react';

function defaultDateTimeLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

const initialState: AppointmentState = {};

export function AppointmentForm() {
  const { tr } = useLocale();
  const [state, formAction, pending] = useActionState(
    createAppointment,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.errors?._form && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          {state.errors._form[0]}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">{tr.appointments.titleLabel}</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Rheumatology follow-up"
          className={cn(state.errors?.title && 'border-destructive')}
        />
        {state.errors?.title && (
          <p className="text-xs text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="doctorName">
            {tr.appointments.doctorLabel}{' '}
            <span className="text-muted-foreground font-normal text-xs">
              {tr.optional}
            </span>
          </Label>
          <Input
            id="doctorName"
            name="doctorName"
            placeholder="e.g. Dr. Dubois"
            className={cn(state.errors?.doctorName && 'border-destructive')}
          />
          {state.errors?.doctorName && (
            <p className="text-xs text-destructive">
              {state.errors.doctorName[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty">
            {tr.appointments.specialtyLabel}{' '}
            <span className="text-muted-foreground font-normal text-xs">
              {tr.optional}
            </span>
          </Label>
          <Select name="specialty">
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
          {state.errors?.specialty && (
            <p className="text-xs text-destructive">
              {state.errors.specialty[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduledAt">{tr.appointments.dateTimeLabel}</Label>
          <Input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            defaultValue={defaultDateTimeLocal()}
            className={cn(state.errors?.scheduledAt && 'border-destructive')}
          />
          {state.errors?.scheduledAt && (
            <p className="text-xs text-destructive">
              {state.errors.scheduledAt[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMin">
            {tr.appointments.durationLabel}{' '}
            <span className="text-muted-foreground font-normal text-xs">
              {tr.optional}
            </span>
          </Label>
          <Input
            id="durationMin"
            name="durationMin"
            type="number"
            min={1}
            max={480}
            placeholder="e.g. 30"
            className={cn(
              'w-full',
              state.errors?.durationMin && 'border-destructive',
            )}
          />
          {state.errors?.durationMin && (
            <p className="text-xs text-destructive">
              {state.errors.durationMin[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">
          {tr.appointments.locationLabel}{' '}
          <span className="text-muted-foreground font-normal text-xs">
            {tr.optional}
          </span>
        </Label>
        <Input
          id="location"
          name="location"
          placeholder="e.g. Paris Hospital, Room 12"
          className={cn(state.errors?.location && 'border-destructive')}
        />
        {state.errors?.location && (
          <p className="text-xs text-destructive">{state.errors.location[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">
          {tr.appointments.purposeLabel}{' '}
          <span className="text-muted-foreground font-normal text-xs">
            {tr.optional}
          </span>
        </Label>
        <Textarea
          id="purpose"
          name="purpose"
          placeholder="What you want to discuss or check…"
          rows={3}
          className={cn(state.errors?.purpose && 'border-destructive')}
        />
        {state.errors?.purpose && (
          <p className="text-xs text-destructive">{state.errors.purpose[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? tr.saving : tr.appointments.addBtn}
        </Button>
        <a
          href="/appointments"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {tr.cancel}
        </a>
      </div>
    </form>
  );
}
