import { prisma } from "@/lib/prisma";

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfter: number };

/**
 * Database-backed rate limiter — works correctly across serverless instances.
 * Uses a transaction to atomically read-and-increment the counter.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.rateLimit.findUnique({ where: { key } });

    if (!existing || existing.resetAt < now) {
      const resetAt = new Date(now.getTime() + windowSec * 1000);
      await tx.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { count: 1, resetAt };
    }

    const updated = await tx.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return { count: updated.count, resetAt: updated.resetAt };
  });

  if (result.count > limit) {
    return {
      limited: true,
      retryAfter: Math.ceil((result.resetAt.getTime() - now.getTime()) / 1000),
    };
  }

  return { limited: false };
}
