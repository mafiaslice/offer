import type { Metadata } from "next";
import { PostGigForm } from "@/components/post-gig-form";
import { redirectUnsignedToAuth } from "@/lib/require-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Post",
};

export default async function PostPage() {
  await redirectUnsignedToAuth("/post");

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
