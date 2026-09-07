import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Amazon Route 53 - DNS Service",
  description:
    "A reliable and cost-effective way to route end users to Internet applications",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${nunito.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
