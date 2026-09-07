import { apiFetch } from "@/lib/api";
import type { HostedZone, HostedZoneType } from "@/lib/mock/types";

export type HostedZoneApi = {
  id: string;
  name: string;
  type: HostedZoneType;
  comment: string | null;
  record_count: number;
  created_by: number;
  created_at: string;
  updated_at: string;
};

export type HostedZoneListApi = {
  items: HostedZoneApi[];
  total: number;
  page: number;
  page_size: number;
};

export type CreateHostedZoneInput = {
  name: string;
  description?: string;
  type?: HostedZoneType;
};

export function mapHostedZone(api: HostedZoneApi): HostedZone {
  return {
    id: api.id,
    name: api.name,
    type: api.type,
    description: api.comment ?? "",
    createdAt: api.created_at,
    createdBy: String(api.created_by),
    tags: [],
    recordCount: api.record_count,
  };
}

export async function listHostedZones(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ zones: HostedZone[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.search?.trim()) {
    query.set("search", params.search.trim());
  }
  query.set("page", String(params?.page ?? 1));
  query.set("page_size", String(params?.pageSize ?? 100));
  query.set("sort_by", "created_at");
  query.set("sort_order", "desc");

  const data = await apiFetch<HostedZoneListApi>(
    `/hosted-zones?${query.toString()}`,
  );
  return {
    zones: data.items.map(mapHostedZone),
    total: data.total,
  };
}

export async function getHostedZone(zoneId: string): Promise<HostedZone> {
  const data = await apiFetch<HostedZoneApi>(`/hosted-zones/${zoneId}`);
  return mapHostedZone(data);
}

export async function createHostedZone(
  input: CreateHostedZoneInput,
): Promise<HostedZone> {
  const data = await apiFetch<HostedZoneApi>("/hosted-zones", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      comment: input.description?.trim() || null,
      type: input.type ?? "Public",
    }),
  });
  return mapHostedZone(data);
}

export async function deleteHostedZone(zoneId: string): Promise<void> {
  await apiFetch<void>(`/hosted-zones/${zoneId}`, { method: "DELETE" });
}
