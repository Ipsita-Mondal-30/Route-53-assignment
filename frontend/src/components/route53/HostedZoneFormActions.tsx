import { ConsoleButton } from "@/components/console/console-button";

type Props = {
  submitting?: boolean;
  onCancelHref?: string;
  submitLabel?: string;
};

export function HostedZoneFormActions({
  submitting = false,
  onCancelHref = "/hosted-zones",
  submitLabel = "Create hosted zone",
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4 pt-2 pb-8">
      <ConsoleButton href={onCancelHref} variant="link" className="!font-bold">
        Cancel
      </ConsoleButton>
      <ConsoleButton type="submit" variant="orange" disabled={submitting}>
        {submitLabel}
      </ConsoleButton>
    </div>
  );
}
