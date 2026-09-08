"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { MultiSessionSelect } from "@/components/signin/multi-session-select";
import { SignupLanguageSelect } from "@/components/signup/signup-language-select";
import { isValidEmail, loginWithPassword } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const dottedLink =
  "text-[#0073bb] underline decoration-dotted underline-offset-2 hover:decoration-solid";
const solidLink =
  "text-[#0073bb] underline decoration-[#0073bb] underline-offset-2 hover:text-[#00a1c9]";

const inputClass =
  "mt-1.5 h-9 w-full rounded-[6px] border border-[#8f969f] bg-white px-3 text-[14px] text-[#161e2d] outline-none placeholder:italic placeholder:text-[#aab7b8] focus:border-[#0073bb] focus:shadow-[0_0_0_1px_#0073bb]";

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

const radioClass =
  "mt-0.5 h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-[#7d8998] bg-white outline-none checked:border-[#0073bb] checked:bg-[#0073bb] checked:shadow-[inset_0_0_0_3px_#fff] focus-visible:ring-2 focus-visible:ring-[#0073bb] focus-visible:ring-offset-1";

function TopControls() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!feedbackOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!feedbackRef.current?.contains(event.target as Node)) {
        setFeedbackOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFeedbackOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [feedbackOpen]);

  return (
    <>
      <div ref={feedbackRef} className="relative">
        <button
          type="button"
          className="aws-focus text-[14px] font-semibold text-[#0073bb]"
          aria-expanded={feedbackOpen}
          onClick={() => setFeedbackOpen((value) => !value)}
        >
          Provide feedback
        </button>
        {feedbackOpen ? (
          <div className="absolute top-full right-0 z-40 mt-1 w-[240px] rounded-md border border-[#d5dbdb] bg-white px-4 py-3 text-[13px] leading-[1.45] text-[#161e2d] shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            Feedback is mocked in this demo.
            <button
              type="button"
              className="mt-2 block text-[13px] font-semibold text-[#0073bb]"
              onClick={() => setFeedbackOpen(false)}
            >
              Dismiss
            </button>
          </div>
        ) : null}
      </div>
      <MultiSessionSelect />
      <SignupLanguageSelect className="relative" />
    </>
  );
}

function CubeBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-0 w-[min(52vw,474px)] select-none"
        aria-hidden="true"
      >
        <Image
          src="/images/signin/background-left.png"
          alt=""
          width={474}
          height={638}
          className="h-auto w-full"
          priority
        />
      </div>
      <div
        className="pointer-events-none absolute right-0 bottom-0 z-0 w-[min(50vw,458px)] select-none"
        aria-hidden="true"
      >
        <Image
          src="/images/signin/background-right.png"
          alt=""
          width={458}
          height={596}
          className="h-auto w-full"
          priority
        />
      </div>
    </>
  );
}

function SigninHeader() {
  return (
    <>
      <Link href="/" className="aws-focus relative z-10 shrink-0" aria-label="AWS home">
        <Image
          src="/images/signup/aws-logo.png"
          alt="Amazon Web Services"
          width={100}
          height={61}
          className="h-auto w-[100px]"
          priority
        />
      </Link>

      <div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 min-[768px]:hidden">
        <TopControls />
      </div>
    </>
  );
}

