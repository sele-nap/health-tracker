import { getT } from "@/lib/i18n";
import { MedicationForm } from "@/components/medications/MedicationForm";

export default async function NewMedicationPage() {
  const tr = await getT();

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {tr.medications.newTitle} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{tr.medications.newSubtitle}</p>
      </div>

      <MedicationForm />
    </div>
  );
}
