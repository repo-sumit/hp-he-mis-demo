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
import { useApplications } from "../../../_components/apply/applications-provider";
import { buildCandidates, type PreferenceCandidate } from "../../../_components/apply/candidates";
import { maxPreferencesFor } from "../../../_components/apply/rules";
import { StepProgress } from "../../../_components/apply/step-progress";
import { MaxPreferenceGuidanceBlock } from "../../../_components/apply/max-preference-guidance-block";
import { RankListItem } from "../../../_components/apply/rank-list-item";

type Params = { courseId: string };

export default function RankPage({ params }: { params: Promise<Params> }) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const { draft } = useProfile();
  const router = useRouter();

  const course = getCourse(courseId);
  if (!course) notFound();

  const ready = hasEnoughProfile(draft);
  const { getDraft, moveUp, moveDown, remove, count } = useApplications();

  const candidatesById = useMemo<Record<string, PreferenceCandidate>>(() => {
    if (!ready) return {};
    const map: Record<string, PreferenceCandidate> = {};
    for (const c of buildCandidates(courseId, draft)) map[c.id] = c;
    return map;
  }, [courseId, draft, ready]);

  const draftState = getDraft(courseId);
  const selected: PreferenceCandidate[] = draftState.itemIds
    .map((id) => candidatesById[id])
    .filter((c): c is PreferenceCandidate => Boolean(c));

  const max = maxPreferencesFor(courseId);
  const selectedCount = count(courseId);
  const courseLabel = `${course.code} · ${t(course.nameKey)}`;

  return (
    <PageShell
      eyebrow={t("apply.hub.title")}
      title={courseLabel}
      backHref={`/apply/${courseId}/preferences`}
    >
      <StepProgress step={2} />

      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
          {t("apply.rank.title", { course: course.code })}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("apply.rank.subtitle")}
        </p>
      </section>

      <section className="mt-4">
        <MaxPreferenceGuidanceBlock
          courseLabel={course.code}
          max={max}
          current={selectedCount}
        />
      </section>

      {selected.length === 0 ? (
        <section className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-5 text-center">
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("apply.rank.empty")}
          </p>
          <Link
            href={`/apply/${courseId}/preferences`}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-primary)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)]"
          >
            {t("cta.add")}
          </Link>
        </section>
      ) : (
        <section className="mt-4 space-y-3">
          {selected.map((candidate, idx) => (
            <RankListItem
              key={candidate.id}
              rank={idx + 1}
              candidate={candidate}
              canUp={idx > 0}
              canDown={idx < selected.length - 1}
              onUp={() => moveUp(courseId, candidate.id)}
              onDown={() => moveDown(courseId, candidate.id)}
              onRemove={() => remove(courseId, candidate.id)}
            />
          ))}
        </section>
      )}

      <section className="mt-5 text-center">
        <Link
          href={`/apply/${courseId}/preferences`}
          className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("cta.addMore")}
        </Link>
      </section>

      <div className="sticky bottom-0 -mx-4 mt-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <PrimaryButton
          type="button"
          onClick={() => router.push(`/apply/${courseId}/review`)}
          disabled={selectedCount === 0}
        >
          {t("cta.continueToDeclaration")}
        </PrimaryButton>
        <p className="mt-2 text-center text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {t("apply.rank.saveHint")}
        </p>
      </div>
    </PageShell>
  );
}
