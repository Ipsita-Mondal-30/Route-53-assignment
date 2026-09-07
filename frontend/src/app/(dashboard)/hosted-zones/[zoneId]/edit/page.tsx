"use client";

import { useParams } from "next/navigation";

import { EditHostedZoneView } from "@/components/console/edit-hosted-zone-view";

export default function EditHostedZonePage() {
  const params = useParams<{ zoneId: string }>();
  const zoneId = Array.isArray(params.zoneId) ? params.zoneId[0] : params.zoneId;
  return <EditHostedZoneView zoneId={zoneId} />;
}
