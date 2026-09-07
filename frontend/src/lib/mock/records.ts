import type { DnsRecord, RecordType } from "@/lib/mock/types";

export const RECORD_TYPES: RecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "SOA",
  "PTR",
  "SRV",
];

/** No seed records — records are created with each new hosted zone. */
export const INITIAL_RECORDS: DnsRecord[] = [];

export function createDefaultZoneRecords(
  zoneId: string,
  domain: string,
): DnsRecord[] {
  const nsHost = `ns-${1000 + (domain.length % 900)}.awsdns-${10 + (domain.length % 50)}.org.`;
  return [
    {
      id: `r-${zoneId}-ns`,
      zoneId,
      name: domain,
      type: "NS",
      value: `${nsHost}\nns-187.awsdns-23.com.\nns-860.awsdns-43.net.\nns-2001.awsdns-58.co.uk.`,
      ttl: 172800,
      routingPolicy: "Simple",
    },
    {
      id: `r-${zoneId}-soa`,
      zoneId,
      name: domain,
      type: "SOA",
      value: `${nsHost} awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400`,
      ttl: 900,
      routingPolicy: "Simple",
    },
  ];
}

export function generateRecordId(): string {
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
