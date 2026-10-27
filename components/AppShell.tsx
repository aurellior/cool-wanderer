"use client";

import React from "react";
import SocialTripWorkspace from "./SocialTripWorkspace";

export type TabKey =
  | "socialtrip"
  | "import"
  | "itinerary"
  | "explore"
  | "checklist";
export type ViewMode = "auto" | "desktop" | "mobile";

interface AppShellProps {
  initialTab?: TabKey;
}

export default function AppShell(_props: AppShellProps) {
  return <SocialTripWorkspace />;
}
