"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "./locale-provider";

const label = { en: "हिन्दी", hi: "English" } as const;

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, toggle } = useLocale();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch language to ${label[locale]}`}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]",
        className,
      )}
    >
      <span aria-hidden="true">🌐</span>
      <span>{label[locale]}</span>
    </button>
  );
}
