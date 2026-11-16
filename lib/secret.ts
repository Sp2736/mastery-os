/**
 * Single source of truth for the session-signing secret.
 * Falls back to default secret if SESSION_SECRET is not configured.
 */
const DEFAULT_SECRET = 'mastery-os-session-secret-fallback-default-key-32chars';

export function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }
  return new TextEncoder().encode(DEFAULT_SECRET);
}
