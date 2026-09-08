import { AskAwsWidget } from "@/components/layout/ask-aws-widget";
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
import { SatisfactionSurvey } from "@/components/route53/satisfaction-survey";
import { UseCases } from "@/components/route53/use-cases";

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-white">
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
      <SatisfactionSurvey />
      <AskAwsWidget />
    </div>
  );
}
