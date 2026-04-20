"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import type { AppDocument, DocScrutinyStatus } from "../data/mock-applications";
import { formatSize, formatTimestamp } from "./format";

const DOC_NAMES: Record<string, string> = {
  marksheet_12: "Class 12 marksheet",
  photo: "Passport-size photo",
  signature: "Student signature",
  character_cert: "Character certificate",
  caste_cert: "Caste certificate",
  ews_cert: "EWS certificate",
  pwd_cert: "Disability certificate",
  domicile_cert: "HP domicile certificate",
  gap_affidavit: "Gap year affidavit",
  migration_cert: "Migration certificate",
};

const STATUS_STYLE: Record<DocScrutinyStatus, string> = {
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
};

const STATUS_LABEL: Record<DocScrutinyStatus, string> = {
  not_uploaded: "Not uploaded",
  uploaded: "Uploaded",
  under_review: "Under review",
  verified: "Verified",
  rejected: "Rejected",
};

interface Props {
  doc: AppDocument;
  currentStatus: DocScrutinyStatus;
  /** Optional scrutiny actions — when omitted the card is read-only. */
  onVerify?: () => void;
  onReject?: () => void;
  onRaiseDiscrepancy?: () => void;
  className?: string;
}

/**
 * One-row document review card. Shows metadata + preview placeholder on the
 * left, status + scrutiny actions on the right. Read-only on the detail tab;
 * interactive on the scrutiny workbench.
 */
export function DocumentReviewCard({
  doc,
  currentStatus,
  onVerify,
  onReject,
  onRaiseDiscrepancy,
  className,
}: Props) {
  const name = DOC_NAMES[doc.code] ?? doc.code;
  const interactive = Boolean(onVerify || onReject || onRaiseDiscrepancy);

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-start",
        currentStatus === "rejected" ? "!border-[var(--color-text-danger)]" : "",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="flex h-16 w-16 flex-none items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] text-lg"
      >
        {doc.mimeType?.startsWith("image") ? "🖼" : "📄"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {name}
          </p>
          <span
            className={cn(
              "inline-flex items-center rounded-[var(--radius-pill)] border px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)]",
              STATUS_STYLE[currentStatus],
            )}
          >
            {STATUS_LABEL[currentStatus]}
          </span>
        </div>
        <p className="mt-1 break-all text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {doc.fileName}
        </p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {doc.mimeType} · {formatSize(doc.sizeKb)} · uploaded {formatTimestamp(doc.uploadedAt)}
        </p>
        {doc.rejectionReason && currentStatus === "rejected" ? (
          <p className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-status-danger-bg)] px-2 py-1 text-[var(--text-xs)] text-[var(--color-status-danger-fg)]">
            ⚠ {doc.rejectionReason}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link
            href="#"
            className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
            aria-label={`Open ${name} preview`}
          >
            Open preview
          </Link>
          <span aria-hidden="true" className="text-[var(--color-text-tertiary)]">
            ·
          </span>
          <a
            href="#"
            className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            Download
          </a>
        </div>
      </div>

      {interactive ? (
        <div className="flex flex-col gap-2 sm:min-w-[168px]">
          {onVerify ? (
            <button
              type="button"
              onClick={onVerify}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-interactive-success)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)]"
            >
              <span aria-hidden="true">✓</span>
              Verify
            </button>
          ) : null}
          {onRaiseDiscrepancy ? (
            <button
              type="button"
              onClick={onRaiseDiscrepancy}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-status-warning-fg)]"
            >
              <span aria-hidden="true">⚠</span>
              Raise discrepancy
            </button>
          ) : null}
          {onReject ? (
            <button
              type="button"
              onClick={onReject}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-status-danger-fg)]"
            >
              <span aria-hidden="true">✕</span>
              Reject
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function docNameFor(code: string): string {
  return DOC_NAMES[code] ?? code;
}
