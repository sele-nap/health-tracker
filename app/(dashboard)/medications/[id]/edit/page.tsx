import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { notFound, redirect } from "next/navigation";
import { MedicationEditForm } from "@/components/medications/MedicationEditForm";
import { getT } from "@/lib/i18n";

export default async function EditMedicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, tr] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getT(),
  ]);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const medication = await prisma.medication.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      dosage: true,
      form: true,
      prescribedBy: true,
      startDate: true,
      endDate: true,
      instructions: true,
    },
  });

  if (!medication || medication.userId !== session.user.id) {
    notFound();
  }

  function dateStr(d: Date | null) {
    if (!d) return "";
    return d.toISOString().slice(0, 10);
  }

  const data = {
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    form: medication.form ?? "",
    prescribedBy: decryptIfPresent(medication.prescribedBy) ?? "",
    startDate: dateStr(medication.startDate),
    endDate: dateStr(medication.endDate),
    instructions: decryptIfPresent(medication.instructions) ?? "",
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {tr.medications.editTitle} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{medication.name}</p>
      </div>

      <MedicationEditForm medication={data} />
    </div>
  );
}
