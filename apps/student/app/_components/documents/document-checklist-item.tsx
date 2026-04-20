"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import { DocumentStatusBadge } from "./document-status-badge";
import type { ChecklistItem } from "./document-rules";
import type { DocumentEntry } from "./documents-provider";

interface Props {
  item: ChecklistItem;
  entry: DocumentEntry;
}

/**
 * One row in the /documents checklist. The CTA and destination are derived
 * from the entry status so a rejected doc always routes to the rejection
 * screen, an uploaded one to preview, and a not-yet-uploaded one to upload.
 */
export function DocumentChecklistItem({ item, entry }: Props) {
  const { t } = useLocale();
  const { rule, required, conditional } = item;

  const status = entry.status;
  const isDone = status === "verified" || status === "uploaded" || status === "under_review";
  const needsAction = status === "rejected" || status === "re_upload_required";

  let ctaLabel: string;
  let ctaHref: string;
  if (status === "rejected" || status === "re_upload_required") {
    ctaLabel = t("cta.reUpload");
    ctaHref = `/documents/rejection/${rule.code}`;
  } else if (status === "verified" || status === "uploaded" || status === "under_review") {
    ctaLabel = t("cta.viewUpload");
    ctaHref = `/documents/preview/${rule.code}`;
  } else {
    ctaLabel = t("cta.upload");
    ctaHref = `/documents/upload/${rule.code}`;
  }

  const badgeKey = required
    ? conditional
      ? "document.badge.conditional"
      : "document.badge.required"
    : "document.badge.recommended";

  return (
    <article
      className={cn(
        "rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-4",
        needsAction ? "border-[var(--color-text-danger)]" : "border-[var(--color-border)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t(`document.name.${rule.code}`)}
          </p>
          <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {t(`document.description.${rule.code}`)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-secondary)]">
              {t(badgeKey)}
            </span>
            <DocumentStatusBadge status={status} />
          </div>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-0.5 text-[var(--text-xs)] text-[var(--color-text-tertiary)] sm:grid-cols-2">
        <div>
          <dt className="inline">{t("document.meta.formats", { list: rule.acceptedFormats.join(" · ") }).split(":")[0]}:</dt>{" "}
          <dd className="inline text-[var(--color-text-secondary)]">
            {rule.acceptedFormats.join(" · ")}
          </dd>
        </div>
        <div>
          <dt className="inline">{t("document.meta.maxSize", { mb: rule.maxSizeMb }).split(":")[0]}:</dt>{" "}
          <dd className="inline text-[var(--color-text-secondary)]">{rule.maxSizeMb} MB</dd>
        </div>
      </dl>

      {item.reasonKey ? (
        <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {t("document.meta.conditionalFor", {
            reason: t(item.reasonKey, item.reasonVars),
          })}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={ctaHref}
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)]",
            needsAction
              ? "bg-[var(--color-interactive-danger)] text-[var(--color-text-inverse)]"
              : isDone
                ? "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                : "bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)]",
          )}
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
