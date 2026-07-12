import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const VERSION_PREFIX = "v1:";

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("FIELD_ENCRYPTION_KEY is not set");
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `FIELD_ENCRYPTION_KEY must decode to ${KEY_LENGTH} bytes, got ${key.length}`,
    );
  }

  cachedKey = key;
  return key;
}

export function encryptField(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const blob = Buffer.concat([iv, authTag, ciphertext]);
  return VERSION_PREFIX + blob.toString("base64");
}

export function decryptField(blob: string): string {
  if (!blob.startsWith(VERSION_PREFIX)) {
    throw new Error("Unsupported or missing field-encryption version prefix");
  }

  const key = getKey();
  const raw = Buffer.from(blob.slice(VERSION_PREFIX.length), "base64");

  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

export function encryptFields<T extends object>(
  obj: T,
  keys: readonly (keyof T)[],
): T {
  const result = { ...obj };
  for (const key of keys) {
    const value = result[key];
    if (value === null || value === undefined) continue;
    result[key] = encryptField(String(value)) as T[keyof T];
  }
  return result;
}

export function decryptFields<T extends object>(
  obj: T,
  keys: readonly (keyof T)[],
): T {
  const result = { ...obj };
  for (const key of keys) {
    const value = result[key];
    if (value === null || value === undefined) continue;
    result[key] = decryptField(String(value)) as T[keyof T];
  }
  return result;
}
