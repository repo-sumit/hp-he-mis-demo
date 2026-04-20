"use client";

import { useLocale } from "../locale-provider";
import { formatTimestamp } from "./format";
import type { DocumentEntry } from "./documents-provider";

interface Props {
  entry: DocumentEntry;
  name: string;
}

/**
 * The detailed rejection panel used on /documents/rejection/[docType].
 * Leads with the plain-language reason so the student knows exactly what
 * to fix before they re-upload (§10.5).
 */
export function RejectionCard({ entry, name }: Props) {
  const { t, locale } = useLocale();
  const reason = entry.rejectionReason ?? t("document.mock.rejectionReason");

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] p-4">
      <div className="flex items-start gap-2">
        <span aria-hidden="true" className="text-[var(--color-text-danger)]">
          ⚠
        </span>
        <div>
          <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-status-danger-fg)]">
            {t("document.rejection.title")}
          </p>
          <h3 className="mt-0.5 text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {name}
          </h3>
        </div>
      </div>

      <p className="mt-3 text-[var(--text-sm)] text-[var(--color-text-primary)]">
        <span className="font-[var(--weight-semibold)]">{t("document.rejection.reasonLabel")}: </span>
        {reason}
      </p>

      <dl className="mt-3 space-y-1 text-[var(--text-xs)]">
        {entry.reviewedBy ? (
          <div className="flex gap-2">
            <dt className="w-[40%] text-[var(--color-text-tertiary)]">
              {t("document.rejection.reviewerLabel")}
            </dt>
            <dd className="flex-1 text-[var(--color-text-primary)]">{entry.reviewedBy}</dd>
          </div>
        ) : null}
        {entry.reviewedAt ? (
          <div className="flex gap-2">
            <dt className="w-[40%] text-[var(--color-text-tertiary)]">
              {t("document.rejection.reviewedAtLabel")}
            </dt>
            <dd className="flex-1 text-[var(--color-text-primary)]">
              {formatTimestamp(entry.reviewedAt, locale)}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
