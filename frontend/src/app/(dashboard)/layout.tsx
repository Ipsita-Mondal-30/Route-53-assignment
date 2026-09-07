import type { ReactNode } from "react";

import { ConsoleLayout } from "@/components/console/console-layout";

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return <ConsoleLayout>{children}</ConsoleLayout>;
}
