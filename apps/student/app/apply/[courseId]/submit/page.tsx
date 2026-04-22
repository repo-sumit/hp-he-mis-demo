"use client";

import { use, useEffect, useRef } from "react";
import { notFound, useRouter } from "next/navigation";
import { PageShell } from "../../../_components/page-shell";
import { useLocale } from "../../../_components/locale-provider";
import { getCourse } from "../../../_components/discover/mock-data";
import { useApplications } from "../../../_components/apply/applications-provider";
import { SubmissionStatusCard } from "../../../_components/apply/submission-status-card";

type Params = { courseId: string };

/**
 * Simulated submit handoff. Waits for the provider to hydrate, fires `submit()`
 * once to mint an application number, then replaces the history entry with
 * /submitted so hitting Back doesn't re-enter the submit flow.
 */
export default function SubmitPage({ params }: { params: Promise<Params> }) {
  const { courseId } = use(params);
  const { t } = useLocale();
  const router = useRouter();
  const { hydrated, getDraft, submit } = useApplications();
  const fired = useRef(false);

  const course = getCourse(courseId);
  if (!course) notFound();

  const courseLabel = `${course.code} · ${t(course.nameKey)}`;

  useEffect(() => {
    if (!hydrated || fired.current) return;
    fired.current = true;

    const current = getDraft(courseId);
    // Already submitted — skip straight through.
    if (current.status === "submitted") {
      router.replace(`/apply/${courseId}/submitted`);
      return;
    }
    // Nothing to submit — send the student back to ranking.
    if (current.itemIds.length === 0) {
      router.replace(`/apply/${courseId}/preferences`);
      return;
    }

    // Fire the submission and navigate after a short success-card beat.
    // Important: no cleanup `clearTimeout` here. `submit()` mutates the
    // provider state, which re-identifies the `submit` / `getDraft` deps,
    // which retriggers this effect. A cleanup that cancels the timer on
    // re-run would swallow the redirect and leave the user stuck on the
    // "Processing…" screen forever.
    submit(courseId);
    window.setTimeout(() => {
      router.replace(`/apply/${courseId}/submitted`);
    }, 1200);
  }, [hydrated, courseId, getDraft, submit, router]);

  return (
    <PageShell eyebrow={t("apply.hub.title")} title={courseLabel}>
      <div className="mt-6">
        <SubmissionStatusCard />
      </div>
    </PageShell>
  );
}
