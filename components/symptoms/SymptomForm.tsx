'use client';

import { useLocale } from '@/components/providers/LocaleProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createSymptomLog } from '@/server/actions/symptoms';
import type { SymptomLogState } from '@/types/actions';
import type { SymptomDefinitionProp } from '@/types/symptoms';
import { useActionState, useState } from 'react';

function todayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type SliderFieldProps = {
  id: string;
  name: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string[];
  sliderLabels: string[];
};

function SliderField({
  id,
  name,
  label,
  value,
  onChange,
  error,
  sliderLabels,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground italic">
          {value} — {sliderLabels[value]}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-3">1</span>
        <input
          id={id}
          name={name}
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 appearance-none cursor-pointer"
        />
        <span className="text-xs text-muted-foreground w-3">10</span>
      </div>
      {error && <p className="text-xs text-destructive">{error[0]}</p>}
    </div>
  );
}

const initialState: SymptomLogState = {};

export type { SymptomDefinitionProp };

type Props = {
  defaultDate?: string;
  defaultMood?: number;
  defaultEnergy?: number;
  defaultSleepQuality?: number;
  defaultStress?: number;
  defaultSleepHours?: number;
  defaultNotes?: string;
  cancelHref?: string;
  definitions?: SymptomDefinitionProp[];
  defaultCustomEntries?: Record<string, number>;
};

export function SymptomForm({
  defaultDate,
  defaultMood = 5,
  defaultEnergy = 5,
  defaultSleepQuality = 5,
  defaultStress = 5,
  defaultSleepHours,
  defaultNotes = '',
  cancelHref = '/symptoms',
  definitions = [],
  defaultCustomEntries = {},
}: Props) {
  const { tr } = useLocale();
  const [state, formAction, pending] = useActionState(
    createSymptomLog,
    initialState,
  );

  const [mood, setMood] = useState(defaultMood);
  const [energy, setEnergy] = useState(defaultEnergy);
  const [sleepQuality, setSleepQuality] = useState(defaultSleepQuality);
  const [stress, setStress] = useState(defaultStress);
  const [customValues, setCustomValues] = useState<Record<string, number>>(
    () => {
      const init: Record<string, number> = {};
      for (const def of definitions) {
        init[def.id] = defaultCustomEntries[def.id] ?? 5;
      }
      return init;
    },
  );

  return (
    <form action={formAction} className="space-y-8">
      {state.errors?._form && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          {state.errors._form[0]}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="loggedAt">Date</Label>
        <Input
          id="loggedAt"
          name="loggedAt"
          type="date"
          defaultValue={defaultDate ?? todayString()}
          max={todayString()}
          className={cn(state.errors?.loggedAt && 'border-destructive')}
        />
        {state.errors?.loggedAt && (
          <p className="text-xs text-destructive">{state.errors.loggedAt[0]}</p>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="font-heading italic text-lg text-foreground">
          {tr.symptoms.formTitle}
        </h2>

        <SliderField
          id="overallMood"
          name="overallMood"
          label={tr.symptoms.overallMood}
          value={mood}
          onChange={setMood}
          error={state.errors?.overallMood}
          sliderLabels={tr.symptoms.sliderLabels}
        />

        <SliderField
          id="energyLevel"
          name="energyLevel"
          label={tr.symptoms.energyLevel}
          value={energy}
          onChange={setEnergy}
          error={state.errors?.energyLevel}
          sliderLabels={tr.symptoms.sliderLabels}
        />

        <SliderField
          id="stressLevel"
          name="stressLevel"
          label={tr.symptoms.stressLevel}
          value={stress}
          onChange={setStress}
          error={state.errors?.stressLevel}
          sliderLabels={tr.symptoms.sliderLabels}
        />
      </div>

      <div className="space-y-6">
        <h2 className="font-heading italic text-lg text-foreground">
          {tr.symptoms.sleep}
        </h2>

        <div className="space-y-2">
          <Label htmlFor="sleepHours">{tr.symptoms.sleepHours}</Label>
          <Input
            id="sleepHours"
            name="sleepHours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            placeholder="e.g. 7.5"
            defaultValue={defaultSleepHours ?? ''}
            className={cn(
              'w-32',
              state.errors?.sleepHours && 'border-destructive',
            )}
          />
          {state.errors?.sleepHours && (
            <p className="text-xs text-destructive">
              {state.errors.sleepHours[0]}
            </p>
          )}
        </div>

        <SliderField
          id="sleepQuality"
          name="sleepQuality"
          label={tr.symptoms.sleepQuality}
          value={sleepQuality}
          onChange={setSleepQuality}
          error={state.errors?.sleepQuality}
          sliderLabels={tr.symptoms.sliderLabels}
        />
      </div>

      {definitions.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-heading italic text-lg text-foreground">
            {tr.symptoms.customSection}
          </h2>
          {definitions.map((def) => (
            <SliderField
              key={def.id}
              id={`custom_${def.id}`}
              name={`custom_${def.id}`}
              label={`${def.name}${def.unit ? ` (${def.unit})` : ''}`}
              value={customValues[def.id] ?? 5}
              onChange={(v) =>
                setCustomValues((prev) => ({ ...prev, [def.id]: v }))
              }
              sliderLabels={tr.symptoms.sliderLabels}
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">{tr.symptoms.notes}</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder={tr.symptoms.notesPlaceholder}
          rows={4}
          defaultValue={defaultNotes}
          className={cn(state.errors?.notes && 'border-destructive')}
        />
        {state.errors?.notes && (
          <p className="text-xs text-destructive">{state.errors.notes[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? tr.saving : tr.save}
        </Button>
        <a
          href={cancelHref}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {tr.cancel}
        </a>
      </div>
    </form>
  );
}
