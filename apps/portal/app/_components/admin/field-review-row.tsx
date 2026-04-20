"use client";

import { cn } from "@hp-mis/ui";
import type { FieldOutcome } from "../data/scrutiny-provider";

interface Props {
  label: string;
  value: string;
  outcome?: FieldOutcome;
  onSetOutcome: (next: FieldOutcome) => void;
}

/**
 * Field-by-field scrutiny row. Three mini buttons let the operator mark a
 * field Verified / Flagged / Rejected — matches §10.2 keyboard shortcut
 * pattern (Y/N/C).
 */
export function FieldReviewRow({ label, value, outcome, onSetOutcome }: Props) {
  const empty = !value || value.trim() === "";
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-[var(--text-sm)]",
            empty
              ? "italic text-[var(--color-text-tertiary)]"
              : "text-[var(--color-text-primary)]",
          )}
        >
          {empty ? "Not provided" : value}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-1">
        <MiniButton
          label="Verify"
          icon="✓"
          active={outcome === "verified"}
          tone="success"
          onClick={() => onSetOutcome("verified")}
        />
        <MiniButton
          label="Flag"
          icon="⚑"
          active={outcome === "flagged"}
          tone="warning"
          onClick={() => onSetOutcome("flagged")}
        />
        <MiniButton
          label="Reject"
          icon="✕"
          active={outcome === "rejected"}
          tone="danger"
          onClick={() => onSetOutcome("rejected")}
        />
      </div>
    </div>
  );
}

function MiniButton({
  label,
  icon,
  active,
  tone,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  tone: "success" | "warning" | "danger";
  onClick: () => void;
}) {
  const tones = {
    success: {
      active:
        "bg-[var(--color-interactive-success)] text-[var(--color-text-inverse)] border-[var(--color-interactive-success)]",
      idle: "border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-status-success-bg)]",
    },
    warning: {
      active:
        "bg-[var(--color-status-warning-fg)] text-[var(--color-text-inverse)] border-[var(--color-status-warning-fg)]",
      idle: "border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-status-warning-bg)]",
    },
    danger: {
      active:
        "bg-[var(--color-interactive-danger)] text-[var(--color-text-inverse)] border-[var(--color-interactive-danger)]",
      idle: "border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-status-danger-bg)]",
    },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-[var(--radius-md)] border px-2 text-[var(--text-xs)] font-[var(--weight-semibold)]",
        active ? tones.active : tones.idle,
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}
