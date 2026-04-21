"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import { EligibilityStateBadge } from "./eligibility-state-badge";
import { NotEligibleReasonBlock } from "./not-eligible-reason-block";
import type { EligibilityResult } from "./evaluate";
import { combinationsFor, getCollege, mockDistanceKm, type Course } from "./mock-data";
import { useProfile } from "../profile/profile-provider";
import { HP_DISTRICTS } from "@hp-mis/fixtures";

interface Props {
  result: EligibilityResult;
  /** Hide the district line when cards are shown inside a college page. */
  hideDistrict?: boolean;
  /** Hide the college line when cards are shown inside a course page. */
  hideCollege?: boolean;
}

export function EligibilityResultCard({ result, hideDistrict, hideCollege }: Props) {
  const { t } = useLocale();
  const { draft } = useProfile();
  const college = getCollege(result.collegeId)!;
  const course: Course = result.course;
  const combos = course.combinationBased
    ? combinationsFor(result.collegeId, result.courseId).length
    : 0;
  const studentDistrictName =
    HP_DISTRICTS.find((d) => d.id === draft.district)?.name ?? "";
  const distanceKm = studentDistrictName
    ? mockDistanceKm(result.collegeId, studentDistrictName)
    : null;

  const disabled = result.state === "not_eligible";

  return (
    <article
      className={cn(
        "rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-4",
        disabled
          ? "border-[var(--color-border)] opacity-90"
          : "border-[var(--color-border)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {course.code}
          </p>
          <h3 className="mt-0.5 text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t(course.nameKey)}
          </h3>
          {!hideCollege ? (
            <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {college.name}
            </p>
          ) : null}
          {!hideDistrict ? (
            <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              {t("discover.card.district", { district: college.district })}
            </p>
          ) : null}
        </div>
        <EligibilityStateBadge state={result.state} />
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        <div>
          <dt className="inline text-[var(--color-text-tertiary)]">
            {t("discover.card.totalSeats", {
              total: result.offering.totalSeats,
              vacant: result.offering.vacantSeats,
            })}
          </dt>
        </div>
        {course.combinationBased ? (
          <div>
            <dt className="inline text-[var(--color-text-tertiary)]">
              {t("discover.card.combinationsCount", { n: combos })}
            </dt>
          </div>
        ) : null}
        {distanceKm != null ? (
          <div>
            <dt className="inline text-[var(--color-text-tertiary)]">
              {t("discover.card.distanceKm", { km: distanceKm })}
            </dt>
          </div>
        ) : null}
      </dl>

      {result.reasons.length > 0 ? (
        <NotEligibleReasonBlock
          reasons={result.reasons}
          state={result.state}
          className="mt-3"
        />
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {result.state !== "not_eligible" ? (
          <Link
            href={`/apply/${result.courseId}/preferences`}
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-3 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
          >
            {t("cta.startApplication")}
          </Link>
        ) : null}
        <Link
          href={`/discover/college/${result.collegeId}`}
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
        >
          {t("cta.viewCollege")}
        </Link>
      </div>
    </article>
  );
}
