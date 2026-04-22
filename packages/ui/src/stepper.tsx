import type { ReactNode } from "react";
import { cn } from "./cn";

export type StepState = "idle" | "active" | "done";

export interface Step {
  /** Display number. Usually 1-based index. */
  number: number | string;
  /** Short label under the circle (optional). */
  label?: ReactNode;
  state: StepState;
}

export interface StepperProps {
  steps: readonly Step[];
  className?: string;
  /**
   * "compact" = circles only, inline (used in modals).
   * "labeled" = circles + labels stacked vertically (used at the top of pages).
   */
  variant?: "compact" | "labeled";
}

const circleBase =
  "inline-flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-pill)] text-[var(--text-sm)] font-[var(--weight-bold)] shadow-[var(--shadow-sm)] transition-colors";

const circleByState: Record<StepState, string> = {
  idle: "bg-[var(--color-stepper-idle-bg)] text-[var(--color-stepper-idle-fg)]",
  active: "bg-[var(--color-stepper-active-bg)] text-[var(--color-stepper-active-fg)]",
  done: "bg-[var(--color-stepper-done-bg)] text-[var(--color-stepper-done-fg)]",
};

const connectorByState = (left: StepState, right: StepState): string => {
  // A connector is "lit" only when both sides have progressed past the origin.
  const isLit =
    (left === "done" || left === "active") &&
    (right === "active" || right === "done");
  return isLit
    ? "bg-[var(--color-stepper-connector-done)]"
    : "bg-[var(--color-stepper-connector)]";
};

/**
 * Numbered stepper. Horizontal, responsive: on narrow screens we collapse to
 * a compact row (no labels) so the Figma "Add New Item" modal reads well on
 * mobile too.
 */
export function Stepper({ steps, className, variant = "labeled" }: StepperProps) {
  return (
    <ol
      aria-label="Progress"
      className={cn("flex w-full items-start", className)}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const next = steps[index + 1];
        return (
          <li
            key={`${step.number}-${index}`}
            className={cn(
              "flex min-w-0 items-start",
              isLast ? "flex-none" : "flex-1",
            )}
          >
            <div className="flex min-w-0 flex-col items-center">
              <span
                aria-current={step.state === "active" ? "step" : undefined}
                className={cn(circleBase, circleByState[step.state])}
              >
                {step.number}
              </span>
              {variant === "labeled" && step.label ? (
                <span
                  className={cn(
                    "mt-2 text-center text-[var(--text-xs)] leading-[var(--leading-snug)]",
                    step.state === "active"
                      ? "font-[var(--weight-semibold)] text-[var(--color-text-brand)]"
                      : "text-[var(--color-text-secondary)]",
                  )}
                >
                  {step.label}
                </span>
              ) : null}
            </div>
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-2 mt-[17px] h-[2px] flex-1 rounded-full",
                  connectorByState(step.state, next!.state),
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
