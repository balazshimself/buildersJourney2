// lib/rateLimit.ts
import { NextRequest } from "next/server";

const requestCounts = new Map<string, { count: number; timestamp: number }>();

export function rateLimit(req: NextRequest, limit = 5, windowMs = 60000) {
  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean old entries
  for (const [key, value] of requestCounts.entries()) {
    if (value.timestamp < windowStart) {
      requestCounts.delete(key);
    }
  }

  const current = requestCounts.get(ip) ?? { count: 0, timestamp: now };

  if (current.timestamp < windowStart) {
    current.count = 1;
    current.timestamp = now;
  } else {
    current.count++;
  }

  requestCounts.set(ip, current);

  return current.count <= limit;
}
