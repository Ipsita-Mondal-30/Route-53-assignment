import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { THEME_INIT_SCRIPT } from "@/lib/user-settings-storage";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Amazon Route 53 - DNS Service",
  description:
    "A reliable and cost-effective way to route end users to Internet applications",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className={inter.className} suppressHydrationWarning>
        <Script
          id="route53-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        {children}
      </body>
    </html>
  );
}
