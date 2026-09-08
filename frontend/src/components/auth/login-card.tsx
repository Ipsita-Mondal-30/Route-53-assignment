"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { ApiError, getApiBaseUrl } from "@/lib/api";
import { isValidEmail, loginWithPassword, signupWithPassword } from "@/lib/auth";

const linkClass = "aws-focus text-[#00a1c9] hover:underline";
const MIN_SIGNUP_PASSWORD_LENGTH = 8;
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "DemoPass123!";

type AuthMode = "signin" | "signup";

export function LoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  useEffect(() => {
    const fromQuery = searchParams.get("email");
    if (fromQuery) {
      setEmail(fromQuery);
    }
    if (searchParams.get("mode") === "signup") {
      setMode("signup");
      setPassword("");
      if (!fromQuery) {
        setEmail("");
      }
    }
  }, [searchParams]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setMessage(null);
    if (next === "signup") {
      setEmail("");
      setPassword("");
    } else {
      setEmail(DEMO_EMAIL);
      setPassword(DEMO_PASSWORD);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Enter your password.");
      return;
    }
    if (isSignup && password.length < MIN_SIGNUP_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_SIGNUP_PASSWORD_LENGTH} characters.`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        await signupWithPassword(email, password);
      } else {
        await loginWithPassword(email, password);
      }
      const next = searchParams.get("next") || "/hosted-zones";
      router.push(next.startsWith("/") ? next : "/hosted-zones");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else if (err instanceof TypeError) {
        const api = getApiBaseUrl();
        setError(
          api.startsWith("/")
            ? "Cannot reach the API. Confirm the backend is live, then try again."
            : `Cannot reach the API at ${api}. Start the backend, then try again.`,
        );
      } else {
        setError(isSignup ? "Unable to create account. Try again." : "Unable to sign in. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-auto w-[calc(100%-32px)] max-w-[580px] overflow-hidden rounded-xl border border-[#414750] bg-[#161b22] shadow-[0_4px_24px_rgba(0,0,0,0.4)] sm:w-[calc(100%-40px)]">
      <div className="p-6 sm:p-7">
        <h1 className="text-[22px] leading-[1.2] font-bold tracking-tight text-white">
          {isSignup ? "Create an AWS Builder ID" : "Get started"}
        </h1>

        <form className="mt-5" onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="login-email"
            className="block text-[14px] font-semibold text-white"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="username@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-email-error" : undefined}
            className="mt-1.5 h-[38px] w-full rounded-md border border-[#687078] bg-[#0f1419] px-3 text-[14px] text-[#d5dbdb] placeholder:italic placeholder:text-[#8d99a6] outline-none transition-[border-color,box-shadow] focus:border-[#00a1c9] focus:shadow-[0_0_0_1px_#00a1c9]"
          />

          <label
            htmlFor="login-password"
            className="mt-4 block text-[14px] font-semibold text-white"
          >
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            className="mt-1.5 h-[38px] w-full rounded-md border border-[#687078] bg-[#0f1419] px-3 text-[14px] text-[#d5dbdb] outline-none transition-[border-color,box-shadow] focus:border-[#00a1c9] focus:shadow-[0_0_0_1px_#00a1c9]"
          />

          {error ? (
            <p
              id="login-email-error"
              role="alert"
              className="mt-2 text-[13px] text-[#ff8d8d]"
            >
              {error}
            </p>
          ) : null}

          <p className="mt-2 text-[12px] text-[#8d99a6]">
            {isSignup
              ? "Password must be at least 8 characters."
              : "Demo: demo@example.com / DemoPass123!"}
          </p>

          <button
            type="submit"
            disabled={loading}
            className="mt-[18px] flex h-9 w-full items-center justify-center rounded-full bg-[#ff9900] text-[14px] font-bold text-black outline-none transition-colors hover:bg-[#ec7211] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00a1c9] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? isSignup
                ? "Creating account…"
                : "Signing in…"
              : isSignup
                ? "Create account"
                : "Continue"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-[#545b64]" />
          <span className="text-[12px] font-bold text-[#aab7c4]">OR</span>
          <span className="h-px flex-1 bg-[#545b64]" />
        </div>

        <SocialLoginButtons onMessage={setMessage} />

        <p className="mt-5 text-[13px] leading-[1.45] text-[#d1d5db]">
          By clicking &quot;{isSignup ? "Create account" : "Continue"}&quot; or
          continuing with an alternative sign-in method, you agree to the{" "}
          <a href="#" className={linkClass}>
            AWS Customer Agreement
          </a>
          , and you acknowledge you have read the{" "}
          <a href="#" className={linkClass}>
            AWS Privacy Notice
          </a>
          . By continuing, you will create an{" "}
          <a href="#" className={linkClass}>
            AWS Builder ID
          </a>
          .
        </p>

        {message ? (
          <p
            role="status"
            className="mt-3 rounded-md border border-[#414750] bg-[#0f1419] px-3 py-2 text-[13px] text-[#d5dbdb]"
          >
            {message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-[#414750] bg-[#12171e] px-6 py-4">
        {isSignup ? (
          <button
            type="button"
            className="aws-focus text-[14px] font-normal text-[#00a1c9] hover:underline"
            onClick={() => switchMode("signin")}
          >
            Already have an AWS Builder ID? Sign in
          </button>
        ) : (
          <>
            <button
              type="button"
              className="aws-focus text-[14px] font-normal text-[#00a1c9] hover:underline"
              onClick={() =>
                setMessage("Use demo@example.com / DemoPass123! to sign in.")
              }
            >
              Trouble Signing In?
            </button>
            <span aria-hidden="true" className="text-[#545b64]">
              |
            </span>
            <button
              type="button"
              className="aws-focus text-[14px] font-normal text-[#00a1c9] hover:underline"
              onClick={() => switchMode("signup")}
            >
              Create an AWS Builder ID
            </button>
          </>
        )}
      </div>
    </div>
  );
}
