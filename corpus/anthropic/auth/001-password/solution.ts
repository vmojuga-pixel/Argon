import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";

export interface ScryptParams { N: number; r: number; p: number; }
export const DEFAULT_PARAMS: ScryptParams = { N: 16384, r: 8, p: 1 };
const KEYLEN = 32;
const MIN_LEN = 8;
const MAX_LEN = 256;

function derive(password: string, salt: Buffer, { N, r, p }: ScryptParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password.normalize("NFKC"), salt, KEYLEN, { N, r, p, maxmem: 256 * N * r },
      (err, key) => (err ? reject(err) : resolve(key)));
  });
}

function validParams({ N, r, p }: ScryptParams): boolean {
  return (
    Number.isInteger(N) && N >= 1024 && N <= 131072 && (N & (N - 1)) === 0 &&
    Number.isInteger(r) && r >= 1 && r <= 16 &&
    Number.isInteger(p) && p >= 1 && p <= 4
  );
}

export async function hashPassword(password: string, params: ScryptParams = DEFAULT_PARAMS): Promise<string> {
  if (typeof password !== "string" || password.length < MIN_LEN || password.length > MAX_LEN) {
    throw new RangeError(`password must be ${MIN_LEN}-${MAX_LEN} characters`);
  }
  if (!validParams(params)) throw new RangeError("invalid scrypt params");
  const salt = randomBytes(16);
  const key = await derive(password, salt, params);
  return ["scrypt", params.N, params.r, params.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    if (typeof password !== "string" || password.length > MAX_LEN) return false;
    if (typeof stored !== "string") return false;
    const parts = stored.split("$");
    if (parts.length !== 6 || parts[0] !== "scrypt") return false;
    const params = { N: Number(parts[1]), r: Number(parts[2]), p: Number(parts[3]) };
    if (!validParams(params)) return false;
    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");
    if (salt.length < 8 || expected.length !== KEYLEN) return false;
    const actual = await derive(password, salt, params);
    return timingSafeEqual(actual, expected);
  } catch { return false; }
}

export function needsRehash(stored: string, target: ScryptParams = DEFAULT_PARAMS): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return true;
  const N = Number(parts[1]), r = Number(parts[2]), p = Number(parts[3]);
  return N < target.N || r < target.r || p < target.p;
}
