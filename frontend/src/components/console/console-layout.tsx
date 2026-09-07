"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { ConsoleFooter } from "@/components/console/console-footer";
import { GlobalNav } from "@/components/console/global-nav";
import { Route53Sidebar } from "@/components/console/route53-sidebar";
import {
  ServiceBreadcrumb,
  type BreadcrumbCrumb,
} from "@/components/console/service-breadcrumb";
import { DEMO_CONSOLE_SESSION, ensureConsoleSession } from "@/lib/auth";
import { Route53StoreProvider } from "@/lib/mock/store";

function crumbsForPath(pathname: string): BreadcrumbCrumb[] {
  if (pathname === "/hosted-zones/new") {
    return [
      { label: "Hosted zones", href: "/hosted-zones" },
      { label: "Create hosted zone" },
    ];
  }
  if (pathname.startsWith("/hosted-zones/") && pathname !== "/hosted-zones/new") {
    return [
      { label: "Hosted zones", href: "/hosted-zones" },
      { label: "Hosted zone details" },
    ];
  }
  if (pathname === "/hosted-zones") {
    return [{ label: "Hosted zones" }];
  }
  if (pathname === "/health-checks") return [{ label: "Health checks" }];
  if (pathname === "/profiles") return [{ label: "Profiles" }];
  if (pathname === "/traffic-policies") return [{ label: "Traffic policies" }];
  if (pathname === "/traffic-flow/policy-records") return [{ label: "Policy records" }];
  if (pathname === "/domains/registered") return [{ label: "Registered domains" }];
  if (pathname === "/domains/requests") return [{ label: "Requests" }];
  if (pathname === "/resolver/global") return [{ label: "Global resolvers" }];
  if (pathname === "/resolver/shared-dns-views") return [{ label: "Shared DNS views" }];
  if (pathname === "/resolver/vpcs") return [{ label: "VPCs" }];
  if (pathname === "/resolver/inbound-endpoints") return [{ label: "Inbound endpoints" }];
  if (pathname === "/resolver/outbound-endpoints") return [{ label: "Outbound endpoints" }];
  if (pathname === "/resolver/rules") return [{ label: "Rules" }];
  if (pathname === "/resolver/query-logging") return [{ label: "Query logging" }];
  if (pathname === "/resolver/outposts") return [{ label: "Outposts" }];
  if (pathname === "/routing/cidr-collections") return [{ label: "CIDR collections" }];
  return [{ label: "Dashboard" }];
}

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

  const crumbs = useMemo(() => crumbsForPath(pathname), [pathname]);

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
        <ServiceBreadcrumb crumbs={crumbs} onToggleSidebar={toggleSidebar} />
        <div className="flex min-h-0 min-w-0 flex-1">
          <Route53Sidebar
            open={mobileOpen}
            collapsed={collapsed}
            onCollapse={() => setCollapsed(true)}
            onCloseMobile={() => setMobileOpen(false)}
          />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto px-4 py-5 sm:px-5 lg:px-6">
            {children}
          </main>
        </div>
        <ConsoleFooter />
      </div>
    </Route53StoreProvider>
  );
}
