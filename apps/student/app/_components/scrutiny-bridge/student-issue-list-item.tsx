"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import { formatRelative } from "./format";
import type { BridgeDiscrepancy } from "./scrutiny-bridge-provider";
import { ctaKeyForIssue, routeForIssue, scopeLabelKey } from "./issue-mappers";

interface Props {
  disc: BridgeDiscrepancy;
  className?: string;
}

/**
 * Single row on the /applications/[courseId]/issues page. Both languages
 * render together per §10.5 so the student always sees the exact message the
 * college sent, with a direct link to the screen that fixes it.
 */
export function StudentIssueListItem({ disc, className }: Props) {
  const { t } = useLocale();
  const awaiting = Boolean(disc.studentActionAt);
  const scope = t(scopeLabelKey(disc.scope));

  return (
    <article
      className={cn(
        "rounded-[var(--radius-lg)] border p-4",
        awaiting
          ? "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)]"
          : "border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide",
              awaiting
                ? "text-[var(--color-status-success-fg)]"
                : "text-[var(--color-status-danger-fg)]",
            )}
          >
            {scope}
          </p>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-primary)]">
            {disc.reasonEn}
          </p>
          <p
            lang="hi"
            className="mt-1 text-[var(--text-sm)] leading-[var(--leading-devanagari)] text-[var(--color-text-primary)]"
          >
            {disc.reasonHi}
          </p>
          <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {t("issue.list.raisedAt", { ago: formatRelative(disc.createdAt) })} ·{" "}
            {t("issue.list.by", { actor: disc.createdBy })}
          </p>
          {!awaiting ? (
            <p className="mt-1 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
              {t("issue.banner.deadlinePrefix")}: {disc.deadline}
            </p>
          ) : (
            <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {t("issue.list.awaiting")}
            </p>
          )}
        </div>
      </div>

      {!awaiting ? (
        <div className="mt-3">
          <Link
            href={routeForIssue(disc)}
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
          >
            {t(ctaKeyForIssue(disc))}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
