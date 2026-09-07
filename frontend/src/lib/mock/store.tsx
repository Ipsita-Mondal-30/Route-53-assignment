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
  INITIAL_HOSTED_ZONES,
  generateZoneId,
  normalizeDomainName,
} from "@/lib/mock/hosted-zones";
import { INITIAL_NOTIFICATIONS } from "@/lib/mock/notifications";
import {
  INITIAL_RECORDS,
  createDefaultZoneRecords,
  generateRecordId,
} from "@/lib/mock/records";
import type {
  ConsoleNotification,
  DnsRecord,
  HostedZone,
  HostedZoneType,
  RecordType,
  RoutingPolicy,
  ZoneTag,
} from "@/lib/mock/types";

const STORAGE_KEY = "route53.mock.store.v2";

type StoreState = {
  zones: HostedZone[];
  records: DnsRecord[];
  notifications: ConsoleNotification[];
};

type RecordInput = {
  name: string;
  type: RecordType;
  value: string;
  ttl: number;
  routingPolicy: RoutingPolicy;
};

type ZoneInput = {
  name: string;
  description: string;
  type: HostedZoneType;
  tags?: ZoneTag[];
  createdBy?: string;
};

type Route53Store = StoreState & {
  hydrated: boolean;
  recordCount: (zoneId: string) => number;
  getZone: (zoneId: string) => HostedZone | undefined;
  getRecords: (zoneId: string) => DnsRecord[];
  createZone: (input: ZoneInput) => HostedZone;
  deleteZones: (zoneIds: string[]) => void;
  createRecord: (zoneId: string, input: RecordInput) => DnsRecord;
  updateRecord: (recordId: string, input: RecordInput) => void;
  deleteRecord: (recordId: string) => void;
};

const Route53StoreContext = createContext<Route53Store | null>(null);

const defaultState: StoreState = {
  zones: INITIAL_HOSTED_ZONES,
  records: INITIAL_RECORDS,
  notifications: INITIAL_NOTIFICATIONS,
};

function loadState(): StoreState {
  if (typeof window === "undefined") {
    return defaultState;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }
    const parsed = JSON.parse(raw) as StoreState;
    if (!Array.isArray(parsed.zones) || !Array.isArray(parsed.records)) {
      return defaultState;
    }
    return {
      zones: parsed.zones.map((zone) => ({
        ...zone,
        createdBy: zone.createdBy ?? "Route 53",
        tags: zone.tags ?? [],
      })),
      records: parsed.records,
      notifications: parsed.notifications ?? [],
    };
  } catch {
    return defaultState;
  }
}

export function Route53StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const recordCount = useCallback(
    (zoneId: string) => state.records.filter((record) => record.zoneId === zoneId).length,
    [state.records],
  );

  const getZone = useCallback(
    (zoneId: string) => state.zones.find((zone) => zone.id === zoneId),
    [state.zones],
  );

  const getRecords = useCallback(
    (zoneId: string) => state.records.filter((record) => record.zoneId === zoneId),
    [state.records],
  );

  const createZone = useCallback((input: ZoneInput) => {
    const name = normalizeDomainName(input.name);
    const zone: HostedZone = {
      id: generateZoneId(),
      name,
      type: input.type,
      description: input.description.trim(),
      createdAt: new Date().toISOString(),
      createdBy: input.createdBy ?? "Route 53",
      tags: (input.tags ?? []).filter((tag) => tag.key.trim()),
    };
    const defaults = createDefaultZoneRecords(zone.id, name);
    setState((current) => ({
      ...current,
      zones: [zone, ...current.zones],
      records: [...defaults, ...current.records],
    }));
    return zone;
  }, []);

  const deleteZones = useCallback((zoneIds: string[]) => {
    const idSet = new Set(zoneIds);
    setState((current) => ({
      ...current,
      zones: current.zones.filter((zone) => !idSet.has(zone.id)),
      records: current.records.filter((record) => !idSet.has(record.zoneId)),
    }));
  }, []);

  const createRecord = useCallback((zoneId: string, input: RecordInput) => {
    const record: DnsRecord = {
      id: generateRecordId(),
      zoneId,
      name: input.name.trim(),
      type: input.type,
      value: input.value.trim(),
      ttl: input.ttl,
      routingPolicy: input.routingPolicy,
    };
    setState((current) => ({
      ...current,
      records: [record, ...current.records],
    }));
    return record;
  }, []);

  const updateRecord = useCallback((recordId: string, input: RecordInput) => {
    setState((current) => ({
      ...current,
      records: current.records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              name: input.name.trim(),
              type: input.type,
              value: input.value.trim(),
              ttl: input.ttl,
              routingPolicy: input.routingPolicy,
            }
          : record,
      ),
    }));
  }, []);

  const deleteRecord = useCallback((recordId: string) => {
    setState((current) => ({
      ...current,
      records: current.records.filter((record) => record.id !== recordId),
    }));
  }, []);

  const value = useMemo<Route53Store>(
    () => ({
      ...state,
      hydrated,
      recordCount,
      getZone,
      getRecords,
      createZone,
      deleteZones,
      createRecord,
      updateRecord,
      deleteRecord,
    }),
    [
      state,
      hydrated,
      recordCount,
      getZone,
      getRecords,
      createZone,
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
