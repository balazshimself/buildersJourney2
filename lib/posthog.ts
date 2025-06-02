// lib/posthog.ts
import { PostHog } from "posthog-node";

/**
 * Initializes and returns a PostHog Node.js client.
 * Use this in server-side code to track events from your backend.
 */
export default function PostHogClient() {
  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}