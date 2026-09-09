import type { Metadata } from "next";
import { AuthFlow } from "@/components/auth-flow";

export const metadata: Metadata = {
  title: "Get started",
};

export default function AuthPage() {
  return <AuthFlow />;
}
