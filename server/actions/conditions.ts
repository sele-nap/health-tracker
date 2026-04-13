"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { conditionSchema } from "@/lib/validations/conditions";
import { revalidatePath } from "next/cache";

export type ConditionState = {
  errors?: { name?: string[]; diagnosedAt?: string[]; _form?: string[] };
};

export async function createCondition(
  _prevState: ConditionState,
  formData: FormData
): Promise<ConditionState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ["Unauthorized"] } };
  }

  const raw = {
    name: formData.get("name"),
    diagnosedAt: formData.get("diagnosedAt") || undefined,
  };

  const parsed = conditionSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.userCondition.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      diagnosedAt: parsed.data.diagnosedAt ? new Date(parsed.data.diagnosedAt) : null,
    },
  });

  redirect("/conditions");
}

export async function deleteCondition(conditionId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const condition = await prisma.userCondition.findUnique({
    where: { id: conditionId },
    select: { userId: true },
  });

  if (!condition || condition.userId !== session.user.id) {
    throw new Error("Not found");
  }

  await prisma.userCondition.delete({ where: { id: conditionId } });

  revalidatePath("/conditions");
}
