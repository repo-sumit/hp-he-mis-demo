"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@hp-mis/ui";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "id"> & {
  label: string;
  helper?: string;
  error?: string;
};

export function Textarea({ label, helper, error, name, rows = 3, ...rest }: Props) {
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
      <textarea
        id={id}
        name={name}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "min-h-[96px] w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 py-2.5 text-[var(--text-base)] leading-[var(--leading-normal)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30",
          error ? "border-[var(--color-text-danger)]" : "border-[var(--color-border-strong)]",
        )}
        {...rest}
      />
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
