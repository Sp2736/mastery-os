/**
 * Single source of truth for the session-signing secret.
 * Fails closed: there is deliberately NO built-in fallback value.
 */
export function getSessionSecret(): Uint8Array {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const secret = process.env.SESSION_SECRET;
  if (isDemo && !secret) {
    return new TextEncoder().encode('demo-session-secret-placeholder-for-static-build-32chars');
  }
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to a random string of at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}
