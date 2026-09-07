"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { Loader2, Upload } from "lucide-react";

import { ConsoleButton } from "@/components/console/console-button";
import { ApiError } from "@/lib/api";
import {
  commitBindImport,
  previewBindImport,
  type BindImportResult,
  type BindPreview,
  type DuplicateMode,
  type PreviewStatus,
} from "@/lib/bind-import-api";

const MAX_BYTES = 256 * 1024;
const ALLOWED_EXTENSIONS = new Set(["zone", "bind", "txt"]);

type Step = "select" | "preview" | "result";

type Props = {
  zoneId: string;
  onClose: () => void;
  onImported: () => Promise<void>;
};

export function ImportRecordsPanel({ zoneId, onClose, onImported }: Props) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("select");
  const [dragOver, setDragOver] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<BindPreview | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>("skip");
  const [result, setResult] = useState<BindImportResult | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const applyFile = useCallback(async (file: File) => {
    setError(null);
    const ext = extensionOf(file.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      setFilename(null);
      setFileSize(null);
      setContent("");
      setError("Use a .zone, .bind, or .txt file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setFilename(null);
      setFileSize(null);
      setContent("");
      setError(`Zone file exceeds the ${MAX_BYTES.toLocaleString()} byte size limit.`);
      return;
    }
    const text = await file.text();
    if (text.includes("\u0000")) {
      setFilename(null);
      setFileSize(null);
      setContent("");
      setError("Zone file contains binary data and was rejected.");
      return;
    }
    setFilename(file.name);
    setFileSize(file.size);
    setContent(text);
  }, []);

  async function onContinue() {
    if (!content.trim()) {
      setError("Choose a BIND zone file to import.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await previewBindImport(zoneId, content, filename ?? undefined);
      setPreview(next);
      setDuplicateMode("skip");
      setStep("preview");
    } catch (err) {
      setError(errorMessage(err, "Failed to parse zone file."));
    } finally {
      setBusy(false);
    }
  }

  async function onImport() {
    setBusy(true);
    setError(null);
    let succeeded = false;
    try {
      const next = await commitBindImport(
        zoneId,
        content,
        duplicateMode,
        filename ?? undefined,
      );
      setResult(next);
      setStep("result");
      succeeded = true;
    } catch (err) {
      setError(errorMessage(err, "Failed to import records."));
    } finally {
      setBusy(false);
    }
    if (succeeded) {
      try {
        await onImported();
      } catch {
        /* records are stored; list refresh is best-effort */
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy}
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#414d5c] bg-[#161d27]"
      >
        <div className="border-b border-[#414d5c] px-5 py-4">
          <h3 id={titleId} className="text-[18px] leading-6 font-bold text-white">
            Import records
          </h3>
          <p className="mt-1 text-[14px] leading-5 text-[#d1d5db]">
            Import DNS records from a BIND zone file.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="mb-3 text-[14px] text-[#eb6f6f]" role="alert">
              {error}
            </p>
          ) : null}

          {busy && step === "preview" ? (
            <p className="mb-3 text-[14px] text-[#d1d5db]" role="status">
              Importing records…
            </p>
          ) : null}

          {step === "select" ? (
            <SelectStep
              inputRef={inputRef}
              dragOver={dragOver}
              setDragOver={setDragOver}
              filename={filename}
              fileSize={fileSize}
              onFile={applyFile}
            />
          ) : null}

          {step === "preview" && preview ? (
            <PreviewStep
              preview={preview}
              duplicateMode={duplicateMode}
              onDuplicateMode={setDuplicateMode}
              disabled={busy}
            />
          ) : null}

          {step === "result" && result ? <ResultStep result={result} /> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#414d5c] px-5 py-3">
          {step === "select" ? (
            <>
              <ConsoleButton variant="link" disabled={busy} onClick={onClose}>
                Cancel
              </ConsoleButton>
              <ConsoleButton
                variant="orange"
                disabled={busy || !filename}
                onClick={() => void onContinue()}
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                    Parsing…
                  </span>
                ) : (
                  "Continue"
                )}
              </ConsoleButton>
            </>
          ) : null}
          {step === "preview" ? (
            <>
              <ConsoleButton variant="link" disabled={busy} onClick={onClose}>
                Cancel
              </ConsoleButton>
              <ConsoleButton
                variant="orange"
                disabled={busy || (preview?.counts.valid ?? 0) === 0}
                onClick={() => void onImport()}
              >
                {busy ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                    Importing…
                  </span>
                ) : (
                  "Import"
                )}
              </ConsoleButton>
            </>
          ) : null}
          {step === "result" ? (
            <ConsoleButton variant="orange" onClick={onClose}>
              Close
            </ConsoleButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SelectStep({
  inputRef,
  dragOver,
  setDragOver,
  filename,
  fileSize,
  onFile,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  dragOver: boolean;
  setDragOver: (value: boolean) => void;
  filename: string | null;
  fileSize: number | null;
  onFile: (file: File) => Promise<void>;
}) {
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".zone,.bind,.txt,text/plain"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onFile(file);
          }
          event.target.value = "";
        }}
      />
      <div
        className={`flex min-h-[180px] flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
          dragOver
            ? "border-[#42b4ff] bg-[#1a2838]"
            : "border-[#545b64] bg-[#1b232d]"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const file = event.dataTransfer.files[0];
          if (file) {
            void onFile(file);
          }
        }}
      >
        <Upload className="mb-3 h-8 w-8 text-[#aab7b8]" strokeWidth={1.75} />
        <p className="text-[14px] leading-5 text-white">
          Drag and drop a BIND zone file here
        </p>
        <p className="mt-1 text-[13px] text-[#aab7b8]">
          .zone, .bind, or .txt · max {Math.round(MAX_BYTES / 1024)} KB
        </p>
        <ConsoleButton
          variant="normal"
          className="mt-4 font-bold!"
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </ConsoleButton>
      </div>
      {filename ? (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[14px]">
          <dt className="font-bold text-[#aab7b8]">File</dt>
          <dd className="truncate text-white">{filename}</dd>
          <dt className="font-bold text-[#aab7b8]">Size</dt>
          <dd className="text-white">{formatBytes(fileSize ?? 0)}</dd>
        </dl>
      ) : null}
    </div>
  );
}

function PreviewStep({
  preview,
  duplicateMode,
  onDuplicateMode,
  disabled,
}: {
  preview: BindPreview;
  duplicateMode: DuplicateMode;
  onDuplicateMode: (mode: DuplicateMode) => void;
  disabled?: boolean;
}) {
  const { counts } = preview;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-[13px] leading-5">
        <CountChip label="Valid" value={counts.valid} tone="valid" />
        <CountChip label="Invalid" value={counts.invalid} tone="invalid" />
        <CountChip label="Unsupported" value={counts.unsupported} tone="unsupported" />
        <CountChip label="Duplicate" value={counts.duplicate} tone="duplicate" />
      </div>
      <p className="text-[13px] text-[#aab7b8]">
        Invalid and unsupported records will not be imported.
      </p>
      {counts.duplicate > 0 ? (
        <fieldset className="space-y-2">
          <legend className="text-[14px] font-bold text-white">
            Duplicate records
          </legend>
          <label className="flex items-start gap-2 text-[14px] text-[#d1d5db]">
            <input
              type="radio"
              name="duplicate-mode"
              checked={duplicateMode === "skip"}
              onChange={() => onDuplicateMode("skip")}
              disabled={disabled}
              className="mt-0.5 accent-[#42b4ff]"
            />
            Skip duplicates
          </label>
          <label className="flex items-start gap-2 text-[14px] text-[#d1d5db]">
            <input
              type="radio"
              name="duplicate-mode"
              checked={duplicateMode === "replace"}
              onChange={() => onDuplicateMode("replace")}
              disabled={disabled}
              className="mt-0.5 accent-[#42b4ff]"
            />
            Replace duplicates
          </label>
        </fieldset>
      ) : null}
      <div className="console-table-wrap max-h-[40vh] overflow-auto">
        <table className="hz-table min-w-[720px]">
          <thead>
            <tr>
              {["Name", "Type", "Value", "TTL", "Status"].map((column) => (
                <th key={column}>
                  <span className="text-[14px] leading-5 font-bold text-white">
                    {column}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.records.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#8d99a6]">
                  No records found in this zone file.
                </td>
              </tr>
            ) : (
              preview.records.map((record) => (
                <tr key={record.index}>
                  <td className="whitespace-nowrap text-white">{record.name}</td>
                  <td className="text-white">{record.type}</td>
                  <td className="max-w-[280px] break-all text-white">{record.value}</td>
                  <td className="text-white">{record.ttl}</td>
                  <td>
                    <StatusCell status={record.status} reason={record.reason} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultStep({ result }: { result: BindImportResult }) {
  return (
    <div className="space-y-4">
      <p className="text-[16px] font-bold text-white">Import complete</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[14px]">
        <dt className="text-[#aab7b8]">Imported</dt>
        <dd className="text-white">{result.imported}</dd>
        <dt className="text-[#aab7b8]">Skipped</dt>
        <dd className="text-white">{result.skipped}</dd>
        <dt className="text-[#aab7b8]">Failed</dt>
        <dd className="text-white">{result.failed}</dd>
      </dl>
      {result.failures.length > 0 ? (
        <div className="console-table-wrap max-h-[36vh] overflow-auto">
          <table className="hz-table min-w-[640px]">
            <thead>
              <tr>
                {["Record", "Reason"].map((column) => (
                  <th key={column}>
                    <span className="text-[14px] font-bold text-white">{column}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.failures.map((failure, index) => (
                <tr key={`${failure.name}-${failure.type}-${index}`}>
                  <td className="text-white">
                    <span className="font-mono text-[13px]">
                      {failure.name} {failure.type} {failure.value}
                    </span>
                  </td>
                  <td className="text-[#eb6f6f]">{failure.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function CountChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: PreviewStatus;
}) {
  return (
    <span className="rounded-sm border border-[#414d5c] px-2 py-1 text-white">
      {label}:{" "}
      <span className={statusClass(tone)}>{value}</span>
    </span>
  );
}

function StatusCell({
  status,
  reason,
}: {
  status: PreviewStatus;
  reason: string | null;
}) {
  const label =
    status === "valid"
      ? "Valid"
      : status === "invalid"
        ? "Invalid"
        : status === "unsupported"
          ? "Unsupported"
          : "Duplicate";
  return (
    <div>
      <span className={`font-bold ${statusClass(status)}`}>{label}</span>
      {reason ? (
        <p className="mt-0.5 text-[12px] leading-4 text-[#aab7b8]">{reason}</p>
      ) : null}
    </div>
  );
}

function statusClass(status: PreviewStatus): string {
  if (status === "valid") {
    return "text-[#7ae27a]";
  }
  if (status === "invalid") {
    return "text-[#eb6f6f]";
  }
  if (status === "unsupported") {
    return "text-[#fbd44c]";
  }
  return "text-[#42b4ff]";
}

function extensionOf(name: string): string {
  const base = name.trim().split(/[/\\]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) {
    return "";
  }
  return base.slice(dot + 1).toLowerCase();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.detail;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}
