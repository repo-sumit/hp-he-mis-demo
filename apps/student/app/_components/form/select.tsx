"use client";

import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@hp-mis/ui";

export interface SelectOption {
  value: string;
  label: string;
}

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "id"> & {
  label: string;
  helper?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({
  label,
  helper,
  error,
  options,
  placeholder,
  name,
  ...rest
}: Props) {
  const autoId = useId();
  const id = name ? `field-${name}` : autoId;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "h-[var(--input-height)] w-full appearance-none rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 pr-8 text-[var(--text-base)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30",
          "bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat",
          error ? "border-[var(--color-text-danger)]" : "border-[var(--color-border-strong)]",
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6'><path d='M0 0l5 6 5-6z' fill='%234c5567'/></svg>\")",
        }}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
