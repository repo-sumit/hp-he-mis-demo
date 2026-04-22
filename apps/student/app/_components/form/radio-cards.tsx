"use client";

import { useId } from "react";
import { cn } from "@hp-mis/ui";

export interface RadioCardOption {
  value: string;
  label: string;
  hint?: string;
  icon?: string;
}

interface Props {
  label: string;
  helper?: string;
  error?: string;
  name: string;
  options: RadioCardOption[];
  value: string;
  onChange: (next: string) => void;
  /** 1 = single column (default), 2 = two columns on all widths. */
  columns?: 1 | 2;
}

export function RadioCards({
  label,
  helper,
  error,
  name,
  options,
  value,
  onChange,
  columns = 1,
}: Props) {
  const groupId = useId();
  // Stable, name-based id on the wrapper so the review page's focus helper
  // (`#field-<name>`) can target radio groups the same way it targets
  // regular inputs.
  const anchorId = name ? `field-${name}` : groupId;
  return (
    <div className="flex flex-col gap-2">
      <span
        id={groupId}
        className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
      >
        {label}
      </span>
      <div
        id={anchorId}
        role="radiogroup"
        aria-labelledby={groupId}
        tabIndex={-1}
        className={cn(
          "grid gap-2 scroll-mt-20 focus:outline-none",
          columns === 2 ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <label
              key={opt.value}
              className={cn(
                "flex min-h-[var(--tap-target-min)] cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-3 py-3 transition-colors",
                active
                  ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)]"
                  : "border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:bg-[var(--color-background-subtle)]",
              )}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={active}
                onChange={() => onChange(opt.value)}
                className="h-5 w-5 flex-none accent-[var(--color-interactive-primary)]"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                  {opt.icon ? (
                    <span aria-hidden="true" className="mr-1">
                      {opt.icon}
                    </span>
                  ) : null}
                  {opt.label}
                </span>
                {opt.hint ? (
                  <span className="mt-0.5 block text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {opt.hint}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {helper && !error ? (
        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{helper}</p>
      ) : null}
      {error ? (
        <p className="flex items-center gap-1 text-[var(--text-xs)] text-[var(--color-text-danger)]">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
