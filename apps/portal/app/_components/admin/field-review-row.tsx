"use client";

import { SegmentedOptions, cn, type SegmentedOption } from "@hp-mis/ui";
import type { FieldOutcome } from "../data/scrutiny-provider";

interface Props {
  label: string;
  value: string;
  outcome?: FieldOutcome;
  onSetOutcome: (next: FieldOutcome) => void;
}

const OUTCOME_OPTIONS: readonly SegmentedOption<FieldOutcome>[] = [
  { value: "verified", label: "Verify", icon: "✓", tone: "success" },
  { value: "flagged", label: "Flag", icon: "⚑", tone: "warning" },
  { value: "rejected", label: "Reject", icon: "✕", tone: "danger" },
];

/**
 * Field-by-field scrutiny row. Three mini buttons let the operator mark a
 * field Verified / Flagged / Rejected — matches §10.2 keyboard shortcut
 * pattern (Y/N/C). Picker is rendered through the shared `SegmentedOptions`
 * primitive so keyboard nav (arrow keys, Home/End) and focus ring are
 * consistent with every other admin segmented control.
 */
export function FieldReviewRow({ label, value, outcome, onSetOutcome }: Props) {
  const empty = !value || value.trim() === "";
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-[var(--text-xs)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {label}
        </p>
        <p
          className={cn(
            "mt-1 text-[var(--text-sm)]",
            empty
              ? "italic text-[var(--color-text-tertiary)]"
              : "text-[var(--color-text-primary)]",
          )}
        >
          {empty ? "Not provided" : value}
        </p>
      </div>
      <SegmentedOptions
        value={outcome}
        onChange={onSetOutcome}
        size="sm"
        ariaLabel={`Outcome for ${label}`}
        options={OUTCOME_OPTIONS}
        className="shrink-0"
      />
    </div>
  );
}
