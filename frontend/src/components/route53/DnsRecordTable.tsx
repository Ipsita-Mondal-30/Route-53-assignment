"use client";

import type { DnsRecord } from "@/lib/mock/types";
import { SortChevronIcon } from "@/components/route53/icons";

type Props = {
  records: DnsRecord[];
  onEdit: (record: DnsRecord) => void;
  onDelete: (record: DnsRecord) => void;
};

const COLUMNS = [
  "Record name",
  "Type",
  "Value",
  "TTL",
  "Routing policy",
  "Actions",
] as const;

export function DnsRecordTable({ records, onEdit, onDelete }: Props) {
  return (
    <div className="console-table-wrap border-t border-[#414d5c]">
      <table className="hz-table">
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column}>
                <span className="inline-flex items-center text-[14px] font-bold text-[var(--c-text-heading)]">
                  {column}
                  {column !== "Actions" ? (
                    <SortChevronIcon className="hz-sort-icon h-3.5 w-2.5 text-[#aab7b8]" />
                  ) : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-10 text-center text-[#8d99a6]">
                No records to display
              </td>
            </tr>
          ) : (
            records.map((record) => (
              <tr key={record.id}>
                <td className="whitespace-nowrap">{record.name}</td>
                <td>{record.type}</td>
                <td className="max-w-[360px]">
                  <span className="block whitespace-pre-line break-all">{record.value}</span>
                </td>
                <td>{record.ttl}</td>
                <td>{record.routingPolicy}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-[13px] text-[#42b4ff] hover:underline"
                      onClick={() => onEdit(record)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-[13px] text-[#eb6f6f] hover:underline"
                      onClick={() => onDelete(record)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
