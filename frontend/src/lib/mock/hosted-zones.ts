import type { HostedZone } from "@/lib/mock/types";

export const INITIAL_HOSTED_ZONES: HostedZone[] = [
  {
    id: "Z03558412A2B3C4D5E6",
    name: "example.com",
    type: "Public",
    description: "Production website",
    createdAt: "2024-11-12T09:14:00.000Z",
  },
  {
    id: "Z0192837465ABCDEFG",
    name: "example.org",
    type: "Public",
    description: "Marketing site",
    createdAt: "2025-02-03T16:22:00.000Z",
  },
  {
    id: "Z0987654321WXYZABC",
    name: "myapp.dev",
    type: "Public",
    description: "Application frontend",
    createdAt: "2025-06-18T11:05:00.000Z",
  },
  {
    id: "Z11122233344455566",
    name: "corp.internal",
    type: "Private",
    description: "Internal VPC services",
    createdAt: "2025-08-01T08:40:00.000Z",
  },
];

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
