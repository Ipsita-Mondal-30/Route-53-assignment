import { Accordion } from "@/components/ui/accordion";

const items = [
  {
    id: "reliable-routing",
    title:
      "Route end users to your site reliably with globally-dispersed Domain Name System (DNS) servers and automatic scaling.",
    content:
      "Amazon Route 53 ensures reliable and efficient routing of end users to your website by leveraging globally-dispersed Domain Name System (DNS) servers. With automatic scaling, the service dynamically adjusts to varying workloads, optimizing performance and maintaining a seamless user experience.",
  },
  {
    id: "setup-minutes",
    title:
      "Set up your DNS routing in minutes with domain name registration and straightforward visual traffic flow tools.",
    content:
      "Amazon Route 53 streamlines the setup of DNS routing by providing quick and easy domain name registration, complemented by straightforward visual traffic flow tools. This enables users to configure their DNS settings within minutes, simplifying the process of managing and directing web traffic efficiently.",
  },
  {
    id: "custom-policies",
    title:
      "Customize your DNS routing policies to reduce latency, improve application availability, and maintain compliance.",
    content:
      "Amazon Route 53 allows users to tailor DNS routing policies to specific needs, such as reducing latency, enhancing application availability, and ensuring compliance. This customization empowers users to optimize their DNS configurations for performance, resilience, and adherence to regulatory requirements.",
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1450px] gap-10 md:grid-cols-[minmax(220px,0.38fr)_1fr] md:gap-16">
        <h2 className="font-display text-[32px] leading-tight font-medium text-aws-ink">
          Benefits of Route 53
        </h2>
        <Accordion items={items} />
      </div>
    </section>
  );
}
