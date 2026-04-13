import { AppointmentForm } from "@/components/appointments/AppointmentForm";

export default function NewAppointmentPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading italic text-3xl text-foreground">New appointment 🌿</h1>
        <p className="text-muted-foreground mt-1">
          Schedule and keep track of your medical visits.
        </p>
      </div>

      <AppointmentForm />
    </div>
  );
}
