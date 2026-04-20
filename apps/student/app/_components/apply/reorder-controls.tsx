"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

interface Props {
  canUp: boolean;
  canDown: boolean;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  className?: string;
}

/**
 * Primary up/down controls plus a visual drag handle. Per §6.2 friction #10,
 * up/down arrows are the primary affordance on mobile and the drag handle is
 * cosmetic in this shell — real drag-to-reorder lands in a later sprint.
 */
export function ReorderControls({ canUp, canDown, onUp, onDown, onRemove, className }: Props) {
  const { t } = useLocale();
  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={onUp}
          disabled={!canUp}
          aria-label={t("cta.moveUp")}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border text-lg",
            canUp
              ? "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
              : "border-[var(--color-border)] bg-[var(--color-background-subtle)] text-[var(--color-text-tertiary)] opacity-60",
          )}
        >
          <span aria-hidden="true">↑</span>
        </button>
        <button
          type="button"
          onClick={onDown}
          disabled={!canDown}
          aria-label={t("cta.moveDown")}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border text-lg",
            canDown
              ? "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
              : "border-[var(--color-border)] bg-[var(--color-background-subtle)] text-[var(--color-text-tertiary)] opacity-60",
          )}
        >
          <span aria-hidden="true">↓</span>
        </button>
        <span
          aria-label={t("apply.rank.dragHandleLabel")}
          title={t("apply.rank.dragHandleLabel")}
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] text-[var(--color-text-tertiary)]"
        >
          <span aria-hidden="true">⋮⋮</span>
        </span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-danger)]"
      >
        {t("cta.remove")}
      </button>
    </div>
  );
}
