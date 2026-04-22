"use client";

import { useCallback, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "./cn";

export interface SegmentedOption<V extends string = string> {
  value: V;
  label: ReactNode;
  /** Optional leading glyph or icon. */
  icon?: ReactNode;
  /** Optional trailing hint text rendered under the label. */
  hint?: ReactNode;
  disabled?: boolean;
  /** Visual tone for the selected state. Default: `brand`. */
  tone?: "brand" | "success" | "warning" | "danger";
}

type Layout = "inline" | "stack";
type Size = "sm" | "md";

export interface SegmentedOptionsProps<V extends string = string> {
  /** Current selected value. When no match is found the group acts unselected. */
  value: V | undefined;
  /** Called when the user picks a new option. Disabled options do not fire. */
  onChange: (next: V) => void;
  options: readonly SegmentedOption<V>[];
  /** Accessible label for the radio group. */
  ariaLabel?: string;
  /**
   * `inline` — horizontal pills (admin density default).
   * `stack` — card rows; supports icon + label + hint.
   */
  layout?: Layout;
  /** `sm` for admin / table-row density; `md` for student-facing. */
  size?: Size;
  /** Grid column count when `layout="stack"`. Default 1. */
  columns?: 1 | 2;
  /** Disable the entire group. */
  disabled?: boolean;
  className?: string;
}

const SELECTED_TONE: Record<NonNullable<SegmentedOption["tone"]>, string> = {
  brand:
    "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]",
  success:
    "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
  warning:
    "border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]",
  danger:
    "border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
};

const UNSELECTED =
  "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]";

const INLINE_SIZE: Record<Size, string> = {
  sm: "h-[var(--button-height-sm)] px-4 text-[var(--text-xs)]",
  md: "h-[var(--button-height)] px-5 text-[var(--text-sm)]",
};

/**
 * Segmented single-select (radio group) primitive — used for compact Y/N/C
 * pickers in admin tables, 4-way scope pickers on detail screens, and any
 * place a traditional radio set would otherwise be expressed with bespoke
 * button markup.
 *
 * Behavior: arrow-key + Home/End navigation matches the WAI-ARIA APG radio
 * group pattern. Only the selected option is tab-reachable; arrow keys
 * move selection without needing to tab through each option.
 */
export function SegmentedOptions<V extends string = string>({
  value,
  onChange,
  options,
  ariaLabel,
  layout = "inline",
  size = "md",
  columns = 1,
  disabled,
  className,
}: SegmentedOptionsProps<V>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const enabledIndices = options
    .map((opt, idx) => (opt.disabled ? -1 : idx))
    .filter((idx) => idx >= 0);

  const focusOption = useCallback((index: number) => {
    const node = refs.current[index];
    if (node) node.focus();
  }, []);

  const handleKey = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      if (enabledIndices.length === 0) return;
      const positionInEnabled = enabledIndices.indexOf(currentIndex);

      let nextIndex: number | null = null;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          nextIndex =
            enabledIndices[(positionInEnabled + 1) % enabledIndices.length] ?? null;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          nextIndex =
            enabledIndices[
              (positionInEnabled - 1 + enabledIndices.length) %
                enabledIndices.length
            ] ?? null;
          break;
        case "Home":
          nextIndex = enabledIndices[0] ?? null;
          break;
        case "End":
          nextIndex = enabledIndices[enabledIndices.length - 1] ?? null;
          break;
        default:
          return;
      }
      if (nextIndex === null) return;
      event.preventDefault();
      const nextOption = options[nextIndex];
      if (nextOption) {
        onChange(nextOption.value);
        focusOption(nextIndex);
      }
    },
    [enabledIndices, focusOption, onChange, options],
  );

  const firstSelectedIndex =
    options.findIndex((opt) => opt.value === value && !opt.disabled) >= 0
      ? options.findIndex((opt) => opt.value === value && !opt.disabled)
      : enabledIndices[0] ?? 0;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        layout === "inline"
          ? "inline-flex flex-wrap items-center gap-2"
          : cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-1"),
        className,
      )}
    >
      {options.map((opt, idx) => {
        const selected = opt.value === value;
        const rowDisabled = Boolean(disabled || opt.disabled);
        const tone = opt.tone ?? "brand";
        const isTabbable = idx === firstSelectedIndex;

        const common = {
          ref: (node: HTMLButtonElement | null) => {
            refs.current[idx] = node;
          },
          type: "button" as const,
          role: "radio" as const,
          "aria-checked": selected,
          tabIndex: isTabbable && !rowDisabled ? 0 : -1,
          disabled: rowDisabled,
          onClick: () => {
            if (rowDisabled) return;
            onChange(opt.value);
          },
          onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) =>
            handleKey(event, idx),
        };

        if (layout === "inline") {
          return (
            <button
              key={String(opt.value)}
              {...common}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border font-[var(--weight-semibold)]",
                "transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
                "disabled:cursor-not-allowed disabled:opacity-55",
                INLINE_SIZE[size],
                selected ? SELECTED_TONE[tone] : UNSELECTED,
              )}
            >
              {opt.icon ? (
                <span aria-hidden="true" className="inline-flex">
                  {opt.icon}
                </span>
              ) : null}
              <span>{opt.label}</span>
            </button>
          );
        }

        return (
          <button
            key={String(opt.value)}
            {...common}
            className={cn(
              "flex min-h-[var(--tap-target-min)] items-start gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left",
              "transition-colors focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
              "disabled:cursor-not-allowed disabled:opacity-55",
              selected ? SELECTED_TONE[tone] : UNSELECTED,
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-[var(--radius-pill)] border-2",
                selected
                  ? "border-[var(--color-interactive-primary)] bg-[var(--color-interactive-primary)] text-[var(--color-text-on-brand)]"
                  : "border-[var(--color-border-strong)]",
              )}
            >
              {selected ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                {opt.icon ? (
                  <span aria-hidden="true">{opt.icon}</span>
                ) : null}
                {opt.label}
              </span>
              {opt.hint ? (
                <span className="mt-0.5 block text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                  {opt.hint}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
