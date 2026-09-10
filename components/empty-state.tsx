import Link from "next/link";

type EmptyStateProps = {
  title: string;
  body: string;
  href?: string;
  action?: string;
};

export function EmptyState({ title, body, href, action }: EmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white px-5 py-12 text-center">
      <p className="text-base font-bold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-purple-gray">{body}</p>
      {href && action ? (
        <Link href={href} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
