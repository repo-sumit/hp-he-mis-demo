"use client";

import { Checkbox, cn } from "@hp-mis/ui";
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
      <div
        className={cn(
          "rounded-[var(--radius-lg)] border p-4",
          accepted
            ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)]"
            : "border-[var(--color-border-strong)] bg-[var(--color-surface)]",
          error && !accepted ? "!border-[var(--color-text-danger)]" : "",
        )}
      >
        <Checkbox
          checked={accepted}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby="declaration-error"
          label={t("declaration.acceptLabel")}
        />
      </div>
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
