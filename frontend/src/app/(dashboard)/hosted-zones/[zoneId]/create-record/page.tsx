"use client";

import { useParams } from "next/navigation";

import { CreateRecordView } from "@/components/console/create-record-view";

export default function CreateRecordPage() {
  const params = useParams<{ zoneId: string }>();
  const zoneId = Array.isArray(params.zoneId) ? params.zoneId[0] : params.zoneId;
  return <CreateRecordView zoneId={zoneId} />;
}