function RootSigninCard({
  onSelectIam,
}: {
  onSelectIam: () => void;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setError(null);
    setLoading(true);
    // Root console UI collects email only — continue via the password login page.
    router.push(`/login?email=${encodeURIComponent(email.trim())}`);
    setLoading(false);
  }

  return (
    <div className="flex w-[calc(100%-32px)] max-w-[380px] flex-col min-[768px]:w-[380px]">
      <div className="rounded-[15px] border border-[#d5dbdb] bg-white px-[22px] py-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h1 className="text-[26px] leading-tight font-bold text-[#161e2d]">
          Sign In
        </h1>
        <p className="mt-2 text-[14px] leading-[1.45] text-[#545b64]">
          Access your AWS account by user type.
        </p>

        <form className="mt-6" onSubmit={handleNext} noValidate>
          <div>
            <p className="text-[14px] font-bold text-[#161e2d]">
              User type{" "}
              <button
                type="button"
                className={`font-normal ${dottedLink}`}
                onClick={() =>
                  setMessage(
                    "Root users own the account. IAM users sign in with an account ID, username, and password.",
                  )
                }
              >
                (not sure?)
              </button>
            </p>

            <div className="mt-2.5 flex flex-col gap-2.5">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-[#0073bb] bg-[#f1f8ff] px-3 py-3">
                <input
                  type="radio"
                  name="user-type"
                  value="root"
                  checked
                  onChange={() => undefined}
                  className={radioClass}
                />
                <span>
                  <span className="block text-[14px] font-bold text-[#161e2d]">
                    Root user
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-[1.4] text-[#545b64]">
                    Account owner that performs tasks requiring unrestricted
                    access.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-[#d5dbdb] bg-white px-3 py-3 hover:bg-[#fafafa]">
                <input
                  type="radio"
                  name="user-type"
                  value="iam"
                  checked={false}
                  onChange={onSelectIam}
                  className={radioClass}
                />
                <span>
                  <span className="block text-[14px] font-bold text-[#161e2d]">
                    IAM user
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-[1.4] text-[#545b64]">
                    User within an account that performs daily tasks.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="root-signin-email"
              className="block text-[14px] font-bold text-[#161e2d]"
            >
              Email address
            </label>
            <input
              id="root-signin-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="username@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "root-signin-email-error" : undefined}
              className={inputClass}
            />
          </div>

          {error ? (
            <p
              id="root-signin-email-error"
              role="alert"
              className="mt-2 text-[13px] text-[#d13212]"
            >
              {error}
            </p>
          ) : null}

          {message ? (
            <p
              role="status"
              className="mt-2 text-[13px] leading-[1.4] text-[#161e2d]"
            >
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-9 w-full items-center justify-center rounded-[20px] bg-[#ff9900] text-[14px] font-bold text-black outline-none transition-colors hover:bg-[#ec7211] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0073bb] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Continuing…" : "Next"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-[#d5dbdb]" />
          <span className="text-[12px] font-bold tracking-wide text-[#8d96a0]">
            OR
          </span>
          <span className="h-px flex-1 bg-[#d5dbdb]" />
        </div>

        <Link
          href="/signup"
          className="flex h-9 w-full items-center justify-center rounded-[20px] border-2 border-[#0073bb] bg-white text-[14px] font-bold text-[#0073bb] outline-none transition-colors hover:bg-[#f1f8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0073bb]"
        >
          New to AWS? Sign up
        </Link>
      </div>

      <p className="mt-4 text-[13px] leading-[1.5] text-[#545b64]">
        By continuing, you agree to{" "}
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
    </div>
  );
}

const iamInputClass =
  "mt-1 h-8 w-full rounded-[4px] border border-[#7d8998] bg-white px-2.5 text-[13px] text-[#16191f] outline-none focus:border-[#0073bb] focus:shadow-[0_0_0_1px_#0073bb]";

const iamCheckboxClass = "iam-signin-checkbox";

const ACCOUNT_REMEMBER_KEY = "route53.iam.account";

function IamSigninForm({
  onSelectRoot,
}: {
  onSelectRoot: () => void;
}) {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ACCOUNT_REMEMBER_KEY);
      if (saved) {
        setAccountId(saved);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!accountId.trim() || !username.trim() || !password.trim()) {
      setError("Enter your account ID, IAM username, and password.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (remember) {
        window.localStorage.setItem(ACCOUNT_REMEMBER_KEY, accountId.trim());
      } else {
        window.localStorage.removeItem(ACCOUNT_REMEMBER_KEY);
      }
      const email = username.includes("@")
        ? username.trim()
        : `${username.trim()}@example.com`;
      await loginWithPassword(email, password);
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next?.startsWith("/") ? next : "/hosted-zones");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : "Unable to sign in. Use demo@example.com / DemoPass123!.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col px-6 py-5 sm:px-7 sm:py-6">
      <h1 className="flex items-center gap-1.5 text-[20px] leading-tight font-bold text-[#16191f]">
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
          <InfoIcon className="h-[15px] w-[15px]" />
        </button>
      </h1>

      <form className="mt-5" onSubmit={handleSignIn} noValidate>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <label
              htmlFor="account-id"
              className="text-[13px] font-bold text-[#16191f]"
            >
              Account ID or alias
            </label>
            <a href="#" className={`text-[13px] ${dottedLink}`}>
              (Don&apos;t have?)
            </a>
          </div>
          <input
            id="account-id"
            name="accountId"
            type="text"
            autoComplete="organization"
            autoFocus
            value={accountId}
            onChange={(event) => {
              setAccountId(event.target.value);
              if (error) setError(null);
            }}
            className={iamInputClass}
          />
        </div>

        <label className="mt-2.5 flex items-center gap-2 text-[13px] text-[#16191f]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className={iamCheckboxClass}
          />
          Remember this account
        </label>

        <div className="mt-3.5">
          <label
            htmlFor="iam-username"
            className="block text-[13px] font-bold text-[#16191f]"
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
            className={iamInputClass}
          />
        </div>

        <div className="mt-3.5">
          <label
            htmlFor="iam-password"
            className="block text-[13px] font-bold text-[#16191f]"
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
            className={iamInputClass}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-[13px] text-[#16191f]">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
                className={iamCheckboxClass}
              />
              Show Password
            </label>
            <a
              href="#"
              className={`shrink-0 text-[13px] ${dottedLink}`}
              onClick={(event) => {
                event.preventDefault();
                setMessage(
                  "Password recovery is mocked in this demo. Try demo@example.com / DemoPass123!.",
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

        {message ? (
          <p
            role="status"
            className="mt-3 text-[13px] leading-[1.4] text-[#16191f]"
          >
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex h-9 w-full items-center justify-center rounded-md bg-[#ff9900] text-[14px] font-bold text-black outline-none transition-colors hover:bg-[#ec7211] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0073bb] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={onSelectRoot}
        className="mt-2.5 flex h-9 w-full items-center justify-center rounded-md border border-[#0073bb] bg-white text-[14px] font-bold text-[#0073bb] outline-none transition-colors hover:bg-[#f1f8ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0073bb]"
      >
        Sign in using root user email
      </button>

      <div className="mt-5 text-center">
        <Link href="/signup" className={`text-[13px] ${solidLink}`}>
          Create a new AWS account
        </Link>
      </div>
    </div>
  );
}

function IamUpdateBanner({
  onSwitchExperience,
  onDismiss,
}: {
  onSwitchExperience: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#0073bb] bg-[#f1f8fc] px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex min-w-0 flex-1 gap-2.5">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="text-[13px] leading-[1.5] text-[#16191f]">
          <p className="font-bold">AWS sign-in is getting an update</p>
          <p className="mt-0.5">
            Starting in mid-2026, Amazon Web Services (AWS) is introducing
            updates to the AWS sign-in and sign-up pages. These updates include
            new options for how you create and access your account.{" "}
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
      <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
        <button
          type="button"
          className="aws-focus rounded-md border border-[#16191f] bg-white px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-[#16191f] hover:bg-[#fafafa]"
          onClick={onSwitchExperience}
        >
          Change to new experience
        </button>
        <button
          type="button"
          className="aws-focus p-1 text-[#545b64] hover:text-[#16191f]"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
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
  );
}

function IamExperience({ onSelectRoot }: { onSelectRoot: () => void }) {
  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-white text-[#16191f]">
      <CubeBackground />

      <div className="absolute top-[18px] right-6 z-30 hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 min-[768px]:flex sm:right-10">
        <TopControls />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-1 flex-col items-center px-4 pt-8 pb-6 sm:px-6">
        <Link href="/" className="aws-focus shrink-0" aria-label="AWS home">
          <Image
            src="/images/signup/aws-logo.png"
            alt="Amazon Web Services"
            width={100}
            height={61}
            className="h-auto w-[80px]"
            priority
          />
        </Link>

        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 min-[768px]:hidden">
          <TopControls />
        </div>

        {bannerVisible ? (
          <div className="mt-6 w-full">
            <IamUpdateBanner
              onSwitchExperience={onSelectRoot}
              onDismiss={() => setBannerVisible(false)}
            />
          </div>
        ) : null}

        <div className="mt-4 flex w-full flex-col overflow-hidden rounded-lg border border-[#d5dbdb] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] min-[900px]:flex-row">
          <div className="w-full min-[900px]:w-[420px] min-[900px]:shrink-0">
            <IamSigninForm onSelectRoot={onSelectRoot} />
          </div>
          <a
            href="#"
            className="relative hidden min-h-[460px] min-w-0 flex-1 bg-black min-[900px]:block"
            aria-label="Amazon Lightsail — Learn more"
          >
            <Image
              src="/images/signup/lightsail-promo.png"
              alt="Amazon Lightsail. Lightsail is the easiest way to get started on AWS"
              fill
              sizes="620px"
              className="object-cover object-center"
              priority
            />
          </a>
        </div>

        <p className="mt-5 max-w-[760px] self-start text-[12px] leading-[1.55] text-[#545b64] min-[900px]:max-w-[420px]">
          By continuing, you agree to{" "}
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

        <p className="mt-auto pt-10 pb-2 text-center text-[12px] text-[#687078]">
          © 2026 Amazon Web Services, Inc. or its affiliates. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}

function RootExperience({ onSelectIam }: { onSelectIam: () => void }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-hidden bg-white text-[#161e2d]">
      <CubeBackground />

      <div className="absolute top-[18px] right-6 z-30 hidden flex-wrap items-center justify-end gap-x-5 gap-y-2 min-[768px]:flex sm:right-10">
        <TopControls />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-center px-4 pt-[70px] pb-8 sm:px-6">
        <SigninHeader />

        <div className="mt-10 flex w-full items-start justify-center gap-5 min-[768px]:mt-[52px] min-[768px]:gap-6 min-[1000px]:gap-8">
          <RootSigninCard onSelectIam={onSelectIam} />

          <div className="relative hidden w-[min(48vw,420px)] shrink-0 overflow-hidden rounded-[12px] min-[768px]:block min-[1000px]:w-[min(46vw,560px)] min-[1280px]:w-[640px]">
            <Image
              src="/images/signup/reinvent-promo.png"
              alt="AWS re:Invent 2026 — See what's live now. Explore the session catalog."
              width={640}
              height={506}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>

        <p className="mt-auto pt-10 text-center text-[13px] text-[#8d96a0]">
          © 2026 Amazon Web Services, Inc. or its affiliates. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}

export function SigninShell() {
  const [mode, setMode] = useState<"root" | "iam">("iam");

  if (mode === "root") {
    return <RootExperience onSelectIam={() => setMode("iam")} />;
  }

  return <IamExperience onSelectRoot={() => setMode("root")} />;
}
