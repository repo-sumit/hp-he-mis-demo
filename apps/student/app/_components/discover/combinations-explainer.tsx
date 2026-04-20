"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

/**
 * Short info card that explains what a "BA combination" is. Surfaced on any
 * screen where the student first encounters combination-based results.
 */
export function CombinationsExplainer({ className }: { className?: string }) {
  const { t } = useLocale();
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] p-3",
        className,
      )}
    >
      <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        <span aria-hidden="true" className="mr-1">💡</span>
        {t("discover.combinationsExplainer.title")}
      </p>
      <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("discover.combinationsExplainer.body")}
      </p>
    </section>
  );
}
