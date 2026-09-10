import type { ChatMessage, InboxThread } from "@/lib/data/types";

const THREAD_KEY = "offer:message-threads";
const MESSAGE_KEY = "offer:message-bodies";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readDemoThreads(): InboxThread[] {
  return readJson<InboxThread[]>(THREAD_KEY, []);
}

export function readDemoMessages(): Record<string, ChatMessage[]> {
  return readJson<Record<string, ChatMessage[]>>(MESSAGE_KEY, {});
}

export function rememberDemoThread(thread: InboxThread) {
  if (typeof window === "undefined") return;
  const next = [thread, ...readDemoThreads().filter((item) => item.id !== thread.id)];
  try {
    window.localStorage.setItem(THREAD_KEY, JSON.stringify(next));
  } catch {
    // Best effort until Supabase is configured.
  }
}

export function rememberDemoMessage(message: ChatMessage) {
  if (typeof window === "undefined") return;
  const all = readDemoMessages();
  const next = { ...all, [message.threadId]: [...(all[message.threadId] ?? []), message] };
  try {
    window.localStorage.setItem(MESSAGE_KEY, JSON.stringify(next));
  } catch {
    // Best effort until Supabase is configured.
  }
}
