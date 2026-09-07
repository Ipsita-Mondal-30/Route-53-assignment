"use client";

import { FaAws } from "react-icons/fa";

import {
  AppleMark,
  GitHubMark,
  GoogleMark,
} from "@/components/auth/auth-marks";

const providers = [
  { id: "Google", label: "Continue with Google", Icon: GoogleMark },
  { id: "Apple", label: "Continue with Apple", Icon: AppleMark },
  { id: "GitHub", label: "Continue with GitHub", Icon: GitHubMark },
  { id: "Amazon", label: "Continue with Amazon", Icon: FaAws },
] as const;

type SocialLoginButtonsProps = {
  onMessage: (message: string) => void;
};

export function SocialLoginButtons({ onMessage }: SocialLoginButtonsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {providers.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() =>
            onMessage(`${id} sign-in is not available in this demo.`)
          }
          className="flex h-9 w-full items-center justify-center gap-2 rounded-full border-2 border-[#687078] bg-transparent text-[14px] font-medium text-[#fafafa] outline-none transition-[background-color] hover:border-[#687078] hover:bg-[#1c2430] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00a1c9] active:border-[#687078]"
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
