"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { PageShell } from "../../../_components/page-shell";
import { useLocale } from "../../../_components/locale-provider";
import { useProfile } from "../../../_components/profile/profile-provider";
import { EligibilityResultCard } from "../../../_components/discover/eligibility-result-card";
import { CombinationsExplainer } from "../../../_components/discover/combinations-explainer";
import {
  evaluateAll,
  hasEnoughProfile,
  type EligibilityResult,
} from "../../../_components/discover/evaluate";
import { getCourse, offeringsFor } from "../../../_components/discover/mock-data";

type Params = { courseId: string };

export default function CourseDetailPage({ params }: { params: Promise<Params> }) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const { draft } = useProfile();

  const course = getCourse(courseId);
  if (!course) notFound();

  const offerings = offeringsFor(undefined, courseId);
  const totalSeats = offerings.reduce((sum, o) => sum + o.totalSeats, 0);
  const vacantSeats = offerings.reduce((sum, o) => sum + o.vacantSeats, 0);

  const ready = hasEnoughProfile(draft);
  const results = useMemo<EligibilityResult[]>(() => {
    if (!ready) return [];
    return evaluateAll(draft).filter((r) => r.courseId === courseId);
  }, [draft, courseId, ready]);

  const streamKey =
    course.streamRequired === "any"
      ? "discover.stream.any"
      : `discover.stream.${course.streamRequired}`;

  return (
    <PageShell eyebrow={t("discover.title")} title={t(course.nameKey)} backHref="/discover">
      <section>
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {course.code}
        </p>
        <h2 className="mt-0.5 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
          {t(course.nameKey)}
        </h2>
        <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t(course.descriptionKey)}
        </p>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-2">
        <Stat
          label={t("discover.course.streamRequired")}
          value={t(streamKey)}
        />
        <Stat label={t("discover.course.minMarks")} value={`${course.minMarks}%`} />
        <Stat
          label={t("discover.course.duration")}
          value={t("discover.course.durationYears", { n: course.durationYears })}
        />
        <Stat
          label={t("discover.card.totalSeats", { total: totalSeats, vacant: vacantSeats }).split("·")[0]!.trim()}
          value={`${totalSeats} · ${vacantSeats} ✓`}
        />
      </section>

      {course.combinationBased ? (
        <section className="mt-4 space-y-3">
          <CombinationsExplainer />
          <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {t("discover.course.combinationBasedNote")}
          </p>
        </section>
      ) : null}

      {!ready ? (
        <section className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-4 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("discover.reason.profileIncomplete")}{" "}
          <Link
            href="/profile/step/3"
            className="ml-1 font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            {t("discover.empty.profileCta")}
          </Link>
        </section>
      ) : null}

      {ready && results.length > 0 ? (
        <section className="mt-6 space-y-3">
          <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("discover.course.collegesOffering")}
          </h3>
          {results.map((r) => (
            <EligibilityResultCard key={r.id} result={r} hideCollege={false} />
          ))}
        </section>
      ) : null}

      <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-brand-subtle)] p-4">
        <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {t("discover.addPreference.title")}
        </p>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("discover.addPreference.body")}
        </p>
        <button
          type="button"
          disabled
          className="mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-tertiary)]"
        >
          {t("cta.addPreferenceLater")}
        </button>
      </section>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-1 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}
