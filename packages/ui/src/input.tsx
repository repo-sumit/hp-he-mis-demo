"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";
import { useField } from "./field";

type Variant = "filled" | "outline";

type VariantProps = { variant?: Variant };

const baseControl =
  "w-full min-w-0 rounded-[var(--radius-input)] border text-[var(--text-sm)] text-[var(--color-text-primary)] " +
  "placeholder:text-[var(--color-text-tertiary)] transition-[background-color,border-color,box-shadow] " +
  "duration-150 outline-none read-only:cursor-default disabled:cursor-not-allowed disabled:opacity-60";

const variantClass: Record<Variant, string> = {
  filled:
    "bg-[var(--color-input-bg)] border-transparent hover:border-[var(--color-input-border)] " +
    "focus:bg-[var(--color-input-bg-focus)] focus:border-[var(--color-input-border-focus)] " +
    "focus:shadow-[var(--focus-ring)]",
  outline:
    "bg-[var(--color-surface)] border-[var(--color-input-border)] hover:border-[var(--color-border-strong)] " +
    "focus:border-[var(--color-input-border-focus)] focus:shadow-[var(--focus-ring)]",
};

const invalidClass =
  "border-[var(--color-text-danger)] focus:border-[var(--color-text-danger)] focus:shadow-[var(--focus-ring-danger)]";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & VariantProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = "filled", className, ...props },
  ref,
) {
  const field = useField();
  const invalid = props["aria-invalid"] ?? field?.invalid ? true : undefined;
  return (
    <input
      ref={ref}
      id={props.id ?? field?.id}
      aria-describedby={props["aria-describedby"] ?? field?.describedBy}
      aria-invalid={invalid}
      className={cn(
        baseControl,
        "h-[var(--input-height)] px-3.5",
        variantClass[variant],
        invalid && invalidClass,
        className,
      )}
      {...props}
    />
  );
});

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> &
  VariantProps & { placeholder?: string };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { variant = "filled", className, children, placeholder, ...props },
  ref,
) {
  const field = useField();
  const invalid = props["aria-invalid"] ?? field?.invalid ? true : undefined;
  return (
    <div className="relative">
      <select
        ref={ref}
        id={props.id ?? field?.id}
        aria-describedby={props["aria-describedby"] ?? field?.describedBy}
        aria-invalid={invalid}
        className={cn(
          baseControl,
          "h-[var(--input-height)] appearance-none pl-3.5 pr-10",
          variantClass[variant],
          invalid && invalidClass,
          className,
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
      >
        ▾
      </span>
    </div>
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & VariantProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { variant = "filled", className, rows = 4, ...props },
  ref,
) {
  const field = useField();
  const invalid = props["aria-invalid"] ?? field?.invalid ? true : undefined;
  return (
    <textarea
      ref={ref}
      id={props.id ?? field?.id}
      rows={rows}
      aria-describedby={props["aria-describedby"] ?? field?.describedBy}
      aria-invalid={invalid}
      className={cn(
        baseControl,
        "min-h-[96px] px-3.5 py-2.5 leading-[var(--leading-normal)]",
        variantClass[variant],
        invalid && invalidClass,
        className,
      )}
      {...props}
    />
  );
});
