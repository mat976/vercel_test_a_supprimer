"use client";

import { authClient } from "@/lib/auth-client";
import PollBanner from "./PollBanner";

export default function PollBannerWrapper() {
  const { data: session } = authClient.useSession();
  return <PollBanner userId={session?.user.id} />;
}
