"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { PageShell } from "../../../_components/page-shell";
import { useLocale } from "../../../_components/locale-provider";
import { useProfile } from "../../../_components/profile/profile-provider";
import { EligibilityResultCard } from "../../../_components/discover/eligibility-result-card";
import { CombinationCard } from "../../../_components/discover/combination-card";
import { CombinationsExplainer } from "../../../_components/discover/combinations-explainer";
import {
  evaluateAll,
  hasEnoughProfile,
  type EligibilityResult,
} from "../../../_components/discover/evaluate";
import {
  combinationsFor,
  getCollege,
  getCourse,
} from "../../../_components/discover/mock-data";

type Params = { collegeId: string };

export default function CollegeDetailPage({ params }: { params: Promise<Params> }) {
  const { collegeId } = use(params);
  const { t } = useLocale();
  const { draft } = useProfile();

  const college = getCollege(collegeId);
  if (!college) notFound();

  const ready = hasEnoughProfile(draft);
  const results = useMemo<EligibilityResult[]>(() => {
    if (!ready) return [];
    return evaluateAll(draft).filter((r) => r.collegeId === collegeId);
  }, [draft, collegeId, ready]);

  const baResult = results.find((r) => r.courseId === "ba");
  const baCombinations = baResult ? combinationsFor(collegeId, "ba") : [];
  const otherResults = results.filter((r) => r.courseId !== "ba");

  return (
    <PageShell
      eyebrow={t("discover.title")}
      title={college.name}
      backHref="/discover"
      width="wide"
    >
      <section>
        <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {t(`discover.college.type.${college.type}`)}
        </p>
        <h2 className="mt-2 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)] sm:text-[var(--text-3xl)]">
          {college.name}
        </h2>
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          <div>
            <dt className="inline text-[var(--color-text-tertiary)]">
              {t("discover.card.district", { district: college.district })}
            </dt>
          </div>
          <div>
            <dt className="inline text-[var(--color-text-tertiary)]">
              {t("discover.college.aisheCode", { code: college.aisheCode })}
            </dt>
          </div>
        </dl>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          <li className="rounded-[var(--radius-pill)] border border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)] px-2.5 py-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {t(`discover.college.coEd.${college.coEdStatus}`)}
          </li>
          <li className="rounded-[var(--radius-pill)] border border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)] px-2.5 py-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
            {t(`discover.college.hostel.${college.hostelAvailable}`)}
          </li>
        </ul>
        {college.website ? (
          <a
            href={college.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)] underline-offset-2 hover:underline"
          >
            {t("discover.college.website")}
          </a>
        ) : null}
      </section>

      <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 sm:p-5">
        <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {t("discover.college.departments")}
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {college.departments.map((dep) => (
            <li
              key={dep}
              className="rounded-[var(--radius-pill)] border border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)] px-2.5 py-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]"
            >
              {dep}
            </li>
          ))}
        </ul>
      </section>

      {!ready ? (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-5 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
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
        <section className="mt-8">
          <h3 className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            {t("discover.college.coursesHere")}
          </h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {[baResult, ...otherResults].filter(Boolean).map((r) => (
              <EligibilityResultCard key={r!.id} result={r!} hideCollege hideDistrict />
            ))}
          </div>
        </section>
      ) : null}

      {ready && baResult ? (
        <section className="mt-8">
          <h3 className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            {t("discover.college.combinationsHere")}
          </h3>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("discover.college.combinationsHint")}
          </p>
          <div className="mt-3">
            <CombinationsExplainer />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {baCombinations.map((combo) => (
              <CombinationCard
                key={combo.id}
                combination={combo}
                selectable={baResult.state !== "not_eligible"}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-[var(--radius-lg)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-softer)] p-5">
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

// Keep `getCourse` export silent for Next's type checker when not used at runtime.
void getCourse;
