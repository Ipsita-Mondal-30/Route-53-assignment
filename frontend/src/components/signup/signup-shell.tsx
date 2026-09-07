"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { isValidEmail, setMockSession } from "@/lib/auth";
import { SignupLanguageSelect } from "@/components/signup/signup-language-select";

const linkClass =
  "inline-flex items-center gap-0.5 text-[#0073bb] underline decoration-[#0073bb] underline-offset-2 hover:text-[#00a1c9]";

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 3.5H3.5A1 1 0 0 0 2.5 4.5v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M9.5 2.5h4v4M13.5 2.5 7 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SignupShell() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [accountName, setAccountName] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let valid = true;
    if (!email.trim()) {
      setEmailError("Enter your root user email address.");
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!accountName.trim()) {
      setAccountError("Enter an AWS account name.");
      valid = false;
    } else {
      setAccountError(null);
    }

    if (!valid) {
      return;
    }

    setLoading(true);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 500);
    });
    setMockSession(email);
    setLoading(false);
    router.push("/hosted-zones");
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-white text-[#161e2d]">
      {/* Isometric cubes sit at the bottom corners, not stretched up the sides */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 w-full select-none"
        aria-hidden="true"
      >
        <Image
          src="/images/signup/signup-bg-light.png"
          alt=""
          width={1440}
          height={266}
          className="h-auto w-full"
          priority
        />
      </div>

      <SignupLanguageSelect />

      <div className="relative z-10 flex min-h-dvh flex-col items-center px-4 pt-[70px] pb-8 sm:px-6">
        <Link href="/" className="aws-focus shrink-0" aria-label="AWS home">
          <Image
            src="/images/signup/aws-logo.png"
            alt="Amazon Web Services"
            width={100}
            height={61}
            className="h-auto w-[100px]"
            priority
          />
        </Link>

        <div className="mt-10 grid w-full max-w-[820px] flex-1 grid-cols-1 content-start md:mt-12 md:grid-cols-[1fr_1px_1fr] md:gap-0">
          <section className="flex flex-col items-center px-2 pb-10 text-center md:items-start md:px-6 md:pb-0 md:pr-10 md:text-left lg:pr-12">
            <h2 className="max-w-[280px] text-[20px] leading-[1.4] font-bold text-[#161e2d]">
              Try AWS at no cost for up to 6 months
            </h2>
            <p className="mt-3 max-w-[300px] text-[14px] leading-[1.45] font-normal text-[#161e2d]">
              Start with USD $100 in AWS credits, plus earn up to USD $100 by
              completing various activities.
            </p>
            <div className="mt-10 flex w-full justify-center md:mt-14 md:justify-start md:pl-6">
              <Image
                src="/images/signup/rocket.png"
                alt=""
                width={180}
                height={120}
                className="h-auto w-[150px] sm:w-[170px] md:w-[180px]"
                priority
              />
            </div>
          </section>

          <div
            className="mx-auto hidden w-px self-stretch bg-[#d5dbdb] md:block md:min-h-[540px]"
            aria-hidden="true"
          />

          <section className="mx-auto w-full max-w-[420px] px-2 md:mx-0 md:max-w-none md:px-6 md:pl-10 lg:pl-12">
            <h1 className="text-[24px] leading-[1.25] font-bold text-[#161e2d]">
              Sign up for AWS
            </h1>

            <form className="mt-7" onSubmit={handleVerify} noValidate>
              <div>
                <label
                  htmlFor="root-email"
                  className="block text-[14px] font-bold text-[#161e2d]"
                >
                  Root user email address
                </label>
                <p className="mt-0.5 text-[12px] leading-[1.4] text-[#545b64]">
                  Used for account recovery and as described in the{" "}
                  <a href="#" className={linkClass}>
                    AWS Privacy Notice
                    <ExternalIcon className="h-2.5 w-2.5" />
                  </a>
                </p>
                <input
                  id="root-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? "root-email-error" : undefined}
                  className="mt-2 h-[38px] w-full rounded-md border border-[#9aa0a6] bg-white px-3 text-[14px] text-[#161e2d] outline-none focus:border-[#0073bb] focus:shadow-[0_0_0_1px_#0073bb]"
                />
                {emailError ? (
                  <p
                    id="root-email-error"
                    role="alert"
                    className="mt-1.5 text-[12px] text-[#d13212]"
                  >
                    {emailError}
                  </p>
                ) : null}
              </div>

              <div className="mt-6">
                <label
                  htmlFor="account-name"
                  className="block text-[14px] font-bold text-[#161e2d]"
                >
                  AWS account name
                </label>
                <p className="mt-0.5 text-[12px] leading-[1.4] text-[#545b64]">
                  Choose a name for your account. You can change this name in
                  your account settings after you sign up.
                </p>
                <input
                  id="account-name"
                  name="accountName"
                  type="text"
                  autoComplete="organization"
                  value={accountName}
                  onChange={(event) => {
                    setAccountName(event.target.value);
                    if (accountError) setAccountError(null);
                  }}
                  aria-invalid={accountError ? true : undefined}
                  aria-describedby={
                    accountError ? "account-name-error" : undefined
                  }
                  className="mt-2 h-[38px] w-full rounded-md border border-[#9aa0a6] bg-white px-3 text-[14px] text-[#161e2d] outline-none focus:border-[#0073bb] focus:shadow-[0_0_0_1px_#0073bb]"
                />
                {accountError ? (
                  <p
                    id="account-name-error"
                    role="alert"
                    className="mt-1.5 text-[12px] text-[#d13212]"
                  >
                    {accountError}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-[22px] flex h-[38px] w-full items-center justify-center rounded-[20px] bg-[#ff9900] text-[14px] font-bold text-white outline-none transition-colors hover:bg-[#ec7211] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0073bb] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Verifying…" : "Verify email address"}
              </button>
            </form>

            <div
              className="my-[22px] flex items-center gap-3"
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-[#d5dbdb]" />
              <span className="text-[12px] font-bold text-[#545b64]">OR</span>
              <span className="h-px flex-1 bg-[#d5dbdb]" />
            </div>

            <Link
              href="/login"
              className="flex h-[38px] w-full items-center justify-center rounded-[20px] border-2 border-[#0073bb] bg-white text-[14px] font-bold text-[#0073bb] outline-none transition-colors hover:bg-[#f1f8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0073bb]"
            >
              Sign in to an existing AWS account
            </Link>

            <p className="mt-[22px] text-[12px] leading-[1.4] text-[#545b64]">
              This site uses essential cookies. See our{" "}
              <a href="#" className={linkClass}>
                Cookie Notice
                <ExternalIcon className="h-2.5 w-2.5" />
              </a>{" "}
              for more information.
            </p>
          </section>
        </div>

        <footer className="relative z-10 mt-auto w-full pt-16 pb-6 text-center text-[11px] leading-5 text-[#545b64] sm:pt-20">
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
          >
            <a href="#" className={linkClass}>
              Privacy Policy
              <ExternalIcon className="h-2.5 w-2.5" />
            </a>
            <span aria-hidden="true">|</span>
            <a href="#" className={linkClass}>
              Terms of Use
              <ExternalIcon className="h-2.5 w-2.5" />
            </a>
          </nav>
          <p className="mt-1.5">
            Amazon Web Services, Inc. or its affiliates. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
