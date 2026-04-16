import { prisma } from "@/lib/prisma";

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfter: number };

export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  type Row = { count: number; reset_at: Date };

  const rows = await prisma.$queryRaw<Row[]>`
    INSERT INTO "RateLimit" (key, count, "resetAt")
    VALUES (
      ${key},
      1,
      NOW() + (${windowSec} * INTERVAL '1 second')
    )
    ON CONFLICT (key) DO UPDATE
    SET
      count = CASE
        WHEN "RateLimit"."resetAt" < NOW() THEN 1
        ELSE "RateLimit".count + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimit"."resetAt" < NOW()
          THEN NOW() + (${windowSec} * INTERVAL '1 second')
        ELSE "RateLimit"."resetAt"
      END
    RETURNING count, "resetAt" AS reset_at
  `;

  const row = rows[0];
  if (!row) return { limited: false };

  if (row.count > limit) {
    const retryAfter = Math.ceil(
      (new Date(row.reset_at).getTime() - Date.now()) / 1000
    );
    return { limited: true, retryAfter: Math.max(1, retryAfter) };
  }

  return { limited: false };
}
