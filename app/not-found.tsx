import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-purple">Missing page</p>
        <h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em]">This screen isn&apos;t here.</h1>
        <p className="text-sm leading-6 text-purple-gray">That link doesn&apos;t match a gig or page on Offer. Discover still lists the gigs that are open.</p>
      </header>
      <Link href="/discover" className="inline-flex min-h-12 items-center rounded-2xl bg-black px-5 text-sm font-bold text-white">
        Back to Discover
      </Link>
    </div>
  );
}
