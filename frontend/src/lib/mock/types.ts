export type RecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "TXT"
  | "NS"
  | "SOA"
  | "PTR"
  | "SRV";

export type RoutingPolicy =
  | "Simple"
  | "Weighted"
  | "Latency"
  | "Failover"
  | "Geolocation"
  | "Multivalue";

export type HostedZoneType = "Public" | "Private";

export type HostedZone = {
  id: string;
  name: string;
  type: HostedZoneType;
  description: string;
  createdAt: string;
};

export type DnsRecord = {
  id: string;
  zoneId: string;
  name: string;
  type: RecordType;
  value: string;
  ttl: number;
  routingPolicy: RoutingPolicy;
};

export type ConsoleNotification = {
  id: string;
  resource: string;
  status: string;
  lastUpdate: string;
};
