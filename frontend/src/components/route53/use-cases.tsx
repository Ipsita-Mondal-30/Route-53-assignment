import { Accordion } from "@/components/ui/accordion";

const items = [
  {
    id: "global-traffic",
    title: "Manage network traffic globally",
    content:
      "Create, visualize, and scale complex routing relationships between records and policies with easy-to-use global DNS features.",
  },
  {
    id: "high-availability",
    title: "Build highly available applications",
    content:
      "Set routing policies to pre-determine and automate responses in case of failure, like redirecting traffic to alternative Availability Zones or Regions.",
  },
  {
    id: "private-dns",
    title: "Set up private DNS",
    content:
      "Assign and access custom domain names in your Amazon Virtual Private Cloud (VPC). Use internal AWS resources and servers without exposing DNS data to the public Internet.",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1450px] gap-10 md:grid-cols-[minmax(220px,0.38fr)_1fr] md:gap-16">
        <h2 className="font-display text-[32px] leading-tight font-medium text-aws-ink">
          Use cases
        </h2>
        <Accordion items={items} />
      </div>
    </section>
  );
}
