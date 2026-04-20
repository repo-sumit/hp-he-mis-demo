"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PageShell } from "../_components/page-shell";
import { useLocale } from "../_components/locale-provider";
import { useProfile } from "../_components/profile/profile-provider";
import { hasEnoughProfile } from "../_components/discover/evaluate";
import { COURSES } from "../_components/discover/mock-data";
import { applicableCourseCount } from "../_components/apply/candidates";
import { useApplications } from "../_components/apply/applications-provider";
import { ApplicationTypeCard } from "../_components/apply/application-type-card";
import { SeparateApplicationExplainer } from "../_components/apply/separate-application-explainer";

export default function ApplyHubPage() {
  const { t } = useLocale();
  const { draft } = useProfile();
  const { count } = useApplications();

  const ready = hasEnoughProfile(draft);

  const cards = useMemo(() => {
    if (!ready) return [];
    return COURSES.map((course) => ({
      courseId: course.id,
      optionCount: applicableCourseCount(course.id, draft),
      selectedCount: count(course.id),
    }));
  }, [draft, count, ready]);

  const applicable = cards.filter((c) => c.optionCount > 0);

  if (!ready || applicable.length === 0) {
    return (
      <PageShell
        eyebrow={t("apply.hub.title")}
        title={t("app.name")}
        backHref="/dashboard"
      >
        <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-5 text-center">
          <p aria-hidden="true" className="text-3xl">
            📝
          </p>
          <h2 className="mt-2 text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t("apply.hub.empty.title")}
          </h2>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("apply.hub.empty.body")}
          </p>
          <Link
            href="/discover"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
          >
            {t("apply.hub.empty.cta")}
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={t("apply.hub.title")}
      title={t("app.name")}
      backHref="/dashboard"
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
          {t("apply.hub.title")}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("apply.hub.subtitle")}
        </p>
      </section>

      <section className="mt-4">
        <SeparateApplicationExplainer />
      </section>

      <section className="mt-4 space-y-3">
        {applicable.map((card) => (
          <ApplicationTypeCard
            key={card.courseId}
            courseId={card.courseId}
            optionCount={card.optionCount}
            selectedCount={card.selectedCount}
          />
        ))}
      </section>

      <section className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-3 text-center">
        <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {t("apply.fees.note")}
        </p>
        <Link
          href="/discover"
          className="mt-2 inline-flex text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("apply.hub.browseMore")}
        </Link>
      </section>
    </PageShell>
  );
}
