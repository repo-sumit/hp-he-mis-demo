"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

/**
 * Surface the "one application per course type, separate fee" rule (§6.2
 * friction #7) front-and-centre so students don't collapse BA/BSc/BCom into
 * one mental model.
 */
export function SeparateApplicationExplainer({ className }: { className?: string }) {
  const { t } = useLocale();
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] p-3",
        className,
      )}
    >
      <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        <span aria-hidden="true" className="mr-1">📑</span>
        {t("apply.explain.separateApps.title")}
      </p>
      <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("apply.explain.separateApps.body")}
      </p>
    </section>
  );
}
