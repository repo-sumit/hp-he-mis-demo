"use client";

import type { Language } from "@hp-mis/types";
import { cn } from "./cn";

export interface LanguageSwitcherProps {
  current: Language;
  onChange: (next: Language) => void;
  className?: string;
}

const label: Record<Language, string> = { en: "English", hi: "हिन्दी" };

export function LanguageSwitcher({ current, onChange, className }: LanguageSwitcherProps) {
  const next: Language = current === "en" ? "hi" : "en";
  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      aria-label={`Switch language to ${label[next]}`}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]",
        className,
      )}
    >
      <span aria-hidden="true">🌐</span>
      <span>{label[next]}</span>
    </button>
  );
}
