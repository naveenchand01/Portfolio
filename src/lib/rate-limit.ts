/**
 * Best-effort, in-memory sliding-window limiter (per serverless instance).
 * If real spam shows up, swap this for a Vercel Firewall rule or Upstash Redis. See BACKEND.md §5.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();
  return function allow(key: string, now = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear(); // keep memory bounded
    return true;
  };
}
