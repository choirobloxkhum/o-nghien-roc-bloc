/**
 * Utility to generate a random 6-character password consisting of letters and numbers (A-Z, a-z, 0-9).
 * Changes dynamically per page session/refresh.
 */

export function generateRandom6CharPassword(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const values = new Uint8Array(6);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(values[i] % chars.length);
    }
  } else {
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}

// In-memory session store for characters with dynamic password
const sessionDynamicPasswords: Record<string, string> = {};

export function getCharacterSessionPassword(characterId: string, fallbackDefault?: string): string {
  if (!sessionDynamicPasswords[characterId]) {
    sessionDynamicPasswords[characterId] = generateRandom6CharPassword();
  }
  return sessionDynamicPasswords[characterId] || fallbackDefault || generateRandom6CharPassword();
}
