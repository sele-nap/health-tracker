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
  deleteMedication,
  updateMedication,
  type MedicationState,
} from '@/server/actions/medications';
import { useRouter } from 'next/navigation';
import { useActionState, useTransition } from 'react';

type MedicationData = {
  id: string;
  name: string;
  dosage: string;
  form: string;
  prescribedBy: string;
  startDate: string;
  endDate: string;
  instructions: string;
};

const initialState: MedicationState = {};

export function MedicationEditForm({
  medication,
}: {
  medication: MedicationData;
}) {
  const { tr } = useLocale();
  const action = updateMedication.bind(null, medication.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [delPending, startDelete] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(tr.medications.deleteConfirm(medication.name))) return;
    startDelete(async () => {
      await deleteMedication(medication.id);
      router.push('/medications');
    });
  }

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
            defaultValue={medication.name}
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
            defaultValue={medication.dosage}
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
          <Select name="form" defaultValue={medication.form || undefined}>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="prescribedBy">
            {tr.medications.prescribedByLabel}
          </Label>
          <Input
            id="prescribedBy"
            name="prescribedBy"
            defaultValue={medication.prescribedBy}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">{tr.medications.startDateLabel}</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={medication.startDate}
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
            defaultValue={medication.endDate}
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
          defaultValue={medication.instructions}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={pending || delPending}>
            {pending ? tr.saving : tr.medications.saveBtn}
          </Button>
          <a
            href="/medications"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {tr.cancel}
          </a>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending || delPending}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          {delPending ? tr.deleting : tr.delete}
        </button>
      </div>
    </form>
  );
}
