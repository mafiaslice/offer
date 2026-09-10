import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { GigDetail, UserApplication } from "@/lib/data/types";

const FILE = join(process.cwd(), ".next", "cache", "offer-demo-walkthrough.json");

type DemoWalkthroughStore = {
  gigs: GigDetail[];
  applications: UserApplication[];
};

function empty(): DemoWalkthroughStore {
  return { gigs: [], applications: [] };
}

function readStore(): DemoWalkthroughStore {
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as DemoWalkthroughStore;
    return {
      gigs: Array.isArray(parsed.gigs) ? parsed.gigs : [],
      applications: Array.isArray(parsed.applications) ? parsed.applications : [],
    };
  } catch {
    return empty();
  }
}

function writeStore(store: DemoWalkthroughStore) {
  try {
    mkdirSync(join(process.cwd(), ".next", "cache"), { recursive: true });
    writeFileSync(FILE, JSON.stringify(store));
  } catch {
    // Best effort until Supabase is configured.
  }
}

export function readExtraGigs() {
  return readStore().gigs;
}

export function readExtraApplications() {
  return readStore().applications;
}

export function rememberExtraGig(gig: GigDetail) {
  const store = readStore();
  store.gigs = [gig, ...store.gigs.filter((item) => item.slug !== gig.slug && item.id !== gig.id)];
  writeStore(store);
}

export function rememberExtraApplication(application: UserApplication) {
  const store = readStore();
  store.applications = [application, ...store.applications.filter((item) => item.gigSlug !== application.gigSlug)];
  writeStore(store);
}
