import { getT } from "@/lib/i18n";
import { SymptomForm } from "@/components/symptoms/SymptomForm";

export default async function NewSymptomLogPage() {
  const tr = await getT();

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {tr.symptoms.newTitle} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{tr.symptoms.newSubtitle}</p>
      </div>

      <SymptomForm />
    </div>
  );
}
