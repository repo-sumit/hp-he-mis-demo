"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import { renderReason } from "./format-reason";
import type { EligibilityReason, EligibilityState } from "./evaluate";

interface Props {
  reasons: EligibilityReason[];
  state: EligibilityState;
  className?: string;
}

const STATE_STYLE: Record<EligibilityState, string> = {
  eligible:
    "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
  conditional:
    "border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)] text-[var(--color-text-primary)]",
  not_eligible:
    "border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] text-[var(--color-text-primary)]",
};

/**
 * Plain-language list of why an offering is conditional or not-eligible.
 * For the "eligible" state we just render a small reassurance note.
 */
export function NotEligibleReasonBlock({ reasons, state, className }: Props) {
  const { t } = useLocale();
  if (reasons.length === 0 && state === "eligible") return null;

  const iconFor: Record<EligibilityState, string> = {
    eligible: "✓",
    conditional: "!",
    not_eligible: "✕",
  };

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border p-3 text-[var(--text-xs)]",
        STATE_STYLE[state],
        className,
      )}
    >
      <ul className="space-y-1">
        {reasons.map((reason, idx) => (
          <li key={`${reason.key}-${idx}`} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-[1px] font-[var(--weight-bold)]">
              {iconFor[state]}
            </span>
            <span className="flex-1">{renderReason(t, reason)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
