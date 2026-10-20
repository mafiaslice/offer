/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import type { ElementType } from "react";

type TextRevealProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
  className?: string;
  id?: string;
};

/** A first-paint, CSS-only word reveal for short marketing headlines. */
export function TextReveal({ text, as = "h2", delay = 0, className, id }: TextRevealProps) {
  const Tag = as as ElementType;
  const words = text.split(/(\s+)/);

  return (
    <Tag id={id} className={`text-reveal ${className ?? ""}`.trim()} aria-label={text}>
      {words.map((word, index) => {
        if (/\s+/.test(word)) return <span key={`${word}-${index}`}>{word}</span>;
        return (
          <span key={`${word}-${index}`} className="text-reveal__clip" aria-hidden="true">
            <span className="text-reveal__word" style={{ animationDelay: `${delay + index * 0.045}s` }}>
              {word}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
