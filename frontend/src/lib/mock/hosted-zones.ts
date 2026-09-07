import type { HostedZone } from "@/lib/mock/types";

/** Start empty so Hosted zones (0) matches the AWS empty-state screenshot. */
export const INITIAL_HOSTED_ZONES: HostedZone[] = [];

export function generateZoneId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "Z";
  for (let i = 0; i < 17; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function normalizeDomainName(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, "");
}

export function isValidDomainName(value: string): boolean {
  const domain = normalizeDomainName(value);
  if (!domain || domain.length > 253) {
    return false;
  }
  return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
    domain,
  );
}
