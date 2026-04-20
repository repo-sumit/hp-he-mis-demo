"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@hp-mis/ui";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id"> & {
  label: string;
  helper?: string;
  error?: string;
  /** Render extra content (e.g. an inline link) below the input. */
  adornment?: ReactNode;
};

/**
 * Student-friendly form field: label-above, always-visible helper text,
 * tall input (56px) per low-tech design rules (§10.2, §7.7).
 */
export function Field({ label, helper, error, adornment, ...inputProps }: FieldProps) {
  const autoId = useId();
  const id = inputProps.name ? `field-${inputProps.name}` : autoId;
  const describedBy = [helper ? `${id}-helper` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy || undefined}
        className={cn(
          "h-[var(--input-height)] w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3.5 text-[var(--text-base)] text-[var(--color-text-primary)] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-focus)] focus:shadow-[var(--focus-ring)] read-only:bg-[var(--color-background-subtle)] read-only:text-[var(--color-text-secondary)]",
          error
            ? "border-[var(--color-text-danger)] focus:border-[var(--color-text-danger)] focus:shadow-[var(--focus-ring-danger)]"
            : "border-[var(--color-border-strong)]",
        )}
        {...inputProps}
      />
      {helper && !error ? (
        <p id={`${id}-helper`} className="text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1 text-[var(--text-xs)] text-[var(--color-text-danger)]"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      ) : null}
      {adornment ? <div className="pt-0.5">{adornment}</div> : null}
    </div>
  );
}
