import { ConsoleButton } from "@/components/console/console-button";

export function HostedZoneEmptyState() {
  return (
    <div className="flex min-h-[min(52vh,480px)] flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-[18px] leading-6 font-bold text-[var(--c-text-heading)]">No hosted zones</p>
      <p className="mt-2 text-[14px] leading-5 font-bold text-[var(--c-text-muted)]">
        There are no hosted zones created for this account.
      </p>
      <div className="mt-6">
        <ConsoleButton href="/hosted-zones/new" variant="orange" className="!font-bold">
          Create hosted zone
        </ConsoleButton>
      </div>
    </div>
  );
}
