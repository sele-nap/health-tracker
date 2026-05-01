'use server';

import { auth } from '@/lib/auth';
import { encryptIfPresent } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { appointmentSchema } from '@/lib/validations/appointments';
import type {
  AppointmentState,
  AppointmentSummaryState,
} from '@/types/actions';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type { AppointmentState, AppointmentSummaryState };

export async function createAppointment(
  _prevState: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ['Unauthorized'] } };
  }

  const rl = await rateLimit(`appointments:write:${session.user.id}`, 20, 60);
  if (rl.limited) {
    return {
      errors: { _form: ['Too many requests. Please try again shortly.'] },
    };
  }

  const raw = {
    title: formData.get('title'),
    doctorName: formData.get('doctorName') || undefined,
    specialty: formData.get('specialty') || undefined,
    location: formData.get('location') || undefined,
    scheduledAt: formData.get('scheduledAt'),
    durationMin: formData.get('durationMin') || undefined,
    purpose: formData.get('purpose') || undefined,
  };

  const parsed = appointmentSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const {
    title,
    doctorName,
    specialty,
    location,
    scheduledAt,
    durationMin,
    purpose,
  } = parsed.data;

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
      status: 'UPCOMING',
    },
  });

  redirect('/appointments');
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'UPCOMING',
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const rl = await rateLimit(`appointments:write:${session.user.id}`, 20, 60);
  if (rl.limited) throw new Error('Too many requests');

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { userId: true },
  });

  if (!appointment || appointment.userId !== session.user.id) {
    throw new Error('Not found');
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });
}

export async function saveAppointmentSummary(
  appointmentId: string,
  _prevState: AppointmentSummaryState,
  formData: FormData,
): Promise<AppointmentSummaryState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ['Unauthorized'] } };
  }

  const rl = await rateLimit(`appointments:write:${session.user.id}`, 20, 60);
  if (rl.limited) {
    return {
      errors: { _form: ['Too many requests. Please try again shortly.'] },
    };
  }

  const summary = (formData.get('summary') as string | null)?.trim() || null;

  if (summary && summary.length > 3000) {
    return { errors: { summary: ['Summary is too long'] } };
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { userId: true },
  });

  if (!appointment || appointment.userId !== session.user.id) {
    return { errors: { _form: ['Not found'] } };
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { summary: encryptIfPresent(summary) },
  });

  revalidatePath('/appointments');
  return { success: true };
}

export async function updateAppointment(
  appointmentId: string,
  _prevState: AppointmentState,
  formData: FormData,
): Promise<AppointmentState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ['Unauthorized'] } };
  }

  const rl = await rateLimit(`appointments:write:${session.user.id}`, 20, 60);
  if (rl.limited) {
    return {
      errors: { _form: ['Too many requests. Please try again shortly.'] },
    };
  }

  const existing = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return { errors: { _form: ['Not found'] } };
  }

  const raw = {
    title: formData.get('title'),
    doctorName: formData.get('doctorName') || undefined,
    specialty: formData.get('specialty') || undefined,
    location: formData.get('location') || undefined,
    scheduledAt: formData.get('scheduledAt'),
    durationMin: formData.get('durationMin') || undefined,
    purpose: formData.get('purpose') || undefined,
  };

  const parsed = appointmentSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const {
    title,
    doctorName,
    specialty,
    location,
    scheduledAt,
    durationMin,
    purpose,
  } = parsed.data;

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      title,
      doctorName: encryptIfPresent(doctorName ?? null),
      specialty: specialty ?? null,
      location: encryptIfPresent(location ?? null),
      scheduledAt: new Date(scheduledAt),
      durationMin: durationMin ?? null,
      purpose: purpose ?? null,
    },
  });

  revalidatePath('/appointments');
  redirect('/appointments');
}

export async function deleteAppointment(appointmentId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) throw new Error('Unauthorized');

  const rl = await rateLimit(`appointments:delete:${session.user.id}`, 10, 60);
  if (rl.limited) throw new Error('Too many requests');

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { userId: true },
  });

  if (!appointment || appointment.userId !== session.user.id)
    throw new Error('Not found');

  await prisma.appointment.delete({ where: { id: appointmentId } });

  revalidatePath('/appointments');
}
