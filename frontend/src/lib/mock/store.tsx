"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createDnsRecord as apiCreateRecord,
  deleteDnsRecord as apiDeleteRecord,
  listDnsRecords,
  updateDnsRecord as apiUpdateRecord,
  type RecordInput,
} from "@/lib/dns-records-api";
import {
  createHostedZone as apiCreateZone,
  deleteHostedZone as apiDeleteZone,
  getHostedZone,
  listHostedZones,
  updateHostedZone as apiUpdateZone,
} from "@/lib/hosted-zones-api";
import { normalizeDomainName } from "@/lib/mock/hosted-zones";
import type {
  ConsoleNotification,
  DnsRecord,
  HostedZone,
  HostedZoneType,
  ZoneTag,
} from "@/lib/mock/types";

type ZoneInput = {
  name: string;
  description: string;
  type: HostedZoneType;
  tags?: ZoneTag[];
  createdBy?: string;
};

type Route53Store = {
  zones: HostedZone[];
  records: DnsRecord[];
  notifications: ConsoleNotification[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  refreshZones: () => Promise<void>;
  refreshRecords: (zoneId: string) => Promise<void>;
  recordCount: (zoneId: string) => number;
  getZone: (zoneId: string) => HostedZone | undefined;
  getRecords: (zoneId: string) => DnsRecord[];
  ensureZone: (zoneId: string) => Promise<HostedZone | null>;
  createZone: (input: ZoneInput) => Promise<HostedZone>;
  updateZone: (
    zoneId: string,
    input: { description: string; tags?: ZoneTag[] },
  ) => Promise<HostedZone>;
  deleteZones: (zoneIds: string[]) => Promise<void>;
  createRecord: (zoneId: string, input: RecordInput) => Promise<DnsRecord>;
  updateRecord: (recordId: string, input: RecordInput) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
};

const Route53StoreContext = createContext<Route53Store | null>(null);

export function Route53StoreProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { zones: next } = await listHostedZones({ pageSize: 100 });
      setZones(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load hosted zones");
      throw err;
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, []);

  const refreshRecords = useCallback(async (zoneId: string) => {
    const { records: next } = await listDnsRecords(zoneId, { pageSize: 100 });
    setRecords((current) => [
      ...current.filter((record) => record.zoneId !== zoneId),
      ...next,
    ]);
  }, []);

  useEffect(() => {
    void refreshZones().catch(() => {
      /* error already stored */
    });
  }, [refreshZones]);

  const recordCount = useCallback(
    (zoneId: string) => {
      const zone = zones.find((item) => item.id === zoneId);
      if (typeof zone?.recordCount === "number") {
        return zone.recordCount;
      }
      return records.filter((record) => record.zoneId === zoneId).length;
    },
    [records, zones],
  );

  const getZone = useCallback(
    (zoneId: string) => zones.find((zone) => zone.id === zoneId),
    [zones],
  );

  const getRecords = useCallback(
    (zoneId: string) => records.filter((record) => record.zoneId === zoneId),
    [records],
  );

  const ensureZone = useCallback(async (zoneId: string) => {
    try {
      const zone = await getHostedZone(zoneId);
      setZones((current) => {
        const existing = current.find((item) => item.id === zone.id);
        const merged = {
          ...zone,
          tags: existing?.tags?.length ? existing.tags : zone.tags,
        };
        return current.some((item) => item.id === zone.id)
          ? current.map((item) => (item.id === zone.id ? merged : item))
          : [merged, ...current];
      });
      return zone;
    } catch {
      return null;
    }
  }, []);

  const createZone = useCallback(async (input: ZoneInput) => {
    const zone = await apiCreateZone({
      name: normalizeDomainName(input.name),
      description: input.description.slice(0, 256),
      type: input.type,
    });
    setZones((current) => [zone, ...current.filter((item) => item.id !== zone.id)]);
    return zone;
  }, []);

  const updateZone = useCallback(
    async (zoneId: string, input: { description: string; tags?: ZoneTag[] }) => {
      const zone = await apiUpdateZone(zoneId, {
        description: input.description.slice(0, 256),
      });
      const next: HostedZone = {
        ...zone,
        tags: input.tags ?? zone.tags,
      };
      setZones((current) =>
        current.map((item) => (item.id === zoneId ? next : item)),
      );
      return next;
    },
    [],
  );

  const deleteZones = useCallback(async (zoneIds: string[]) => {
    await Promise.all(zoneIds.map((id) => apiDeleteZone(id)));
    const idSet = new Set(zoneIds);
    setZones((current) => current.filter((zone) => !idSet.has(zone.id)));
    setRecords((current) => current.filter((record) => !idSet.has(record.zoneId)));
  }, []);

  const createRecord = useCallback(async (zoneId: string, input: RecordInput) => {
    const record = await apiCreateRecord(zoneId, input);
    setRecords((current) => [record, ...current]);
    setZones((current) =>
      current.map((zone) =>
        zone.id === zoneId
          ? { ...zone, recordCount: (zone.recordCount ?? 0) + 1 }
          : zone,
      ),
    );
    return record;
  }, []);

  const updateRecord = useCallback(async (recordId: string, input: RecordInput) => {
    const updated = await apiUpdateRecord(recordId, input);
    setRecords((current) =>
      current.map((record) => (record.id === recordId ? updated : record)),
    );
  }, []);

  const deleteRecord = useCallback(async (recordId: string) => {
    await apiDeleteRecord(recordId);
    setRecords((current) => {
      const existing = current.find((record) => record.id === recordId);
      if (existing) {
        setZones((zonesCurrent) =>
          zonesCurrent.map((zone) =>
            zone.id === existing.zoneId
              ? {
                  ...zone,
                  recordCount: Math.max(0, (zone.recordCount ?? 1) - 1),
                }
              : zone,
          ),
        );
      }
      return current.filter((record) => record.id !== recordId);
    });
  }, []);

  const value = useMemo<Route53Store>(
    () => ({
      zones,
      records,
      notifications: [],
      hydrated,
      loading,
      error,
      refreshZones,
      refreshRecords,
      recordCount,
      getZone,
      getRecords,
      ensureZone,
      createZone,
      updateZone,
      deleteZones,
      createRecord,
      updateRecord,
      deleteRecord,
    }),
    [
      zones,
      records,
      hydrated,
      loading,
      error,
      refreshZones,
      refreshRecords,
      recordCount,
      getZone,
      getRecords,
      ensureZone,
      createZone,
      updateZone,
      deleteZones,
      createRecord,
      updateRecord,
      deleteRecord,
    ],
  );

  return (
    <Route53StoreContext.Provider value={value}>
      {children}
    </Route53StoreContext.Provider>
  );
}

export function useRoute53Store(): Route53Store {
  const value = useContext(Route53StoreContext);
  if (!value) {
    throw new Error("useRoute53Store must be used within Route53StoreProvider");
  }
  return value;
}
