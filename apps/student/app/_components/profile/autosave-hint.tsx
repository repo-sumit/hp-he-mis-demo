"use client";

import { useEffect, useState } from "react";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import { useProfile } from "./profile-provider";

function formatAgo(
  elapsedMs: number,
  t: (key: string, vars?: Record<string, string | number>) => string,
) {
  const seconds = Math.floor(elapsedMs / 1000);
  if (seconds < 5) return t("common.justNow");
  if (seconds < 60) return t("common.secondsAgo", { n: seconds });
  const minutes = Math.floor(seconds / 60);
  return t("common.minutesAgo", { n: minutes });
}

/**
 * Shows the autosave state — "Saving…", "Saved just now", or the idle hint.
 * Refreshes every 20 s so "X min ago" stays accurate without per-keystroke work.
 */
export function AutosaveHint({ className }: { className?: string }) {
  const { t } = useLocale();
  const { autosaveState, lastSavedAt } = useProfile();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 20_000);
    return () => window.clearInterval(id);
  }, []);

  let icon = "✓";
  let label = t("profile.header.autosaveIdle");
  if (autosaveState === "saving") {
    icon = "⏳";
    label = t("profile.header.autosaveSaving");
  } else if (autosaveState === "saved" && lastSavedAt) {
    icon = "✓";
    label = t("profile.header.autosaveSaved", { ago: formatAgo(Date.now() - lastSavedAt, t) });
  }

  return (
    <div
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-background-subtle)] px-2.5 py-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]",
        className,
      )}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
