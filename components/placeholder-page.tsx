import type { ReactNode } from "react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PlaceholderPage({
  title,
  description,
  children,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-[2rem] font-bold leading-tight tracking-[-0.05em] text-black sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-prose text-sm leading-6 text-purple-gray sm:text-base">
          {description}
        </p>
      </header>
      {children}
    </div>
  );
}
