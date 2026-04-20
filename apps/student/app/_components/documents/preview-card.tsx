"use client";

import { useLocale } from "../locale-provider";
import { DocumentStatusBadge } from "./document-status-badge";
import { formatSize, formatTimestamp } from "./format";
import type { DocumentEntry } from "./documents-provider";

interface Props {
  entry: DocumentEntry;
  name: string;
}

/**
 * Read-only summary of what the college currently has: file name, size,
 * when it was uploaded, who (if anyone) has reviewed it.
 */
export function PreviewCard({ entry, name }: Props) {
  const { t, locale } = useLocale();

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("document.preview.title")}
          </p>
          <h3 className="mt-0.5 text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {name}
          </h3>
        </div>
        <DocumentStatusBadge status={entry.status} />
      </div>

      <div
        className="mt-4 flex h-32 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] text-[var(--text-xs)] text-[var(--color-text-tertiary)]"
        aria-hidden="true"
      >
        {t("document.preview.noPreview")}
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-1.5 text-[var(--text-sm)]">
        {entry.fileName ? (
          <div className="flex gap-2">
            <dt className="w-[40%] text-[var(--color-text-tertiary)]">
              {t("document.preview.fileLabel")}
            </dt>
            <dd className="flex-1 break-all text-[var(--color-text-primary)]">{entry.fileName}</dd>
          </div>
        ) : null}
        {entry.sizeKb ? (
          <div className="flex gap-2">
            <dt className="w-[40%] text-[var(--color-text-tertiary)]">
              {t("document.preview.sizeLabel")}
            </dt>
            <dd className="flex-1 text-[var(--color-text-primary)]">{formatSize(entry.sizeKb)}</dd>
          </div>
        ) : null}
        {entry.uploadedAt ? (
          <div className="flex gap-2">
            <dt className="w-[40%] text-[var(--color-text-tertiary)]">
              {t("document.preview.uploadedAtLabel")}
            </dt>
            <dd className="flex-1 text-[var(--color-text-primary)]">
              {formatTimestamp(entry.uploadedAt, locale)}
            </dd>
          </div>
        ) : null}
        {entry.reviewedAt ? (
          <div className="flex gap-2">
            <dt className="w-[40%] text-[var(--color-text-tertiary)]">
              {t("document.preview.reviewedAtLabel")}
            </dt>
            <dd className="flex-1 text-[var(--color-text-primary)]">
              {formatTimestamp(entry.reviewedAt, locale)}
            </dd>
          </div>
        ) : null}
        {entry.reviewedBy ? (
          <div className="flex gap-2">
            <dt className="w-[40%] text-[var(--color-text-tertiary)]">
              {t("document.preview.reviewerLabel")}
            </dt>
            <dd className="flex-1 text-[var(--color-text-primary)]">{entry.reviewedBy}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
