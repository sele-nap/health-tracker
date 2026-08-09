import { MedicationForm } from '@/components/medications/MedicationForm';
import { getT } from '@/lib/locale';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add medication',
  description: 'Add a new medication to track.',
  openGraph: {
    title: 'Add medication · Health Tracker',
    description: 'Add a new medication to track.',
  },
};

export default async function NewMedicationPage() {
  const tr = await getT();

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading font-semibold text-3xl text-foreground">
          {tr.medications.newTitle} ✨
        </h1>
        <p className="text-muted-foreground mt-1">
          {tr.medications.newSubtitle}
        </p>
      </div>

      <MedicationForm />
    </div>
  );
}
