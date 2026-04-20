"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { notFound, useRouter } from "next/navigation";
import { PageShell } from "../../../_components/page-shell";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { useProfile } from "../../../_components/profile/profile-provider";
import { hasEnoughProfile } from "../../../_components/discover/evaluate";
import { getCourse } from "../../../_components/discover/mock-data";
import { CombinationsExplainer } from "../../../_components/discover/combinations-explainer";
import { useApplications } from "../../../_components/apply/applications-provider";
import { buildCandidates } from "../../../_components/apply/candidates";
import { maxPreferencesFor } from "../../../_components/apply/rules";
import { PreferenceCandidateCard } from "../../../_components/apply/preference-candidate-card";
import { MaxPreferenceGuidanceBlock } from "../../../_components/apply/max-preference-guidance-block";
import { StepProgress } from "../../../_components/apply/step-progress";

type Params = { courseId: string };

export default function PreferencesPage({ params }: { params: Promise<Params> }) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const { draft } = useProfile();
  const router = useRouter();

  const course = getCourse(courseId);
  if (!course) notFound();

  const ready = hasEnoughProfile(draft);
  const { getDraft, has, toggle, count } = useApplications();

  const candidates = useMemo(() => (ready ? buildCandidates(courseId, draft) : []), [
    courseId,
    draft,
    ready,
  ]);

  const max = maxPreferencesFor(courseId);
  const selectedCount = count(courseId);
  const atMax = selectedCount >= max;
  const courseLabel = `${course.code} · ${t(course.nameKey)}`;

  const appDraft = getDraft(courseId);
  void appDraft; // keeps the hook wired for future review screen

  return (
    <PageShell
      eyebrow={t("apply.hub.title")}
      title={courseLabel}
      backHref="/apply"
    >
      <StepProgress step={1} />

      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
          {t("apply.select.title", { course: course.code })}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("apply.select.subtitle")}
        </p>
      </section>

      {course.combinationBased ? (
        <section className="mt-4 space-y-2">
          <CombinationsExplainer />
        </section>
      ) : null}

      <section className="mt-4">
        <MaxPreferenceGuidanceBlock
          courseLabel={course.code}
          max={max}
          current={selectedCount}
        />
        <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
          {t("apply.select.counter", { n: selectedCount, max })}
          {atMax ? " · " : ""}
          {atMax ? t("apply.select.maxReached") : ""}
        </p>
      </section>

      {candidates.length === 0 ? (
        <section className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-5 text-center">
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("apply.select.empty")}
          </p>
          <Link
            href="/discover"
            className="mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
          >
            {t("cta.browseMore")}
          </Link>
        </section>
      ) : (
        <section className="mt-4 space-y-3">
          {candidates.map((candidate) => (
            <PreferenceCandidateCard
              key={candidate.id}
              candidate={candidate}
              selected={has(courseId, candidate.id)}
              canAdd={!atMax}
              onToggle={() => toggle(courseId, candidate.id)}
            />
          ))}
        </section>
      )}

      <section className="mt-5 text-center">
        <Link
          href="/discover"
          className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("apply.select.browseDiscover")}
        </Link>
      </section>

      <div className="sticky bottom-0 -mx-4 mt-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <PrimaryButton
          type="button"
          onClick={() => router.push(`/apply/${courseId}/rank`)}
          disabled={selectedCount === 0}
        >
          {t("cta.continueToRanking")}
        </PrimaryButton>
        <p className="mt-2 text-center text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {selectedCount === 0
            ? t("apply.select.noneSelectedHint")
            : t("apply.select.counter", { n: selectedCount, max })}
        </p>
      </div>
    </PageShell>
  );
}
