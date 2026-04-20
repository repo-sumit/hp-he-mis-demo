"use client";

import { cn } from "@hp-mis/ui";
import type { AppBaseStatus } from "../data/mock-applications";

const STYLE: Record<AppBaseStatus, string> = {
  submitted:
    "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)] border-transparent",
  under_scrutiny:
    "bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)] border-transparent",
  discrepancy_raised:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)] border-transparent",
  verified:
    "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)] border-transparent",
  rejected:
    "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)] border-transparent",
  conditional:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)] border-transparent",
};

const LABEL: Record<AppBaseStatus, string> = {
  submitted: "Submitted",
  under_scrutiny: "Under scrutiny",
  discrepancy_raised: "Discrepancy raised",
  verified: "Verified",
  rejected: "Rejected",
  conditional: "Conditional",
};

const ICON: Record<AppBaseStatus, string> = {
  submitted: "●",
  under_scrutiny: "⏱",
  discrepancy_raised: "⚠",
  verified: "✓",
  rejected: "✕",
  conditional: "!",
};

interface Props {
  status: AppBaseStatus;
  className?: string;
}

export function StatusPill({ status, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)]",
        STYLE[status],
        className,
      )}
    >
      <span aria-hidden="true">{ICON[status]}</span>
      {LABEL[status]}
    </span>
  );
}

export function statusLabel(status: AppBaseStatus): string {
  return LABEL[status];
}
