import { encryptJSON, decryptJSON, sha256Hex } from "@/shared/crypto/crypto";
import type { Budget, Category, Reminder, Transaction, Wallet } from "@/shared/types";

export const CATKEU_VERSION = "1.0";
export const CATKEU_HEADER_SEPARATOR = "---";

export interface BackupPayload {
  version: string;
  exportedAt: string;
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  reminders: Reminder[];
}

export interface ParsedHeader {
  version: string;
  encrypted: boolean;
  created: string;
  checksum: string;
}

export interface ImportPreview {
  exportedAt: string;
  wallets: number;
  transactions: number;
  categories: number;
  budgets: number;
  reminders: number;
}

export async function buildCatkeuFile(payload: BackupPayload, key: CryptoKey): Promise<string> {
  const plaintext = JSON.stringify(payload);
  const checksum = await sha256Hex(plaintext);
  const { iv, blob } = await encryptJSON(key, payload);
  const encryptedB64 = `${iv}:${blob}`;

  return [
    `CATKEU/${CATKEU_VERSION}`,
    `encrypted:true`,
    `created:${new Date().toISOString()}`,
    `checksum:${checksum}`,
    CATKEU_HEADER_SEPARATOR,
    encryptedB64,
  ].join("\n");
}

export function parseCatkeuHeader(content: string): { header: ParsedHeader; body: string } | null {
  const sepIdx = content.indexOf(`\n${CATKEU_HEADER_SEPARATOR}\n`);
  if (sepIdx === -1) return null;

  const headerBlock = content.slice(0, sepIdx);
  const body = content.slice(sepIdx + CATKEU_HEADER_SEPARATOR.length + 2);
  const lines = headerBlock.split("\n");
  const firstLine = lines[0] ?? "";
  if (!firstLine.startsWith("CATKEU/")) return null;

  const version = firstLine.replace("CATKEU/", "");
  const get = (key: string) => {
    const line = lines.find((l) => l.startsWith(`${key}:`));
    return line?.slice(key.length + 1) ?? "";
  };

  return {
    header: {
      version,
      encrypted: get("encrypted") === "true",
      created: get("created"),
      checksum: get("checksum"),
    },
    body,
  };
}

export async function decryptCatkeuBody(body: string, key: CryptoKey): Promise<BackupPayload | null> {
  try {
    const colonIdx = body.indexOf(":");
    if (colonIdx === -1) return null;
    const iv = body.slice(0, colonIdx);
    const blob = body.slice(colonIdx + 1).trim();
    return await decryptJSON<BackupPayload>(key, { iv, blob });
  } catch {
    return null;
  }
}
