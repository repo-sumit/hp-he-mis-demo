"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { PageShell } from "../../../_components/page-shell";
import { PrimaryLink } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { useProfile } from "../../../_components/profile/profile-provider";
import { useDocuments } from "../../../_components/documents/documents-provider";
import { hasEnoughProfile } from "../../../_components/discover/evaluate";
import { getCourse } from "../../../_components/discover/mock-data";
import { useApplications } from "../../../_components/apply/applications-provider";
import { buildCandidates, candidateCollegeName, candidateDistrict } from "../../../_components/apply/candidates";
import { maxPreferencesFor } from "../../../_components/apply/rules";
import { computeReadiness } from "../../../_components/apply/readiness";
import { ReviewSectionCard, SummaryRow } from "../../../_components/apply/review-section-card";
import { ReadinessChecklist } from "../../../_components/apply/readiness-checklist";
import { DocumentStatusBadge } from "../../../_components/documents/document-status-badge";
import { EligibilityStateBadge } from "../../../_components/discover/eligibility-state-badge";

type Params = { courseId: string };

export default function ReviewPage({ params }: { params: Promise<Params> }) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const { draft } = useProfile();
  const { documents, getEntry } = useDocuments();
  const { getDraft, isSubmitted } = useApplications();

  const course = getCourse(courseId);
  if (!course) notFound();

  const appDraft = getDraft(courseId);
  const ready = hasEnoughProfile(draft);

  const candidatesById = useMemo<Record<string, ReturnType<typeof buildCandidates>[number]>>(() => {
    if (!ready) return {};
    const map: Record<string, ReturnType<typeof buildCandidates>[number]> = {};
    for (const c of buildCandidates(courseId, draft)) map[c.id] = c;
    return map;
  }, [courseId, draft, ready]);

  const selectedCandidates = appDraft.itemIds
    .map((id) => candidatesById[id])
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const readiness = useMemo(
    () => computeReadiness(draft, documents, appDraft.itemIds.length),
    [draft, documents, appDraft.itemIds.length],
  );

  const courseLabel = `${course.code} · ${t(course.nameKey)}`;
  const max = maxPreferencesFor(courseId);
  const alreadySubmitted = isSubmitted(courseId);

  // Map profile draft values into display-friendly strings.
  const streamLabel = draft.stream ? t(`field.stream.options.${draft.stream}`) : "";
  const boardLabel = draft.board ? t(`field.board.options.${draft.board}`) : "";
  const categoryLabel = draft.category ? t(`field.category.options.${draft.category}`) : "";
  const resultLabel = draft.resultStatus
    ? t(`field.resultStatus.options.${draft.resultStatus}`)
    : "";
  const claimsLabel = draft.claims
    .map((c) => t(`field.claims.options.${c}`))
    .join(", ");

  return (
    <PageShell
      eyebrow={t("apply.hub.title")}
      title={courseLabel}
      backHref={`/apply/${courseId}/rank`}
    >
      <section>
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("review.applicationType", { code: course.code, name: t(course.nameKey) })}
        </p>
        <h2 className="mt-0.5 text-[var(--text-xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
          {t("review.title", { course: course.code })}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("review.subtitle")}
        </p>
      </section>

      <section className="mt-4">
        <ReadinessChecklist readiness={readiness} courseId={courseId} />
      </section>

      <section className="mt-5 space-y-3">
        <ReviewSectionCard
          title={t("review.sections.profile")}
          editHref="/profile/step/1"
        >
          <dl>
            <SummaryRow label={t("review.rows.fullName")} value={draft.fullName} />
            <SummaryRow label={t("review.rows.dob")} value={draft.dob} />
            <SummaryRow label={t("review.rows.mobile")} value={draft.mobile} />
            <SummaryRow label={t("review.rows.email")} value={draft.email} />
            <SummaryRow
              label={t("review.rows.permanentAddress")}
              value={draft.permanentAddress}
            />
            <SummaryRow label={t("review.rows.district")} value={draft.district} />
            <SummaryRow label={t("review.rows.pincode")} value={draft.pincode} />
          </dl>
        </ReviewSectionCard>

        <ReviewSectionCard
          title={t("review.sections.academic")}
          editHref="/profile/step/3"
        >
          <dl>
            <SummaryRow label={t("review.rows.board")} value={boardLabel} />
            <SummaryRow label={t("review.rows.stream")} value={streamLabel} />
            <SummaryRow
              label={t("review.rows.bof")}
              value={draft.bofPercentage ? `${draft.bofPercentage}%` : ""}
            />
            <SummaryRow label={t("review.rows.result")} value={resultLabel} />
          </dl>
        </ReviewSectionCard>

        <ReviewSectionCard
          title={t("review.sections.claims")}
          editHref="/profile/step/4"
        >
          <dl>
            <SummaryRow label={t("review.rows.category")} value={categoryLabel} />
            <SummaryRow label={t("review.rows.claims")} value={claimsLabel} />
            <SummaryRow
              label={t("review.rows.singleGirlChild")}
              value={draft.isSingleGirlChild ? t("common.yes") : t("common.no")}
            />
            <SummaryRow
              label={t("review.rows.pwd")}
              value={draft.isPwd ? t("common.yes") : t("common.no")}
            />
          </dl>
        </ReviewSectionCard>

        <ReviewSectionCard
          title={t("review.sections.documents")}
          editHref="/documents"
        >
          <p className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
            {t("review.documentsSummary", {
              uploaded: readiness.documents.uploaded,
              required: readiness.documents.required,
              verified: readiness.documents.verified,
            })}
          </p>
          {readiness.documents.requiredItems.length === 0 ? (
            <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              {t("review.documentsEmpty")}
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {readiness.documents.requiredItems.map((item) => (
                <li
                  key={item.rule.code}
                  className="flex items-center justify-between gap-2 text-[var(--text-sm)]"
                >
                  <span className="text-[var(--color-text-primary)]">
                    {t(`document.name.${item.rule.code}`)}
                  </span>
                  <DocumentStatusBadge status={getEntry(item.rule.code).status} />
                </li>
              ))}
            </ul>
          )}
        </ReviewSectionCard>

        <ReviewSectionCard
          title={t("review.sections.preferences")}
          editHref={`/apply/${courseId}/rank`}
        >
          <p className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
            {t("review.preferencesSummary", { n: selectedCandidates.length, max })}
          </p>
          {selectedCandidates.length === 0 ? (
            <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              {t("review.preferencesEmpty")}
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {selectedCandidates.map((candidate, idx) => {
                const combo = candidate.combination;
                const heading = combo
                  ? t("apply.candidate.combinationLabel", {
                      a: combo.subjectA,
                      b: combo.subjectB,
                    })
                  : candidateCollegeName(candidate);
                return (
                  <li key={candidate.id} className="flex items-start gap-2">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] text-[var(--text-xs)] font-[var(--weight-bold)] text-[var(--color-text-inverse)]">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                        {heading}
                      </p>
                      {combo ? (
                        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                          {candidateCollegeName(candidate)} · {candidateDistrict(candidate)}
                        </p>
                      ) : (
                        <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                          {candidateDistrict(candidate)}
                        </p>
                      )}
                      <div className="mt-1">
                        <EligibilityStateBadge state={candidate.state} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </ReviewSectionCard>
      </section>

      {alreadySubmitted ? (
        <p className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-status-info-bg)] px-3 py-2 text-center text-[var(--text-xs)] text-[var(--color-status-info-fg)]">
          <Link
            href={`/apply/${courseId}/submitted`}
            className="font-[var(--weight-semibold)] underline"
          >
            {t("cta.viewUpload")}
          </Link>
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-4 mt-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <PrimaryLink
          href={`/apply/${courseId}/declaration`}
          className={readiness.canSubmit && !alreadySubmitted ? "" : "!pointer-events-none !opacity-60"}
        >
          {t("cta.continueToDeclaration")}
        </PrimaryLink>
        <p className="mt-2 text-center text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {alreadySubmitted
            ? t("apply.myApps.status.submitted")
            : readiness.canSubmit
              ? t("readiness.allGoodHint")
              : t("readiness.blockedHint")}
        </p>
      </div>
    </PageShell>
  );
}
