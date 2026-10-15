/**
 * [CORPUS: qwen/stack] Cryptographically secure API key generator
 * Tags: crypto, api-key, sha256, secure-random, prefix
 * Pattern: 32-byte random hex + SHA-256 hash before store (never persist plaintext)
 */
import { randomBytes, createHash } from 'crypto';

export function generateSecureApiKey(prefix: string = 'sk_live'): { plainTextKey: string; hashedKey: string } {
  const randomPart = randomBytes(24).toString('hex');
  const plainTextKey = `${prefix}_${randomPart}`;
  const hashedKey = createHash('sha256').update(plainTextKey).digest('hex');
  return { plainTextKey, hashedKey };
}
