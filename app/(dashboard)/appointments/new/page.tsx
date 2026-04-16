import type { Metadata } from "next";
import { getT } from "@/lib/locale";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";

export const metadata: Metadata = {
  title: "New appointment",
  description: "Schedule a new medical appointment.",
  openGraph: { title: "New appointment · Health Tracker", description: "Schedule a new medical appointment." },
};

export default async function NewAppointmentPage() {
  const tr = await getT();

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">
          {tr.appointments.newTitle} 🌿
        </h1>
        <p className="text-muted-foreground mt-1">{tr.appointments.newSubtitle}</p>
      </div>

      <AppointmentForm />
    </div>
  );
}
