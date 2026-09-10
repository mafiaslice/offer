import type { Metadata } from "next";
import { PostGigForm } from "@/components/post-gig-form";
import { SignInGate } from "@/components/sign-in-gate";
import { getSessionProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Post",
};

export default async function PostPage() {
  const session = isSupabaseConfigured() ? await getSessionProfile().catch(() => null) : { id: "demo" };
  if (!session) {
    return (
      <SignInGate
        next="/post"
        kicker="Bring good people together"
        title="Post a gig."
        body="Sign in to create a gig. Anyone with an account can host — Host is a capability, not a separate account."
        action="Sign in to post"
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-purple">Bring good people together</p>
        <h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">Post a gig.</h1>
        <p className="max-w-xl text-sm leading-6 text-purple-gray sm:text-base">Tell people what you&apos;re building, who you need, and how they can show up.</p>
      </header>
      <PostGigForm />
    </div>
  );
}
