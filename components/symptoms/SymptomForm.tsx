"use client";

import { useActionState, useState } from "react";
import { createSymptomLog, type SymptomLogState } from "@/server/actions/symptoms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function todayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type SliderFieldProps = {
  id: string;
  name: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string[];
};

function SliderField({ id, name, label, value, onChange, error }: SliderFieldProps) {
  const labels = ["", "terrible", "bad", "poor", "low", "okay", "decent", "good", "great", "excellent", "perfect"];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <span className="text-xs text-muted-foreground italic">
          {value} — {labels[value]}
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

const initialState: SymptomLogState = {};

export function SymptomForm() {
  const [state, formAction, pending] = useActionState(createSymptomLog, initialState);

  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [stress, setStress] = useState(5);

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
          defaultValue={todayString()}
          max={todayString()}
          className={cn(state.errors?.loggedAt && "border-destructive")}
        />
        {state.errors?.loggedAt && (
          <p className="text-xs text-destructive">{state.errors.loggedAt[0]}</p>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="font-heading italic text-lg text-foreground">How do you feel?</h2>

        <SliderField
          id="overallMood"
          name="overallMood"
          label="Overall mood"
          value={mood}
          onChange={setMood}
          error={state.errors?.overallMood}
        />

        <SliderField
          id="energyLevel"
          name="energyLevel"
          label="Energy level"
          value={energy}
          onChange={setEnergy}
          error={state.errors?.energyLevel}
        />

        <SliderField
          id="stressLevel"
          name="stressLevel"
          label="Stress level"
          value={stress}
          onChange={setStress}
          error={state.errors?.stressLevel}
        />
      </div>

      <div className="space-y-6">
        <h2 className="font-heading italic text-lg text-foreground">Sleep</h2>

        <div className="space-y-2">
          <Label htmlFor="sleepHours">Hours slept</Label>
          <Input
            id="sleepHours"
            name="sleepHours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            placeholder="e.g. 7.5"
            className={cn("w-32", state.errors?.sleepHours && "border-destructive")}
          />
          {state.errors?.sleepHours && (
            <p className="text-xs text-destructive">{state.errors.sleepHours[0]}</p>
          )}
        </div>

        <SliderField
          id="sleepQuality"
          name="sleepQuality"
          label="Sleep quality"
          value={sleepQuality}
          onChange={setSleepQuality}
          error={state.errors?.sleepQuality}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any symptoms, flare-ups, or observations for today…"
          rows={4}
          className={cn(state.errors?.notes && "border-destructive")}
        />
        {state.errors?.notes && (
          <p className="text-xs text-destructive">{state.errors.notes[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save log"}
        </Button>
        <a
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
