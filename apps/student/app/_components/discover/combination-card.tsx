"use client";

import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import type { Combination } from "./mock-data";

interface Props {
  combination: Combination;
  /** When false, the card styles as "reference-only" (e.g. in a Not Eligible parent). */
  selectable?: boolean;
  className?: string;
}

/**
 * Single BA subject-combination tile. Shows the two subjects, their buckets,
 * and a seat snapshot. Preferences are not wired yet — the tile is static.
 */
export function CombinationCard({ combination, selectable = true, className }: Props) {
  const { t } = useLocale();
  return (
    <article
      className={cn(
        "rounded-[var(--radius-md)] border bg-[var(--color-surface)] p-3",
        selectable
          ? "border-[var(--color-border-strong)]"
          : "border-dashed border-[var(--color-border)] opacity-70",
        className,
      )}
    >
      <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        {combination.subjectA} + {combination.subjectB}
      </p>
      <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        Bucket {combination.bucketA} · Bucket {combination.bucketB}
      </p>
      <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        {t("discover.card.totalSeats", {
          total: combination.totalSeats,
          vacant: combination.vacantSeats,
        })}
      </p>
    </article>
  );
}
