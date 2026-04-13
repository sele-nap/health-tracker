"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptIfPresent } from "@/lib/crypto";
import { appointmentSchema } from "@/lib/validations/appointments";

export type AppointmentState = {
  errors?: {
    title?: string[];
    doctorName?: string[];
    specialty?: string[];
    location?: string[];
    scheduledAt?: string[];
    durationMin?: string[];
    purpose?: string[];
    _form?: string[];
  };
};

export async function createAppointment(
  _prevState: AppointmentState,
  formData: FormData
): Promise<AppointmentState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ["Unauthorized"] } };
  }

  const raw = {
    title: formData.get("title"),
    doctorName: formData.get("doctorName") || undefined,
    specialty: formData.get("specialty") || undefined,
    location: formData.get("location") || undefined,
    scheduledAt: formData.get("scheduledAt"),
    durationMin: formData.get("durationMin") || undefined,
    purpose: formData.get("purpose") || undefined,
  };

  const parsed = appointmentSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { title, doctorName, specialty, location, scheduledAt, durationMin, purpose } =
    parsed.data;

  await prisma.appointment.create({
    data: {
      userId: session.user.id,
      title,
      doctorName: encryptIfPresent(doctorName ?? null),
      specialty: specialty ?? null,
      location: encryptIfPresent(location ?? null),
      scheduledAt: new Date(scheduledAt),
      durationMin: durationMin ?? null,
      purpose: purpose ?? null,
      status: "UPCOMING",
    },
  });

  redirect("/appointments");
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: "COMPLETED" | "CANCELLED" | "RESCHEDULED" | "UPCOMING"
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { userId: true },
  });

  if (!appointment || appointment.userId !== session.user.id) {
    throw new Error("Not found");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });
}
