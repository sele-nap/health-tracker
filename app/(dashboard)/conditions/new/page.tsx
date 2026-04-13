import { ConditionForm } from "@/components/conditions/ConditionForm";

export default function NewConditionPage() {
  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">Add a condition 🌿</h1>
        <p className="text-muted-foreground mt-1">
          Keep track of your chronic conditions in one place.
        </p>
      </div>

      <ConditionForm />
    </div>
  );
}
