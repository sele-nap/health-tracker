"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { rateLimit } from "@/lib/rate-limit";

export type NoteState = {
  success?: boolean;
  errors?: { content?: string[]; _form?: string[] };
};

export async function addAppointmentNote(
  appointmentId: string,
  _prevState: NoteState,
  formData: FormData
): Promise<NoteState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return { errors: { _form: ["Unauthorized"] } };

  const rl = await rateLimit(`apptNotes:write:${session.user.id}`, 30, 60);
  if (rl.limited) return { errors: { _form: ["Too many requests."] } };

  const content = (formData.get("content") as string | null)?.trim() ?? "";
  if (!content) return { errors: { content: ["Note cannot be empty."] } };
  if (content.length > 5000) return { errors: { content: ["Note is too long."] } };

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { userId: true },
  });
  if (!appointment || appointment.userId !== session.user.id)
    return { errors: { _form: ["Not found"] } };

  await prisma.appointmentNote.create({
    data: {
      appointmentId,
      content: encrypt(content),
    },
  });

  revalidatePath(`/appointments/${appointmentId}/edit`);
  return { success: true };
}

export async function deleteAppointmentNote(noteId: string, appointmentId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rl = await rateLimit(`apptNotes:delete:${session.user.id}`, 20, 60);
  if (rl.limited) throw new Error("Too many requests");

  const note = await prisma.appointmentNote.findUnique({
    where: { id: noteId },
    include: { appointment: { select: { userId: true } } },
  });
  if (!note || note.appointment.userId !== session.user.id) throw new Error("Not found");

  await prisma.appointmentNote.delete({ where: { id: noteId } });
  revalidatePath(`/appointments/${appointmentId}/edit`);
}
