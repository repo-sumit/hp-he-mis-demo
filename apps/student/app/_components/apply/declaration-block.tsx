"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

interface Props {
  accepted: boolean;
  onChange: (next: boolean) => void;
  error?: string;
  className?: string;
}

/**
 * Legal declaration block using the §14.10 verbatim text. Renders the full
 * declaration on the page, followed by a single consent checkbox.
 */
export function DeclarationBlock({ accepted, onChange, error, className }: Props) {
  const { t } = useLocale();
  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)]">
          {t("declaration.body")}
        </p>
      </div>
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border p-3",
          accepted
            ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)]"
            : "border-[var(--color-border-strong)] bg-[var(--color-surface)]",
          error && !accepted ? "!border-[var(--color-text-danger)]" : "",
        )}
      >
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby="declaration-error"
          className="mt-1 h-5 w-5 flex-none accent-[var(--color-interactive-brand)]"
        />
        <span className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
          {t("declaration.acceptLabel")}
        </span>
      </label>
      {error ? (
        <p
          id="declaration-error"
          className="flex items-center gap-1 text-[var(--text-xs)] text-[var(--color-text-danger)]"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}
