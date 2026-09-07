"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ConsoleFooter } from "@/components/console/console-footer";
import { GlobalNav } from "@/components/console/global-nav";
import { Route53Sidebar } from "@/components/console/route53-sidebar";
import { ServiceBreadcrumb } from "@/components/console/service-breadcrumb";
import { DEMO_CONSOLE_SESSION, ensureConsoleSession } from "@/lib/auth";
import { Route53StoreProvider } from "@/lib/mock/store";

const BREADCRUMBS: { match: (path: string) => boolean; label: string }[] = [
  { match: (path) => path === "/dashboard", label: "Dashboard" },
  { match: (path) => path === "/hosted-zones/new", label: "Create hosted zone" },
  { match: (path) => path.startsWith("/hosted-zones/"), label: "Hosted zone details" },
  { match: (path) => path === "/hosted-zones", label: "Hosted zones" },
  { match: (path) => path === "/health-checks", label: "Health checks" },
  { match: (path) => path === "/profiles", label: "Profiles" },
  { match: (path) => path === "/traffic-policies", label: "Traffic policies" },
  { match: (path) => path === "/traffic-flow/policy-records", label: "Policy records" },
  { match: (path) => path === "/domains/registered", label: "Registered domains" },
  { match: (path) => path === "/domains/requests", label: "Requests" },
  { match: (path) => path === "/resolver/global", label: "Global resolvers" },
  { match: (path) => path === "/resolver/shared-dns-views", label: "Shared DNS views" },
  { match: (path) => path === "/resolver/vpcs", label: "VPCs" },
  { match: (path) => path === "/resolver/inbound-endpoints", label: "Inbound endpoints" },
  { match: (path) => path === "/resolver/outbound-endpoints", label: "Outbound endpoints" },
  { match: (path) => path === "/resolver/rules", label: "Rules" },
  { match: (path) => path === "/resolver/query-logging", label: "Query logging" },
  { match: (path) => path === "/resolver/outposts", label: "Outposts" },
  { match: (path) => path === "/routing/cidr-collections", label: "CIDR collections" },
];

export function ConsoleLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState(DEMO_CONSOLE_SESSION);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("console-mode");
    setSession(ensureConsoleSession());
    return () => document.documentElement.classList.remove("console-mode");
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = useMemo(() => {
    return BREADCRUMBS.find((item) => item.match(pathname))?.label ?? "Dashboard";
  }, [pathname]);

  function toggleSidebar() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((value) => !value);
    } else {
      setMobileOpen((value) => !value);
    }
  }

  return (
    <Route53StoreProvider>
      <div className="aws-console flex h-dvh flex-col overflow-hidden">
        <GlobalNav session={session} />
        <ServiceBreadcrumb current={current} onToggleSidebar={toggleSidebar} />
        <div className="flex min-h-0 min-w-0 flex-1">
          <Route53Sidebar
            open={mobileOpen}
            collapsed={collapsed}
            onCollapse={() => setCollapsed(true)}
            onCloseMobile={() => setMobileOpen(false)}
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <main className="min-h-0 min-w-0 flex-1 overflow-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
              {children}
            </main>
            <ConsoleFooter />
          </div>
        </div>
      </div>
    </Route53StoreProvider>
  );
}
