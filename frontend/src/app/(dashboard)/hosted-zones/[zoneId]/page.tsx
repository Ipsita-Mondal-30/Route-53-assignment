"use client";

import { useParams } from "next/navigation";

import { HostedZoneDetailView } from "@/components/console/hosted-zone-detail-view";

export default function HostedZonePage() {
  const params = useParams<{ zoneId: string }>();
  const zoneId = Array.isArray(params.zoneId) ? params.zoneId[0] : params.zoneId;
  return <HostedZoneDetailView zoneId={zoneId} />;
}
