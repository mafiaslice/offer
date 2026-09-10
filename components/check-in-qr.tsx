"use client";

import { useEffect, useMemo, useState } from "react";
import { renderSVG } from "uqr";

type CheckInQrProps = {
  token: string;
  label?: string;
};

export function CheckInQr({ token, label = "Scan to check in" }: CheckInQrProps) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setOrigin(window.location.origin), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const url = origin ? `${origin}/check-in/${encodeURIComponent(token)}` : "";
  const svg = useMemo(() => {
    if (!url) return "";
    return renderSVG(url, { ecc: "M", pixelSize: 8, whiteColor: "#ffffff", blackColor: "#000000" });
  }, [url]);

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3 text-center">
      <div className="mx-auto grid size-52 place-items-center rounded-[1.5rem] bg-white p-3 shadow-[0_12px_28px_rgba(53,32,79,0.08)]">
        {svg ? (
          <div className="size-full text-black" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="size-full animate-pulse rounded-2xl bg-lavender" />
        )}
      </div>
      <p className="text-xs font-semibold text-purple-gray">{label}</p>
      {url ? (
        <button type="button" onClick={() => void copyLink()} className="text-xs font-bold text-purple">
          {copied ? "Link copied" : "Copy check-in link"}
        </button>
      ) : null}
    </div>
  );
}
