import type { Metadata } from "next";
import { CheckInLanding } from "@/components/check-in-landing";
import { errorMessage, getCheckInContext } from "@/lib/data";
import type { CheckInContext } from "@/lib/data/types";
import { redirectUnsignedToAuth } from "@/lib/require-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check-in",
};

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const decoded = decodeURIComponent(token);
  await redirectUnsignedToAuth(`/check-in/${decoded}`);

  let initial: CheckInContext | null = null;
  let loadError: string | undefined;
  try {
    const result = await getCheckInContext({ token: decoded });
    initial = result.data;
  } catch (error) {
    loadError = errorMessage(error);
  }

  return <CheckInLanding token={decoded} initial={initial} error={loadError} />;
}
