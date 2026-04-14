type WindowEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, WindowEntry>();
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 30_000) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfter: number };

export function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): RateLimitResult {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { limited: false };
  }

  if (entry.count >= limit) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { limited: false };
}
