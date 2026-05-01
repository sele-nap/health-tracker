/* eslint-disable @next/next/no-html-link-for-pages */
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
import { MEDICATION_FORMS } from '@/lib/validations/medications';
import {
  createMedication,
  type MedicationState,
} from '@/server/actions/medications';
import { useActionState } from 'react';

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const initialState: MedicationState = {};

export function MedicationForm() {
  const { tr } = useLocale();
  const [state, formAction, pending] = useActionState(
    createMedication,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.errors?._form && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          {state.errors._form[0]}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{tr.medications.nameLabel}</Label>
          <Input
            id="name"
            name="name"
            placeholder={tr.medications.namePlaceholder}
            className={cn(state.errors?.name && 'border-destructive')}
          />
          {state.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dosage">{tr.medications.dosageLabel}</Label>
          <Input
            id="dosage"
            name="dosage"
            placeholder={tr.medications.dosagePlaceholder}
            className={cn(state.errors?.dosage && 'border-destructive')}
          />
          {state.errors?.dosage && (
            <p className="text-xs text-destructive">{state.errors.dosage[0]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="form">{tr.medications.formLabel}</Label>
          <Select name="form">
            <SelectTrigger id="form" className="w-full">
              <SelectValue placeholder={tr.medications.formPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {MEDICATION_FORMS.map((f) => (
                <SelectItem key={f} value={f}>
                  {tr.medications.forms[f] ?? f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.form && (
            <p className="text-xs text-destructive">{state.errors.form[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prescribedBy">
            {tr.medications.prescribedByLabel}
          </Label>
          <Input
            id="prescribedBy"
            name="prescribedBy"
            placeholder={tr.medications.prescribedByPlaceholder}
            className={cn(state.errors?.prescribedBy && 'border-destructive')}
          />
          {state.errors?.prescribedBy && (
            <p className="text-xs text-destructive">
              {state.errors.prescribedBy[0]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">{tr.medications.startDateLabel}</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={todayString()}
            className={cn(state.errors?.startDate && 'border-destructive')}
          />
          {state.errors?.startDate && (
            <p className="text-xs text-destructive">
              {state.errors.startDate[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">
            {tr.medications.endDateLabel}{' '}
            <span className="text-muted-foreground font-normal text-xs">
              {tr.optional}
            </span>
          </Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            className={cn(state.errors?.endDate && 'border-destructive')}
          />
          {state.errors?.endDate && (
            <p className="text-xs text-destructive">
              {state.errors.endDate[0]}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">
          {tr.medications.instructionsLabel}{' '}
          <span className="text-muted-foreground font-normal text-xs">
            {tr.optional}
          </span>
        </Label>
        <Textarea
          id="instructions"
          name="instructions"
          placeholder={tr.medications.instructionsPlaceholder}
          rows={3}
          className={cn(state.errors?.instructions && 'border-destructive')}
        />
        {state.errors?.instructions && (
          <p className="text-xs text-destructive">
            {state.errors.instructions[0]}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? tr.saving : tr.medications.addBtn}
        </Button>
        <a
          href="/medications"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {tr.cancel}
        </a>
      </div>
    </form>
  );
}
