import { SymptomForm } from "@/components/symptoms/SymptomForm";

export default function NewSymptomLogPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">Log your day 🌿</h1>
        <p className="text-muted-foreground mt-1">
          Take a moment to check in with yourself.
        </p>
      </div>

      <SymptomForm />
    </div>
  );
}
