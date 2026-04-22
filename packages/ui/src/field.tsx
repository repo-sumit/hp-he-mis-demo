"use client";

import { createContext, useContext, useId } from "react";
import type { ReactNode } from "react";
import { cn } from "./cn";

type FieldContextValue = {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export function useField(): FieldContextValue | null {
  return useContext(FieldContext);
}

interface FieldGroupProps {
  /** Field label rendered above the control. */
  label: ReactNode;
  /** Optional numeric prefix ("1", "12", …). Reproduces the Figma "1). Label*" pattern. */
  number?: number | string;
  required?: boolean;
  helper?: ReactNode;
  error?: ReactNode;
  /** The actual input/select/textarea. */
  children: ReactNode;
  className?: string;
  /** Optional id override (useful when the input is rendered outside). */
  id?: string;
}

/**
 * Label + required marker + numbered prefix + helper/error, wired up with a
 * shared id via context so the child input doesn't have to plumb ids. Matches
 * the Figma "General Profile" grid.
 */
export function FieldGroup({
  label,
  number,
  required,
  helper,
  error,
  children,
  className,
  id,
}: FieldGroupProps) {
  const autoId = useId();
  const resolvedId = id ?? `field-${autoId}`;
  const helperId = helper ? `${resolvedId}-helper` : undefined;
  const errorId = error ? `${resolvedId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const invalid = Boolean(error);

  return (
    <FieldContext.Provider value={{ id: resolvedId, describedBy, invalid }}>
      <div className={cn("flex min-w-0 flex-col gap-2", className)}>
        <label
          htmlFor={resolvedId}
          className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]"
        >
          {number !== undefined ? (
            <span className="mr-1 font-[var(--weight-regular)] text-[var(--color-text-secondary)]">
              {number}).
            </span>
          ) : null}
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-[var(--color-text-danger)]">
              *
            </span>
          ) : null}
        </label>
        {children}
        {error ? (
          <p
            id={errorId}
            className="flex items-center gap-1 text-[var(--text-xs)] text-[var(--color-text-danger)]"
          >
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        ) : helper ? (
          <p
            id={helperId}
            className="text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]"
          >
            {helper}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
