"use client";

import { useId } from "react";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

interface Props {
  label: string;
  helper?: string;
  value: boolean;
  onChange: (next: boolean) => void;
  /** Override the default Yes/No labels. */
  yesLabel?: string;
  noLabel?: string;
}

/**
 * Binary Yes/No card toggle used for single-girl-child, PwD, and
 * "correspondence same as permanent" questions.
 */
export function Toggle({ label, helper, value, onChange, yesLabel, noLabel }: Props) {
  const groupId = useId();
  const { t } = useLocale();
  const yes = yesLabel ?? t("common.yes");
  const no = noLabel ?? t("common.no");

  return (
    <div className="flex flex-col gap-2">
      <span
        id={groupId}
        className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
      >
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={groupId} className="grid grid-cols-2 gap-2">
        {[
          { v: true, l: yes },
          { v: false, l: no },
        ].map(({ v, l }) => {
          const active = v === value;
          return (
            <button
              key={String(v)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(v)}
              className={cn(
                "h-12 rounded-[var(--radius-md)] border text-[var(--text-sm)] font-[var(--weight-medium)]",
                active
                  ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]"
                  : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]",
              )}
            >
              {l}
            </button>
          );
        })}
      </div>
      {helper ? (
        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{helper}</p>
      ) : null}
    </div>
  );
}
