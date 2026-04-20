"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import type { Readiness } from "./readiness";

interface Props {
  readiness: Readiness;
  /** Course id is used to build the Edit preferences link. */
  courseId: string;
  className?: string;
}

type Row = {
  key: string;
  ok: boolean;
  message: string;
  editHref: string;
};

/**
 * Three-row readiness block shown on the review screen. Each row links back
 * to the screen that owns the missing piece so a student can jump straight to
 * the fix.
 */
export function ReadinessChecklist({ readiness, courseId, className }: Props) {
  const { t } = useLocale();

  const rows: Row[] = [
    {
      key: "profile",
      ok: readiness.profile.ok,
      message: readiness.profile.ok
        ? t("readiness.profile.ok")
        : t("readiness.profile.missing", { n: readiness.profile.missing }),
      editHref: "/profile/step/1",
    },
    {
      key: "documents",
      ok: readiness.documents.ok,
      message: readiness.documents.ok
        ? t("readiness.documents.ok")
        : readiness.documents.uploaded === 0
          ? t("readiness.documents.missing")
          : t("readiness.documents.partial", {
              uploaded: readiness.documents.uploaded,
              required: readiness.documents.required,
            }),
      editHref: "/documents",
    },
    {
      key: "preferences",
      ok: readiness.preferences.ok,
      message: readiness.preferences.ok
        ? t("readiness.preferences.ok", { n: readiness.preferences.count })
        : t("readiness.preferences.missing"),
      editHref: `/apply/${courseId}/preferences`,
    },
  ];

  const blocked = !readiness.canSubmit;

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border p-4",
        blocked
          ? "border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)]"
          : "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)]",
        className,
      )}
    >
      <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        {blocked ? t("readiness.blockedTitle") : t("readiness.allGoodTitle")}
      </p>
      <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        {blocked ? t("readiness.blockedHint") : t("readiness.allGoodHint")}
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-start gap-2 text-[var(--text-sm)]">
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[var(--text-xs)] font-[var(--weight-bold)]",
                row.ok
                  ? "bg-[var(--color-interactive-success)] text-[var(--color-text-inverse)]"
                  : "bg-[var(--color-text-danger)] text-[var(--color-text-inverse)]",
              )}
            >
              {row.ok ? "✓" : "!"}
            </span>
            <span className="flex-1 text-[var(--color-text-primary)]">{row.message}</span>
            {!row.ok ? (
              <Link
                href={row.editHref}
                className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
              >
                {t("cta.edit")}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
