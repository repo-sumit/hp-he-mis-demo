"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Size = "sm" | "md";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Optional visible label rendered beside the checkbox. */
  label?: ReactNode;
  /** Optional helper text below the label. */
  helper?: ReactNode;
  /** Optional error text below the label; flips the border tone. */
  error?: ReactNode;
  size?: Size;
}

const sizes: Record<Size, { box: string; text: string }> = {
  sm: { box: "h-4 w-4", text: "text-[var(--text-sm)]" },
  md: { box: "h-5 w-5", text: "text-[var(--text-sm)]" },
};

/**
 * Accessible checkbox. Uses the native input as the source of truth and
 * styles it with `accent-color` so the browser's built-in checkmark glyph
 * inherits the brand token. Keyboard focus draws the system focus ring.
 *
 * When rendered with a `label`, the component wraps the input in a
 * `<label>` for click-target expansion. Without a label it renders as a
 * bare `<input>` so callers can compose their own markup.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, helper, error, size = "md", className, disabled, ...props },
    ref,
  ) {
    const invalid = Boolean(error);
    const box = (
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex-none rounded-[var(--radius-sm)] accent-[var(--color-interactive-primary)]",
          "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
          sizes[size].box,
          invalid && "outline outline-2 outline-[var(--color-text-danger)]",
          className,
        )}
        {...props}
      />
    );

    if (!label && !helper && !error) {
      return box;
    }

    return (
      <label
        className={cn(
          "group flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] transition-colors duration-150 ease-out",
          "hover:text-[var(--color-text-brand)]",
          disabled && "cursor-not-allowed opacity-60 hover:text-[var(--color-text-primary)]",
        )}
      >
        <span className="mt-0.5 flex flex-none items-center">{box}</span>
        <span className="min-w-0">
          {label ? (
            <span
              className={cn(
                "block font-[var(--weight-medium)] text-[var(--color-text-primary)]",
                sizes[size].text,
              )}
            >
              {label}
            </span>
          ) : null}
          {error ? (
            <span className="mt-1 block text-[var(--text-xs)] text-[var(--color-text-danger)]">
              {error}
            </span>
          ) : helper ? (
            <span className="mt-1 block text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {helper}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);
