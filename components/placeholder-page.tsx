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
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-black">
          {title}
        </h1>
        <p className="max-w-prose text-sm leading-6 text-purple-gray">
          {description}
        </p>
      </header>
      {children}
    </div>
  );
}
