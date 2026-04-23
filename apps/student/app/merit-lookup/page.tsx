"use client";

import Link from "next/link";
import { useState } from "react";
import { PageShell } from "../_components/page-shell";
import { Field } from "../_components/field";
import { PrimaryButton } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";
import { useEffectiveStudentStep } from "../_components/use-effective-step";
import { useProfile } from "../_components/profile/profile-provider";
import { getCourse } from "../_components/discover/mock-data";

/**
 * Pre-login merit lookup. Active only after the state publishes the merit
 * list for the cycle; until then it renders a clearly-labelled "not open
 * yet" state with the expected publication date.
 *
 * During an operator demo, the merit list is treated as published once
 * the effective step reaches "meritPublished" or beyond — the input
 * enables and the matching record for the synthesised student appears
 * inline so reviewers can see the full lookup → result flow.
 */
const MERIT_PUBLISHED_BASELINE = false;

const STAGES_AFTER_MERIT = new Set([
  "meritPublished",
  "allotted",
  "admissionConfirmed",
]);

export default function MeritLookupPage() {
  const { t } = useLocale();
  const effective = useEffectiveStudentStep();
  const { draft } = useProfile();
  const [query, setQuery] = useState("");
  const [revealed, setRevealed] = useState(false);

  const meritPublished =
    MERIT_PUBLISHED_BASELINE ||
    (effective.isDemo && STAGES_AFTER_MERIT.has(effective.step));

  const submittedCourse = effective.firstSubmittedCourseId
    ? getCourse(effective.firstSubmittedCourseId)
    : null;
  const candidateName = draft.fullName.trim() || "Asha Sharma";
  const applicationNumber = effective.firstApplicationNumber ?? "HPU/2026/000147";

  // Result row shown only when (a) merit is "published" via demo and
  // (b) the operator has actually run a lookup. Numbers are stable mock
  // values so the panel feels like a real record, not a placeholder.
  const result = revealed
    ? {
        rank: 47,
        category: "General",
        score: 87.4,
        course: submittedCourse,
      }
    : null;

  return (
    <PageShell
      backHref="/"
      eyebrow={t("screen.home.cycleTag")}
      title={t("preLogin.cards.meritLookup.title")}
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
          {t("preLogin.meritLookup.title")}
        </h2>
        <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("preLogin.meritLookup.subtitle")}
        </p>
      </section>

      <section className="mt-5 space-y-3">
        <Field
          name="meritQuery"
          label={t("preLogin.meritLookup.inputLabel")}
          placeholder={
            meritPublished ? applicationNumber : t("preLogin.meritLookup.inputPlaceholder")
          }
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (revealed) setRevealed(false);
          }}
          disabled={!meritPublished}
        />
        <PrimaryButton
          type="button"
          disabled={!meritPublished || !query.trim()}
          onClick={() => setRevealed(true)}
        >
          {t("preLogin.meritLookup.lookupCta")}
        </PrimaryButton>
      </section>

      {!meritPublished ? (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-4">
          <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            <span aria-hidden="true" className="mr-1">📅</span>
            {t("preLogin.meritLookup.notPublishedTitle")}
          </p>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("preLogin.meritLookup.notPublishedBody")}
          </p>
        </section>
      ) : (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-softer)] p-4">
          <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-brand)]">
            <span aria-hidden="true" className="mr-1">✓</span>
            Merit list published for this cycle
          </p>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-primary)]">
            Enter your application number above to look up your rank.
          </p>
          {result ? (
            <article className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3">
              <header className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                  {applicationNumber}
                </p>
                <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-brand)]">
                  Rank #{result.rank}
                </p>
              </header>
              <p className="mt-1 text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                {candidateName}
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-y-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                <dt className="text-[var(--color-text-tertiary)]">Category</dt>
                <dd className="text-right font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                  {result.category}
                </dd>
                <dt className="text-[var(--color-text-tertiary)]">Best-of-five</dt>
                <dd className="text-right font-mono text-[var(--color-text-primary)]">
                  {result.score.toFixed(1)}%
                </dd>
                {result.course ? (
                  <>
                    <dt className="text-[var(--color-text-tertiary)]">Course</dt>
                    <dd className="text-right text-[var(--color-text-primary)]">
                      {result.course.code} · {t(result.course.nameKey)}
                    </dd>
                  </>
                ) : null}
              </dl>
            </article>
          ) : null}
        </section>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href="/dates"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
        >
          {t("preLogin.cards.dates.title")}
        </Link>
        <Link
          href="/"
          className="text-center text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("preLogin.meritLookup.backHint")}
        </Link>
      </div>
    </PageShell>
  );
}
