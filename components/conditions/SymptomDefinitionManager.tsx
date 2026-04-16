"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSymptomDefinition, deleteSymptomDefinition } from "@/server/actions/symptomDefinitions";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { SymptomDefinition } from "@/types/symptoms";

export type { SymptomDefinition };

type Props = {
  conditionId: string;
  definitions: SymptomDefinition[];
};

export function SymptomDefinitionManager({ conditionId, definitions }: Props) {
  const { tr } = useLocale();
  const ctr = tr.conditions;
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(ctr.symptomNameLabel + " required");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createSymptomDefinition(conditionId, name.trim(), unit.trim() || undefined);
        setName("");
        setUnit("");
        setShowForm(false);
      } catch {
        setError("Failed to save.");
      }
    });
  }

  function handleDelete(defId: string) {
    if (!confirm(ctr.deleteSymptomConfirm)) return;
    startTransition(async () => {
      try {
        await deleteSymptomDefinition(defId, conditionId);
      } catch {}
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {ctr.customSymptoms}
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-primary hover:opacity-80 transition-opacity flex items-center gap-1"
          >
            <Plus size={13} />
            {ctr.addSymptomDef}
          </button>
        )}
      </div>

      {definitions.length === 0 && !showForm && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{ctr.noCustomSymptoms}</p>
          <p className="text-xs text-muted-foreground/60">{ctr.customSymptomsDesc}</p>
        </div>
      )}

      <div className="space-y-1.5">
        {definitions.map((def) => (
          <div
            key={def.id}
            className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-muted/20 border border-border text-sm"
          >
            <div>
              <span className="font-medium">{def.name}</span>
              {def.unit && (
                <span className="text-muted-foreground ml-1.5 text-xs">({def.unit})</span>
              )}
            </div>
            <button
              onClick={() => handleDelete(def.id)}
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl border border-border bg-card space-y-3"
        >
          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{ctr.symptomNameLabel}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={ctr.symptomNamePlaceholder}
              className="h-9"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {ctr.symptomUnitLabel}{" "}
              <span className="text-muted-foreground/60">{tr.optional}</span>
            </label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={ctr.symptomUnitPlaceholder}
              className="h-9 w-40"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={isPending}>
              {tr.save}
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setName("");
                setUnit("");
                setError(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tr.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
