"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import type { DocStatus } from "./document-rules";

const STYLES: Record<DocStatus, string> = {
  not_uploaded:
    "bg-[var(--color-background-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
  uploaded:
    "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)] border-transparent",
  under_review:
    "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)] border-transparent",
  verified:
    "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)] border-transparent",
  rejected:
    "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)] border-transparent",
  re_upload_required:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)] border-transparent",
};

const ICONS: Record<DocStatus, string> = {
  not_uploaded: "•",
  uploaded: "↑",
  under_review: "⏱",
  verified: "✓",
  rejected: "✕",
  re_upload_required: "⟳",
};

const KEYS: Record<DocStatus, string> = {
  not_uploaded: "document.status.notUploaded",
  uploaded: "document.status.uploaded",
  under_review: "document.status.underReview",
  verified: "document.status.verified",
  rejected: "document.status.rejected",
  re_upload_required: "document.status.reUploadRequired",
};

export function DocumentStatusBadge({
  status,
  className,
}: {
  status: DocStatus;
  className?: string;
}) {
  const { t } = useLocale();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)]",
        STYLES[status],
        className,
      )}
    >
      <span aria-hidden="true">{ICONS[status]}</span>
      {t(KEYS[status])}
    </span>
  );
}
