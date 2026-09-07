import type { Metadata } from "next";

import { SignupShell } from "@/components/signup/signup-shell";

export const metadata: Metadata = {
  title: "AWS Console - Signup",
  description: "Create an AWS account",
};

export default function SignupPage() {
  return <SignupShell />;
}
