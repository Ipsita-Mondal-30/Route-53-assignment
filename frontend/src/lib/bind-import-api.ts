import { apiFetch } from "@/lib/api";

export type DuplicateMode = "skip" | "replace";
export type PreviewStatus = "valid" | "invalid" | "unsupported" | "duplicate";

export type BindPreviewRecord = {
  index: number;
  line: number;
  name: string;
  type: string;
  value: string;
  ttl: number;
  priority: number | null;
  weight: number | null;
  port: number | null;
  caa_flag: number | null;
  caa_tag: string | null;
  status: PreviewStatus;
  reason: string | null;
};

export type BindPreview = {
  origin: string;
  default_ttl: number;
  records: BindPreviewRecord[];
  counts: {
    valid: number;
    invalid: number;
    unsupported: number;
    duplicate: number;
  };
};

export type BindImportFailure = {
  name: string;
  type: string;
  value: string;
  reason: string;
};

export type BindImportResult = {
  imported: number;
  skipped: number;
  failed: number;
  failures: BindImportFailure[];
};

export async function previewBindImport(
  zoneId: string,
  content: string,
  filename?: string,
): Promise<BindPreview> {
  return apiFetch<BindPreview>(
    `/hosted-zones/${zoneId}/records/import/preview`,
    {
      method: "POST",
      body: JSON.stringify({ content, filename: filename ?? null }),
    },
  );
}

export async function commitBindImport(
  zoneId: string,
  content: string,
  duplicateMode: DuplicateMode,
  filename?: string,
): Promise<BindImportResult> {
  return apiFetch<BindImportResult>(`/hosted-zones/${zoneId}/records/import`, {
    method: "POST",
    body: JSON.stringify({
      content,
      filename: filename ?? null,
      duplicate_mode: duplicateMode,
    }),
  });
}
