import type { Metadata } from "next";

import { SigninShell } from "@/components/signin/signin-shell";

export const metadata: Metadata = {
  title: "AWS Console Sign-in",
  description: "Sign in to the AWS Management Console",
};

export default function SigninPage() {
  return <SigninShell />;
}
