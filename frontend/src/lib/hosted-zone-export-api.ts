import { ApiError, getApiBaseUrl, parseDetail } from "@/lib/api";

export type ExportFormat = "json" | "bind";

function filenameFromDisposition(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const star = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      return star[1];
    }
  }
  const quoted = header.match(/filename="([^"]+)"/i);
  if (quoted?.[1]) {
    return quoted[1];
  }
  const plain = header.match(/filename=([^;]+)/i);
  return plain?.[1]?.trim() ?? null;
}

export function zoneExportFilename(zoneName: string, format: ExportFormat): string {
  const stem = zoneName.trim().toLowerCase().replace(/\.$/, "") || "hosted-zone";
  return `${stem}.${format === "json" ? "json" : "zone"}`;
}

export function triggerBrowserDownload(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadResponse(
  response: Response,
  fallbackName: string,
): Promise<void> {
  if (!response.ok) {
    throw new ApiError(response.status, await parseDetail(response));
  }
  const filename =
    response.headers.get("X-Export-Filename") ||
    filenameFromDisposition(response.headers.get("Content-Disposition")) ||
    fallbackName;
  const blob = await response.blob();
  triggerBrowserDownload(blob, filename);
}

export async function downloadHostedZoneExport(
  zoneId: string,
  format: ExportFormat,
  fallbackName: string,
): Promise<void> {
  const query = new URLSearchParams({ format });
  const response = await fetch(
    `${getApiBaseUrl()}/hosted-zones/${encodeURIComponent(zoneId)}/export?${query}`,
    { credentials: "include" },
  );
  await downloadResponse(response, fallbackName);
}

export async function downloadSelectedHostedZonesExport(
  zoneIds: string[],
  format: ExportFormat,
  fallbackName: string,
): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/hosted-zones/export`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zone_ids: zoneIds, format }),
  });
  await downloadResponse(response, fallbackName);
}
