"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "./locale-provider";

const STEPS = [
  "registered",
  "profileComplete",
  "submitted",
  "underScrutiny",
  "meritPublished",
  "allotted",
  "admissionConfirmed",
] as const;

export type StatusStep = (typeof STEPS)[number];

export function StatusTracker({ currentStep }: { currentStep: StatusStep }) {
  const { t } = useLocale();
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <ol
      className="relative grid grid-cols-7 gap-1"
      role="list"
      aria-label={t("screen.dashboard.statusTitle")}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[7%] right-[7%] top-[15px] h-px bg-[var(--color-border-subtle)]"
      />
      {STEPS.map((step, idx) => {
        const state =
          idx < currentIndex ? "done" : idx === currentIndex ? "current" : "upcoming";
        return (
          <li
            key={step}
            className="relative flex flex-col items-center text-center text-[10px] leading-[var(--leading-tight)]"
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                state === "done" &&
                  "border-[var(--color-interactive-primary)] bg-[var(--color-interactive-primary)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)]",
                state === "current" &&
                  "border-[var(--color-interactive-primary)] bg-[var(--color-surface)] text-[var(--color-text-brand)] shadow-[var(--shadow-halo-brand)]",
                state === "upcoming" &&
                  "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-tertiary)]",
              )}
            >
              {state === "done" ? "✓" : idx + 1}
            </span>
            <span
              className={cn(
                "mt-2 text-[10px] sm:text-[11px]",
                state === "upcoming"
                  ? "text-[var(--color-text-tertiary)]"
                  : "text-[var(--color-text-secondary)]",
                state === "current" &&
                  "font-[var(--weight-semibold)] text-[var(--color-text-brand)]",
              )}
            >
              {t(`status.${step}`)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
