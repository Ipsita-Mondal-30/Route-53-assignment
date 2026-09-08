import type { Metadata } from "next";

import { SigninShell } from "@/components/signin/signin-shell";

export const metadata: Metadata = {
  title: "IAM user sign in - AWS Management Console",
  description: "Sign in to the AWS Management Console as an IAM user",
};

export default function SigninPage() {
  return <SigninShell />;
}
