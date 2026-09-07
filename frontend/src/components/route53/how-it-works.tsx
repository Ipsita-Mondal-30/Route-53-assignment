const linkClass =
  "aws-focus font-medium text-aws-link underline underline-offset-2";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1450px] gap-10 md:grid-cols-[minmax(220px,0.38fr)_1fr] md:gap-16">
        <h2 className="font-display text-[32px] leading-tight font-medium text-aws-ink">
          How it works
        </h2>
        <p className="text-[17px] leading-8 text-aws-text md:text-[18px] md:leading-8">
          Amazon Route 53 provides highly available and scalable{" "}
          <a href="#benefits" className={linkClass}>
            Domain Name System (DNS)
          </a>
          ,{" "}
          <a href="#benefits" className={linkClass}>
            domain name registration
          </a>
          , and{" "}
          <a href="#how-it-works" className={linkClass}>
            health-checking
          </a>{" "}
          cloud services. It is designed to give developers and businesses an
          extremely reliable and cost-effective way to route end users to
          internet applications by translating names like example.com into the
          numeric IP addresses, such as 192.0.2.1, that computers use to connect
          to each other. You can combine your Route 53 DNS with health-checking
          services to route traffic to healthy endpoints or to independently
          monitor and alarm on endpoints. You can also use the{" "}
          <a href="#use-cases" className={linkClass}>
            Traffic Flow
          </a>{" "}
          visual policy builder to simplify the implementation of your routing
          policies, and you can purchase and manage domain names such as
          example.com and automatically configure DNS settings for your domains.
          In addition,{" "}
          <a href="#get-started" className={linkClass}>
            Route 53 Resolver
          </a>{" "}
          provides a regional DNS service that performs recursive DNS lookups
          for names hosted in Amazon Elastic Compute Cloud (EC2), as well as
          public names on the internet. Lastly, the{" "}
          <a href="#get-started" className={linkClass}>
            Route 53 Resolver DNS Firewall
          </a>{" "}
          allows you to block queries made for known or suspected malicious
          domains, and to allow queries for trusted domains when using the Route
          53 Resolver for recursive DNS resolution.
        </p>
      </div>
    </section>
  );
}
