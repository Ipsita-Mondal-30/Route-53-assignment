"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { MultiSessionSelect } from "@/components/signin/multi-session-select";
import { SignupLanguageSelect } from "@/components/signup/signup-language-select";
import { setMockSession } from "@/lib/auth";

const dottedLink =
  "text-[#0073bb] underline decoration-dotted underline-offset-2 hover:decoration-solid";
const solidLink =
  "text-[#0073bb] underline decoration-[#0073bb] underline-offset-2 hover:text-[#00a1c9]";

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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="#0073bb" />
      <path
        d="M8 7.2v4.2M8 4.8v.8"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const inputClass =
  "mt-1.5 h-9 w-full rounded-md border border-[#8d96a0] bg-white px-3 text-[14px] text-[#161e2d] outline-none focus:border-[#0073bb] focus:shadow-[0_0_0_1px_#0073bb]";

export function SigninShell() {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!accountId.trim() || !username.trim() || !password.trim()) {
      setError("Enter your account ID, IAM username, and password.");
      return;
    }

    setError(null);
    setLoading(true);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 500);
    });
    setMockSession(`${username.trim()}@${accountId.trim()}`);
    setLoading(false);
    router.push("/hosted-zones");
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#f6f7f8] text-[#161e2d]">
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-0 w-[min(42vw,340px)] select-none sm:w-[min(38vw,400px)] md:w-[min(34vw,440px)]"
        aria-hidden="true"
      >
        <Image
          src="/images/signup/background-left.png"
          alt=""
          width={474}
          height={638}
          className="h-auto w-full"
          priority
        />
      </div>
      <div
        className="pointer-events-none absolute right-0 bottom-0 z-0 w-[min(40vw,320px)] select-none sm:w-[min(36vw,380px)] md:w-[min(32vw,420px)]"
        aria-hidden="true"
      >
        <Image
          src="/images/signup/background-right.png"
          alt=""
          width={458}
          height={596}
          className="h-auto w-full"
          priority
        />
      </div>

      <div className="absolute top-5 right-6 z-30 flex flex-wrap items-center justify-end gap-x-5 gap-y-2 sm:right-10">
        <a href="#" className="aws-focus text-[14px] font-semibold text-[#0073bb]">
          Provide feedback
        </a>
        <MultiSessionSelect />
        <SignupLanguageSelect className="relative" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-4 pt-[68px] pb-10 sm:px-6">
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

        {bannerVisible ? (
          <div className="mt-8 flex w-full max-w-[800px] flex-col gap-3 rounded-lg border border-[#0073bb] bg-[#f1f8ff] px-4 py-3 sm:flex-row sm:items-start sm:gap-4 sm:px-5">
            <div className="flex min-w-0 flex-1 gap-3">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 text-[14px] leading-[1.45]">
                <p className="font-bold text-[#161e2d]">
                  AWS sign-in is getting an update
                </p>
                <p className="mt-1 text-[#161e2d]">
                  Starting in mid-2026, Amazon Web Services (AWS) is introducing
                  updates to the AWS sign-in and sign-up pages. These updates
                  include new options for how you create and access your
                  account.{" "}
                  <a
                    href="#"
                    className={`inline-flex items-center gap-0.5 ${solidLink}`}
                  >
                    Learn more
                    <ExternalIcon className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
              <button
                type="button"
                className="aws-focus rounded-md border border-[#545b64] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#161e2d] hover:bg-[#fafafa]"
                onClick={() =>
                  setMessage(
                    "New experience is mocked in this demo. Continue with IAM sign-in.",
                  )
                }
              >
                Change to new experience
              </button>
              <button
                type="button"
                className="aws-focus p-1 text-[#545b64] hover:text-[#161e2d]"
                aria-label="Dismiss notification"
                onClick={() => setBannerVisible(false)}
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : null}

        {message ? (
          <p
            role="status"
            className="mt-3 w-full max-w-[800px] rounded-md border border-[#d5dbdb] bg-white px-3 py-2 text-[13px] text-[#161e2d]"
          >
            {message}
          </p>
        ) : null}

        {/* Two separate equal-sized cards with a gap */}
        <div className="mt-6 flex w-full max-w-[960px] flex-col items-center gap-4 min-[900px]:flex-row min-[900px]:items-stretch min-[900px]:justify-center min-[900px]:gap-5">
          <div className="w-[calc(100%-32px)] max-w-[380px] rounded-lg border border-[#d5dbdb] bg-white p-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] min-[900px]:w-[380px]">
            <h1 className="flex items-center gap-2 text-[22px] leading-tight font-bold text-[#161e2d]">
              IAM user sign in
              <button
                type="button"
                className="aws-focus"
                aria-label="About IAM user sign in"
                onClick={() =>
                  setMessage(
                    "IAM users sign in with an account ID/alias, username, and password.",
                  )
                }
              >
                <InfoIcon className="h-4 w-4" />
              </button>
            </h1>

            <form className="mt-5" onSubmit={handleSignIn} noValidate>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <label
                    htmlFor="account-id"
                    className="text-[14px] font-bold text-[#161e2d]"
                  >
                    Account ID or alias
                  </label>
                  <a href="#" className={`text-[14px] ${dottedLink}`}>
                    (Don&apos;t have?)
                  </a>
                </div>
                <input
                  id="account-id"
                  name="accountId"
                  type="text"
                  autoComplete="organization"
                  value={accountId}
                  onChange={(event) => {
                    setAccountId(event.target.value);
                    if (error) setError(null);
                  }}
                  className={inputClass}
                />
              </div>

              <label className="mt-3 flex items-center gap-2 text-[14px] font-medium text-[#161e2d]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[#0073bb]"
                />
                Remember this account
              </label>

              <div className="mt-4">
                <label
                  htmlFor="iam-username"
                  className="block text-[14px] font-bold text-[#161e2d]"
                >
                  IAM username
                </label>
                <input
                  id="iam-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    if (error) setError(null);
                  }}
                  className={inputClass}
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="iam-password"
                  className="block text-[14px] font-bold text-[#161e2d]"
                >
                  Password
                </label>
                <input
                  id="iam-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError(null);
                  }}
                  className={inputClass}
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[14px] font-medium text-[#161e2d]">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(event) =>
                        setShowPassword(event.target.checked)
                      }
                      className="h-3.5 w-3.5 accent-[#0073bb]"
                    />
                    Show Password
                  </label>
                  <a
                    href="#"
                    className={`shrink-0 text-[14px] ${dottedLink}`}
                    onClick={(event) => {
                      event.preventDefault();
                      setMessage(
                        "Password recovery is mocked in this demo. Try any credentials.",
                      );
                    }}
                  >
                    Having trouble?
                  </a>
                </div>
              </div>

              {error ? (
                <p role="alert" className="mt-3 text-[13px] text-[#d13212]">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 flex h-9 w-full items-center justify-center rounded-[18px] bg-[#ff9900] text-[14px] font-bold text-[#161e2d] outline-none transition-colors hover:bg-[#ec7211] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0073bb] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-3 flex h-9 w-full items-center justify-center rounded-[18px] border-2 border-[#0073bb] bg-white text-[14px] font-bold text-[#0073bb] outline-none transition-colors hover:bg-[#f1f8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0073bb]"
            >
              Sign in using root user email
            </Link>

            <div className="mt-4 text-center">
              <Link href="/signup" className={`text-[14px] ${solidLink}`}>
                Create a new AWS account
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-full w-[560px] shrink-0 overflow-hidden rounded-lg bg-black shadow-[0_1px_3px_rgba(0,0,0,0.06)] min-[900px]:block">
            <Image
              src="/images/signup/lightsail-promo.png"
              alt="Amazon Lightsail — Lightsail is the easiest way to get started on AWS"
              fill
              sizes="560px"
              className="object-cover object-center"
              priority
            />
          </div>
        </div>

        <p className="mt-5 w-full max-w-[800px] text-center text-[12px] leading-[1.5] text-[#545b64]">
          By continuing, you agree to the{" "}
          <a href="#" className={solidLink}>
            AWS Customer Agreement
          </a>{" "}
          or other agreement for AWS services, and the{" "}
          <a href="#" className={solidLink}>
            Privacy Notice
          </a>
          . This site uses essential cookies. See our{" "}
          <a href="#" className={solidLink}>
            Cookie Notice
          </a>{" "}
          for more information.
        </p>

        <p className="mt-8 text-center text-[12px] text-[#545b64]">
          © 2026 Amazon Web Services, Inc. or its affiliates. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
