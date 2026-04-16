"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { conditionSchema } from "@/lib/validations/conditions";
import { rateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import type { ConditionState } from "@/types/actions";

export type { ConditionState };

export async function createCondition(
  _prevState: ConditionState,
  formData: FormData
): Promise<ConditionState> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { errors: { _form: ["Unauthorized"] } };
  }

  const rl = await rateLimit(`conditions:write:${session.user.id}`, 10, 60);
  if (rl.limited) {
    return { errors: { _form: ["Too many requests. Please try again shortly."] } };
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

  const rl = await rateLimit(`conditions:delete:${session.user.id}`, 5, 60);
  if (rl.limited) throw new Error("Too many requests");

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
