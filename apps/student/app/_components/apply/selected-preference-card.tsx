"use client";

import type { ReactNode } from "react";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import { EligibilityStateBadge } from "../discover/eligibility-state-badge";
import {
  candidateCollegeName,
  candidateDistrict,
  type PreferenceCandidate,
} from "./candidates";

interface Props {
  candidate: PreferenceCandidate;
  /** Extra content (reorder controls, remove button) rendered at the right of the card. */
  trailing?: ReactNode;
  className?: string;
}

/**
 * Compact read-only view of a candidate, used inside the rank row and
 * reusable anywhere we need to echo a selected preference (e.g. review
 * screen later).
 */
export function SelectedPreferenceCard({ candidate, trailing, className }: Props) {
  const { t } = useLocale();
  const college = candidateCollegeName(candidate);
  const district = candidateDistrict(candidate);
  const combo = candidate.combination;

  return (
    <article
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {combo ? (
          <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t("apply.candidate.combinationLabel", { a: combo.subjectA, b: combo.subjectB })}
          </p>
        ) : null}
        <p
          className={cn(
            combo
              ? "text-[var(--text-xs)] text-[var(--color-text-secondary)]"
              : "text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]",
          )}
        >
          {college}
        </p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">{district}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <EligibilityStateBadge state={candidate.state} />
          <span className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
            {t("apply.candidate.seats", {
              total: candidate.totalSeats,
              vacant: candidate.vacantSeats,
            })}
          </span>
        </div>
      </div>
      {trailing ? <div className="flex-none">{trailing}</div> : null}
    </article>
  );
}
