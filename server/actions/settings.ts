"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type UpdateNameState = {
  success?: boolean;
  errors?: { name?: string[]; _form?: string[] };
};

export type ChangePasswordState = {
  success?: boolean;
  errors?: {
    currentPassword?: string[];
    newPassword?: string[];
    _form?: string[];
  };
};

export async function updateName(
  _prevState: UpdateNameState,
  formData: FormData
): Promise<UpdateNameState> {
  const name = (formData.get("name") as string | null)?.trim();

  if (!name || name.length === 0) {
    return { errors: { name: ["Name cannot be empty"] } };
  }

  if (name.length > 100) {
    return { errors: { name: ["Name is too long"] } };
  }

  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user?.id) {
    return { errors: { _form: ["Unauthorized"] } };
  }

  await auth.api.updateUser({
    headers: reqHeaders,
    body: { name },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const currentPassword = formData.get("currentPassword") as string | null;
  const newPassword = formData.get("newPassword") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;

  if (!currentPassword) {
    return { errors: { currentPassword: ["Current password is required"] } };
  }

  if (!newPassword || newPassword.length < 8) {
    return { errors: { newPassword: ["New password must be at least 8 characters"] } };
  }

  if (newPassword !== confirmPassword) {
    return { errors: { newPassword: ["Passwords do not match"] } };
  }

  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user?.id) {
    return { errors: { _form: ["Unauthorized"] } };
  }

  try {
    await auth.api.changePassword({
      headers: reqHeaders,
      body: { currentPassword, newPassword, revokeOtherSessions: false },
    });
  } catch {
    return { errors: { _form: ["Current password is incorrect"] } };
  }

  return { success: true };
}
