"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { PageShell } from "../../../_components/page-shell";
import { BottomTabBar } from "../../../_components/bottom-tab-bar";
import { useLocale } from "../../../_components/locale-provider";
import { useApplications } from "../../../_components/apply/applications-provider";
import { getCourse } from "../../../_components/discover/mock-data";
import { useScrutinyBridge } from "../../../_components/scrutiny-bridge/scrutiny-bridge-provider";
import { StudentIssueListItem } from "../../../_components/scrutiny-bridge/student-issue-list-item";

type Params = { courseId: string };

export default function ApplicationIssuesPage({ params }: { params: Promise<Params> }) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const { applications } = useApplications();
  const bridge = useScrutinyBridge();

  const course = getCourse(courseId);
  if (!course) notFound();

  const draft = applications[courseId];
  const appNumber = draft?.applicationNumber;

  const discrepancies = useMemo(
    () => (appNumber ? bridge.byApplication(appNumber) : []),
    [bridge, appNumber],
  );

  const courseLabel = `${course.code} · ${t(course.nameKey)}`;

  return (
    <PageShell
      eyebrow={t("nav.myApplications")}
      title={courseLabel}
      backHref="/applications"
      footer={<BottomTabBar />}
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
          {t("issue.list.title")}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("issue.list.subtitle", { course: course.code })}
        </p>
        {appNumber ? (
          <p className="mt-2 font-mono text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
            {appNumber}
          </p>
        ) : null}
      </section>

      {discrepancies.length === 0 ? (
        <section className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-5 text-center">
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("issue.list.empty")}
          </p>
          <Link
            href={appNumber ? `/apply/${courseId}/submitted` : "/applications"}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
          >
            {t("cta.backToApply")}
          </Link>
        </section>
      ) : (
        <section className="mt-5 space-y-3 pb-4">
          {discrepancies.map((disc) => (
            <StudentIssueListItem key={disc.id} disc={disc} />
          ))}
        </section>
      )}
    </PageShell>
  );
}
