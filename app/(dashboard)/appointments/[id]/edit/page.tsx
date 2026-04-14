import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptIfPresent } from "@/lib/crypto";
import { notFound, redirect } from "next/navigation";
import { AppointmentEditForm } from "@/components/appointments/AppointmentEditForm";
import { getT } from "@/lib/i18n";

export default async function EditAppointmentPage({
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

  const appt = await prisma.appointment.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      title: true,
      doctorName: true,
      specialty: true,
      location: true,
      scheduledAt: true,
      durationMin: true,
      purpose: true,
    },
  });

  if (!appt || appt.userId !== session.user.id) {
    notFound();
  }

  function toDatetimeLocal(d: Date) {
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  }

  const data = {
    id: appt.id,
    title: appt.title,
    doctorName: decryptIfPresent(appt.doctorName) ?? "",
    specialty: appt.specialty ?? "",
    location: decryptIfPresent(appt.location) ?? "",
    scheduledAt: toDatetimeLocal(appt.scheduledAt),
    durationMin: appt.durationMin,
    purpose: appt.purpose ?? "",
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {tr.appointments.editTitle} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{appt.title}</p>
      </div>

      <AppointmentEditForm appointment={data} />
    </div>
  );
}
