import { apiFetch } from "@/lib/api";
import type { DnsRecord, RecordType, RoutingPolicy } from "@/lib/mock/types";

export type DnsRecordApi = {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: RecordType;
  ttl: number;
  value: string;
  priority: number | null;
  weight: number | null;
  port: number | null;
  caa_flag: number | null;
  caa_tag: string | null;
  created_at: string;
  updated_at: string;
};

export type DnsRecordListApi = {
  items: DnsRecordApi[];
  total: number;
  page: number;
  page_size: number;
};

export type RecordInput = {
  name: string;
  type: RecordType;
  value: string;
  ttl: number;
  routingPolicy?: RoutingPolicy;
  priority?: number;
  weight?: number;
  port?: number;
  caaFlag?: number;
  caaTag?: "issue" | "issuewild" | "iodef";
};

const WRITEABLE_TYPES = new Set<RecordType>([
  "A",
  "AAAA",
  "CNAME",
  "TXT",
  "MX",
  "NS",
  "PTR",
  "SRV",
  "CAA",
]);

function displayValue(api: DnsRecordApi): string {
  if (api.type === "MX" && api.priority != null) {
    return `${api.priority} ${api.value}`;
  }
  if (
    api.type === "SRV" &&
    api.priority != null &&
    api.weight != null &&
    api.port != null
  ) {
    return `${api.priority} ${api.weight} ${api.port} ${api.value}`;
  }
  if (api.type === "CAA" && api.caa_flag != null && api.caa_tag) {
    return `${api.caa_flag} ${api.caa_tag} ${api.value}`;
  }
  return api.value;
}

export function mapDnsRecord(api: DnsRecordApi): DnsRecord {
  return {
    id: api.id,
    zoneId: api.hosted_zone_id,
    name: api.name,
    type: api.type,
    value: displayValue(api),
    ttl: api.ttl,
    routingPolicy: "Simple",
    priority: api.priority ?? undefined,
    weight: api.weight ?? undefined,
    port: api.port ?? undefined,
    caaFlag: api.caa_flag ?? undefined,
    caaTag: api.caa_tag ?? undefined,
  };
}

function parseLeadingInt(tokens: string[]): number | null {
  if (tokens.length === 0) {
    return null;
  }
  const n = Number(tokens[0]);
  return Number.isInteger(n) ? n : null;
}

/** Build a FastAPI discriminated-union write body from the record form. */
export function toDnsRecordWriteBody(input: RecordInput): Record<string, unknown> {
  if (!WRITEABLE_TYPES.has(input.type)) {
    throw new Error(
      `Record type ${input.type} is not supported by the API. Use A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, or CAA.`,
    );
  }

  const name = input.name.trim();
  const ttl = input.ttl;
  const raw = input.value.trim();
  const tokens = raw.split(/\s+/).filter(Boolean);

  if (input.type === "MX") {
    const priority =
      input.priority ??
      parseLeadingInt(tokens) ??
      (() => {
        throw new Error("MX records require a priority (e.g. 10 mail.example.com).");
      })();
    const value =
      input.priority != null
        ? raw
        : tokens.slice(1).join(" ") ||
          (() => {
            throw new Error("MX records require a mail server hostname.");
          })();
    return { name, type: "MX", ttl, value, priority };
  }

  if (input.type === "SRV") {
    let priority = input.priority;
    let weight = input.weight;
    let port = input.port;
    let value = raw;

    if (priority == null || weight == null || port == null) {
      if (tokens.length < 4) {
        throw new Error(
          "SRV records require priority weight port target (e.g. 10 5 5060 sip.example.com).",
        );
      }
      priority = Number(tokens[0]);
      weight = Number(tokens[1]);
      port = Number(tokens[2]);
      value = tokens.slice(3).join(" ");
    }

    return { name, type: "SRV", ttl, value, priority, weight, port };
  }

  if (input.type === "CAA") {
    let caaFlag = input.caaFlag;
    let caaTag = input.caaTag;
    let value = raw;

    if (caaFlag == null || !caaTag) {
      if (tokens.length < 3) {
        throw new Error(
          "CAA records require flag tag value (e.g. 0 issue letsencrypt.org).",
        );
      }
      caaFlag = Number(tokens[0]);
      const tag = tokens[1];
      if (tag !== "issue" && tag !== "issuewild" && tag !== "iodef") {
        throw new Error("CAA tag must be issue, issuewild, or iodef.");
      }
      caaTag = tag;
      value = tokens.slice(2).join(" ");
    }

    return {
      name,
      type: "CAA",
      ttl,
      value,
      caa_flag: caaFlag,
      caa_tag: caaTag,
    };
  }

  return { name, type: input.type, ttl, value: raw };
}

export async function listDnsRecords(
  zoneId: string,
  params?: { search?: string; type?: string; page?: number; pageSize?: number },
): Promise<{ records: DnsRecord[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.search?.trim()) {
    query.set("search", params.search.trim());
  }
  if (params?.type && params.type !== "all") {
    query.set("type", params.type);
  }
  query.set("page", String(params?.page ?? 1));
  query.set("page_size", String(params?.pageSize ?? 100));

  const data = await apiFetch<DnsRecordListApi>(
    `/hosted-zones/${zoneId}/records?${query.toString()}`,
  );
  return {
    records: data.items.map(mapDnsRecord),
    total: data.total,
  };
}

export async function createDnsRecord(
  zoneId: string,
  input: RecordInput,
): Promise<DnsRecord> {
  const body = toDnsRecordWriteBody(input);
  const data = await apiFetch<DnsRecordApi>(`/hosted-zones/${zoneId}/records`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapDnsRecord(data);
}

export async function updateDnsRecord(
  recordId: string,
  input: RecordInput,
): Promise<DnsRecord> {
  const body = toDnsRecordWriteBody(input);
  const data = await apiFetch<DnsRecordApi>(`/records/${recordId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapDnsRecord(data);
}

export async function deleteDnsRecord(recordId: string): Promise<void> {
  await apiFetch<void>(`/records/${recordId}`, { method: "DELETE" });
}
