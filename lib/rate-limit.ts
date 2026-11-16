export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX = 8;

export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly windowMs = RATE_LIMIT_WINDOW_MS,
    private readonly max = RATE_LIMIT_MAX,
  ) {}

  /** Returns true if the request is allowed. */
  allow(key: string, now = Date.now()): boolean {
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.max) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  reset(): void {
    this.hits.clear();
  }
}

export const apiRateLimiter = new RateLimiter();

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
