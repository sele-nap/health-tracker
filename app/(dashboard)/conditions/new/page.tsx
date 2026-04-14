import { getT } from "@/lib/i18n";
import { ConditionForm } from "@/components/conditions/ConditionForm";

export default async function NewConditionPage() {
  const tr = await getT();

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {tr.conditions.newTitle} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{tr.conditions.newSubtitle}</p>
      </div>

      <ConditionForm />
    </div>
  );
}
