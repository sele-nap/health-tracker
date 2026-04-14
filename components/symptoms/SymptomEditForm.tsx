"use client";

import { useActionState, useState } from "react";
import { updateSymptomLog, type SymptomLogState } from "@/server/actions/symptoms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

type SliderFieldProps = {
  id: string;
  name: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string[];
  sliderLabels: string[];
};

function SliderField({ id, name, label, value, onChange, error, sliderLabels }: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
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
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
        />
        <span className="text-xs text-muted-foreground w-3">10</span>
      </div>
      {error && <p className="text-xs text-destructive">{error[0]}</p>}
    </div>
  );
}

type Props = {
  logId: string;
  defaults: {
    loggedAt: string;
    mood: number;
    energy: number;
    stress: number;
    sleepHours: number | null;
    sleepQuality: number;
    notes: string;
  };
};

const initialState: SymptomLogState = {};

export function SymptomEditForm({ logId, defaults }: Props) {
  const { tr } = useLocale();
  const action = updateSymptomLog.bind(null, logId);
  const [state, formAction, pending] = useActionState(action, initialState);

  const [mood, setMood] = useState(defaults.mood);
  const [energy, setEnergy] = useState(defaults.energy);
  const [sleepQuality, setSleepQuality] = useState(defaults.sleepQuality);
  const [stress, setStress] = useState(defaults.stress);

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
          defaultValue={defaults.loggedAt}
          className={cn(state.errors?.loggedAt && "border-destructive")}
        />
        {state.errors?.loggedAt && (
          <p className="text-xs text-destructive">{state.errors.loggedAt[0]}</p>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="font-heading italic text-lg text-foreground">{tr.symptoms.formTitle}</h2>
        <SliderField id="overallMood" name="overallMood" label={tr.symptoms.overallMood} value={mood} onChange={setMood} error={state.errors?.overallMood} sliderLabels={tr.symptoms.sliderLabels} />
        <SliderField id="energyLevel" name="energyLevel" label={tr.symptoms.energyLevel} value={energy} onChange={setEnergy} error={state.errors?.energyLevel} sliderLabels={tr.symptoms.sliderLabels} />
        <SliderField id="stressLevel" name="stressLevel" label={tr.symptoms.stressLevel} value={stress} onChange={setStress} error={state.errors?.stressLevel} sliderLabels={tr.symptoms.sliderLabels} />
      </div>

      <div className="space-y-6">
        <h2 className="font-heading italic text-lg text-foreground">{tr.symptoms.sleep}</h2>
        <div className="space-y-2">
          <Label htmlFor="sleepHours">{tr.symptoms.sleepHours}</Label>
          <Input
            id="sleepHours"
            name="sleepHours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            defaultValue={defaults.sleepHours ?? ""}
            placeholder="e.g. 7.5"
            className={cn("w-32", state.errors?.sleepHours && "border-destructive")}
          />
          {state.errors?.sleepHours && (
            <p className="text-xs text-destructive">{state.errors.sleepHours[0]}</p>
          )}
        </div>
        <SliderField id="sleepQuality" name="sleepQuality" label={tr.symptoms.sleepQuality} value={sleepQuality} onChange={setSleepQuality} error={state.errors?.sleepQuality} sliderLabels={tr.symptoms.sliderLabels} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{tr.symptoms.notes}</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder={tr.symptoms.notesPlaceholder}
          rows={4}
          defaultValue={defaults.notes}
          className={cn(state.errors?.notes && "border-destructive")}
        />
        {state.errors?.notes && (
          <p className="text-xs text-destructive">{state.errors.notes[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? tr.saving : tr.save}
        </Button>
        <a href="/symptoms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {tr.cancel}
        </a>
      </div>
    </form>
  );
}
