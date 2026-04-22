"use client";

import { useId } from "react";
import { cn } from "@hp-mis/ui";

export interface CheckboxOption {
  value: string;
  label: string;
  hint?: string;
}

interface Props {
  label: string;
  helper?: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (next: string[]) => void;
}

export function CheckboxGroup({ label, helper, options, value, onChange }: Props) {
  const groupId = useId();
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  return (
    <div className="flex flex-col gap-2">
      <span
        id={groupId}
        className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
      >
        {label}
      </span>
      <div className="grid grid-cols-1 gap-2" aria-labelledby={groupId}>
        {options.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={cn(
                "flex min-h-[var(--tap-target-min)] cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-3 py-3",
                active
                  ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)]"
                  : "border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:bg-[var(--color-background-subtle)]",
              )}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggle(opt.value)}
                className="h-5 w-5 flex-none accent-[var(--color-interactive-primary)]"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
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
      {helper ? (
        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{helper}</p>
      ) : null}
    </div>
  );
}
