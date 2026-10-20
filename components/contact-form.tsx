/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
"use client";

import { FormEvent, useState } from "react";
import { TextShimmer } from "@/components/text-shimmer";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
    }, 650);
  }

  if (submitted) {
    return (
      <div className="contact-form__success" role="status">
        <span className="contact-form__success-mark" aria-hidden="true">✓</span>
        <h3>Thanks for reaching out.</h3>
        <p>We’ll get back to you as soon as we can.</p>
        <button type="button" onClick={() => setSubmitted(false)}>Send another message</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>Name<input name="name" autoComplete="name" required placeholder="Your name" /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>What can we help with?<textarea name="message" required rows={4} placeholder="Tell us what you’re organising or looking for." /></label>
      <button type="submit" disabled={busy}>
        {busy ? <TextShimmer active>Sending message</TextShimmer> : "Send message"}
      </button>
    </form>
  );
}
