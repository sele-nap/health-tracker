import { MedicationForm } from "@/components/medications/MedicationForm";

export default function NewMedicationPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">Add a medication 🌿</h1>
        <p className="text-muted-foreground mt-1">
          Keep track of what you take and when.
        </p>
      </div>

      <MedicationForm />
    </div>
  );
}
