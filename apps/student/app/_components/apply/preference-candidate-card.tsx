"use client";

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
  selected: boolean;
  canAdd: boolean;
  onToggle: () => void;
}

/**
 * Single candidate tile on the /apply/[courseId]/preferences screen.
 * Supports both BA combinations (subject A + subject B) and non-BA offerings
 * (college only). The Add/Remove toggle disables when the course is at max
 * capacity and this candidate isn't already selected.
 */
export function PreferenceCandidateCard({ candidate, selected, canAdd, onToggle }: Props) {
  const { t } = useLocale();
  const collegeName = candidateCollegeName(candidate);
  const district = candidateDistrict(candidate);
  const isCombination = candidate.kind === "combination";
  const combo = candidate.combination;

  const disabled = !selected && !canAdd;

  return (
    <article
      className={cn(
        "rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-4",
        selected
          ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)]"
          : "border-[var(--color-border)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isCombination && combo ? (
            <>
              <p className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                {t("apply.candidate.combinationLabel", { a: combo.subjectA, b: combo.subjectB })}
              </p>
              <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                {t("apply.candidate.bucketLabel", { a: combo.bucketA, b: combo.bucketB })}
              </p>
              <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                {collegeName}
              </p>
            </>
          ) : (
            <p className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {collegeName}
            </p>
          )}
          <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">{district}</p>
        </div>
        <EligibilityStateBadge state={candidate.state} />
      </div>

      <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        {t("apply.candidate.seats", {
          total: candidate.totalSeats,
          vacant: candidate.vacantSeats,
        })}
      </p>

      <div className="mt-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={selected}
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)]",
            selected
              ? "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
              : "bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          {selected ? t("cta.remove") : t("cta.add")}
        </button>
      </div>
    </article>
  );
}
