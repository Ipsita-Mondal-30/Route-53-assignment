import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FaAws } from "react-icons/fa";

import { LoginCard } from "@/components/auth/login-card";
import { LoginFooter } from "@/components/auth/login-footer";

export const metadata: Metadata = {
  title: "AWS Builder ID Sign-in",
  description: "Sign in with AWS Builder ID",
};

export default function LoginPage() {
  return (
    <div
      className="flex min-h-dvh flex-col bg-[#0a1628] bg-cover bg-center bg-no-repeat text-white"
      style={{
        backgroundImage: "url(/images/auth/builderid-dark-background.png)",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="absolute top-0 left-0 z-10 px-6 pt-6 sm:px-8 sm:pt-7">
        <Link
          href="/"
          className="aws-focus inline-flex text-white"
          aria-label="AWS home"
        >
          <FaAws className="h-auto w-10 sm:w-12" aria-hidden="true" />
        </Link>
      </header>

      <main className="flex flex-1 justify-center items-start px-0 pt-16 sm:pt-[65px] pb-6">
        <Suspense fallback={<div className="text-[#aab7b8]">Loading…</div>}>
          <LoginCard />
        </Suspense>
      </main>

      <LoginFooter />
    </div>
  );
}
