"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import type { EligibilityState } from "./evaluate";

const STYLES: Record<EligibilityState, string> = {
  eligible:
    "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)] border-transparent",
  conditional:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)] border-transparent",
  not_eligible:
    "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)] border-transparent",
};

const ICONS: Record<EligibilityState, string> = {
  eligible: "✓",
  conditional: "!",
  not_eligible: "✕",
};

const KEYS: Record<EligibilityState, string> = {
  eligible: "discover.state.eligible",
  conditional: "discover.state.conditional",
  not_eligible: "discover.state.notEligible",
};

export function EligibilityStateBadge({
  state,
  className,
}: {
  state: EligibilityState;
  className?: string;
}) {
  const { t } = useLocale();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)]",
        STYLES[state],
        className,
      )}
    >
      <span aria-hidden="true">{ICONS[state]}</span>
      {t(KEYS[state])}
    </span>
  );
}
