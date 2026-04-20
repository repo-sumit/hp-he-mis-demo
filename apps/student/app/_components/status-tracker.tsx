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
    <ol className="grid grid-cols-7 gap-1" role="list" aria-label={t("screen.dashboard.statusTitle")}>
      {STEPS.map((step, idx) => {
        const state =
          idx < currentIndex ? "done" : idx === currentIndex ? "current" : "upcoming";
        return (
          <li
            key={step}
            className="flex flex-col items-center text-center text-[10px] leading-tight"
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                state === "done" &&
                  "border-[var(--color-interactive-brand)] bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)]",
                state === "current" &&
                  "border-[var(--color-interactive-brand)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]",
                state === "upcoming" &&
                  "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-tertiary)]",
              )}
            >
              {state === "done" ? "✓" : idx + 1}
            </span>
            <span
              className={cn(
                "mt-1",
                state === "upcoming"
                  ? "text-[var(--color-text-tertiary)]"
                  : "text-[var(--color-text-secondary)]",
                state === "current" && "font-[var(--weight-semibold)] text-[var(--color-text-brand)]",
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
