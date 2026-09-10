import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthFlow } from "@/components/auth-flow";

export const metadata: Metadata = {
  title: "Get started",
};

export default function AuthPage() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-[calc(100dvh-7rem)] max-w-md" />}>
      <AuthFlow />
    </Suspense>
  );
}
