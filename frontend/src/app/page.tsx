import { ChatIcon, StarIcon } from "@/components/ui/icons";

import { AwsFooter } from "@/components/layout/aws-footer";
import { AwsNavbar } from "@/components/layout/aws-navbar";
import { AwsTopBar } from "@/components/layout/aws-top-bar";
import { Route53Navbar } from "@/components/layout/route53-navbar";
import { Benefits } from "@/components/route53/benefits";
import { Customers } from "@/components/route53/customers";
import { Feedback } from "@/components/route53/feedback";
import { Hero } from "@/components/route53/hero";
import { HowItWorks } from "@/components/route53/how-it-works";
import { ResourceCards } from "@/components/route53/resource-cards";
import { UseCases } from "@/components/route53/use-cases";

function FavoriteButton() {
  return (
    <button
      type="button"
      aria-label="Save this page"
      className="aws-focus fixed top-1/2 right-0 z-50 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-[#d5dbdb] bg-white text-aws-muted shadow-sm"
    >
      <StarIcon className="h-5 w-5" />
    </button>
  );
}

function ChatButton() {
  return (
    <a
      href="#"
      aria-label="Chat with AWS"
      className="aws-focus fixed right-4 bottom-5 z-50 flex h-12 w-12 items-center justify-center rounded-md bg-[#16191f] text-white shadow-[0_4px_16px_rgba(0,0,0,0.28)] hover:bg-black"
    >
      <ChatIcon className="h-6 w-6" />
    </a>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50">
        <AwsTopBar />
        <AwsNavbar />
      </header>

      <div className="hero-gradient">
        <div className="pt-5 md:pt-6">
          <Route53Navbar />
        </div>
        <Hero />
      </div>

      <main>
        <Benefits />
        <HowItWorks />
        <UseCases />
        <Customers />
        <ResourceCards />
        <Feedback />
      </main>

      <AwsFooter />
      <FavoriteButton />
      <ChatButton />
    </div>
  );
}
