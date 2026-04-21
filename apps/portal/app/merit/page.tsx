"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { t as translate } from "@hp-mis/i18n";
import { Card, CardBody, CardTitle, cn } from "@hp-mis/ui";
import {
  MERIT_STORAGE_KEY,
  computeMeritRanks,
  loadMeritMap,
  persistMeritMap,
  type MeritCandidate,
  type MeritOverlay,
  type MeritOverlayMap,
} from "@hp-mis/shared-mock";
import { PortalFrame } from "../_components/portal-frame";
import { SummaryStrip } from "../_components/admin/summary-strip";
import { ReviewSectionCard } from "../_components/admin/review-section-card";
import { formatRelative, formatTimestamp } from "../_components/admin/format";
import {
  MOCK_APPLICATIONS,
  type MockApplication,
} from "../_components/data/mock-applications";
import {
  useScrutiny,
} from "../_components/data/scrutiny-provider";
import { useSession } from "../_components/data/session-provider";

// English-only portal surface per the 2-app strategy — the role-gate, page
// copy, and tables all render from the "en" bundle.
const t = (key: string, vars?: Record<string, string | number>) =>
  translate("en", key, vars);

type CourseBucket = {
  courseId: string;
  courseCode: string;
  verified: MockApplication[];
  pending: number;
  rejected: number;
};

function bucketApplications(
  effectiveStatus: (id: string) => string,
): CourseBucket[] {
  const byCourse = new Map<string, CourseBucket>();

  for (const app of MOCK_APPLICATIONS) {
    const status = effectiveStatus(app.id);
    const bucket = byCourse.get(app.courseId) ?? {
      courseId: app.courseId,
      courseCode: app.courseCode,
      verified: [],
      pending: 0,
      rejected: 0,
    };
    if (status === "verified" || status === "conditional") {
      bucket.verified.push(app);
    } else if (status === "rejected") {
      bucket.rejected += 1;
    } else {
      bucket.pending += 1;
    }
    byCourse.set(app.courseId, bucket);
  }

  // Sort alphabetically by course code for stable rendering.
  return Array.from(byCourse.values()).sort((a, b) =>
    a.courseCode.localeCompare(b.courseCode),
  );
}

export default function MeritCompilationPage() {
  const { session, hydrated: sessionHydrated } = useSession();
  const { effectiveStatus, hydrated: scrutinyHydrated } = useScrutiny();

  const [map, setMap] = useState<MeritOverlayMap>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Hydration read from localStorage — synchronous setState here is the
    // intended pattern, matching ScrutinyProvider. No cascading render since
    // the value is read once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMap(loadMeritMap());
  }, []);

  // Keep in sync if other tabs publish merit (simple storage-event hook).
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === MERIT_STORAGE_KEY) setMap(loadMeritMap());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const buckets = useMemo(() => {
    if (!scrutinyHydrated) return [];
    return bucketApplications(effectiveStatus);
  }, [scrutinyHydrated, effectiveStatus]);

  const counts = useMemo(() => {
    let verified = 0;
    let pending = 0;
    let published = 0;
    for (const b of buckets) {
      verified += b.verified.length;
      pending += b.pending;
      if (map[b.courseId]?.publishedAt) published += 1;
    }
    return { verified, pending, published, courses: buckets.length };
  }, [buckets, map]);

  const publish = useCallback(
    (bucket: CourseBucket) => {
      if (bucket.verified.length === 0) return;
      const candidates: MeritCandidate[] = bucket.verified.map((app) => ({
        applicationId: app.id,
        bofPercentage: app.studentBofPercentage,
        dob: app.studentDob,
        category: app.studentCategory,
        studentName: app.studentName,
        courseCode: app.courseCode,
        firstPreferenceCollegeId:
          app.preferences[0]?.collegeId ?? app.collegeId,
      }));
      const ranks = computeMeritRanks(candidates);
      const prev = map[bucket.courseId];
      const next: MeritOverlay = {
        courseId: bucket.courseId,
        publishedAt: Date.now(),
        publishedBy: session.name,
        ranks,
        publishVersion: (prev?.publishVersion ?? 0) + 1,
      };
      const updated = { ...map, [bucket.courseId]: next };
      setMap(updated);
      persistMeritMap(updated);
      setToast(t("portal.merit.toastPublished", { course: bucket.courseCode }));
    },
    [map, session.name],
  );

  // Non-state-admin roles get a polite block rather than a 403 — lets the
  // demo presenter show the page from the State Admin role and move on.
  if (sessionHydrated && session.role !== "state_admin") {
    return (
      <PortalFrame active="merit" eyebrow={t("portal.merit.eyebrow")} title={t("portal.merit.pageTitle")}>
        <Card>
          <CardTitle>Role required</CardTitle>
          <CardBody>{t("portal.merit.roleGate")}</CardBody>
        </Card>
      </PortalFrame>
    );
  }

  return (
    <PortalFrame
      active="merit"
      eyebrow={t("portal.merit.eyebrow")}
      title={t("portal.merit.pageTitle")}
    >
      <p className="max-w-3xl text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("portal.merit.lead")}
      </p>

      <div className="mt-5">
        <SummaryStrip
          tiles={[
            { label: "Courses in cycle", value: counts.courses },
            { label: "Verified applications", value: counts.verified, tone: "success" },
            { label: "Awaiting scrutiny", value: counts.pending, tone: "brand" },
            { label: "Merit published", value: counts.published, tone: "success" },
          ]}
        />
      </div>

      <div className="mt-6 space-y-4">
        {buckets.map((bucket) => {
          const overlay = map[bucket.courseId];
          const canPublish = bucket.verified.length > 0;
          return (
            <ReviewSectionCard
              key={bucket.courseId}
              title={bucket.courseCode}
              description={buildBucketDescription(bucket)}
              action={
                <button
                  type="button"
                  onClick={() => publish(bucket)}
                  disabled={!canPublish}
                  className={cn(
                    "inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)]",
                    canPublish
                      ? "bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
                      : "cursor-not-allowed bg-[var(--color-background-muted)] text-[var(--color-text-tertiary)]",
                  )}
                >
                  {overlay
                    ? t("portal.merit.republishCta", { v: overlay.publishVersion + 1 })
                    : t("portal.merit.publishCta")}
                </button>
              }
            >
              {overlay ? (
                <PublishedBlock overlay={overlay} />
              ) : !canPublish ? (
                <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  {t("portal.merit.noVerified")}
                </p>
              ) : (
                <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  {bucket.verified.length === 1
                    ? `1 verified application ready to rank.`
                    : `${bucket.verified.length} verified applications ready to rank.`}
                </p>
              )}
            </ReviewSectionCard>
          );
        })}
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] px-4 py-2 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-inverse)] shadow-[var(--shadow-lg)]"
        >
          ✓ {toast}
        </div>
      ) : null}
    </PortalFrame>
  );
}

function buildBucketDescription(bucket: CourseBucket): string {
  const parts: string[] = [];
  parts.push(t("portal.merit.cardVerified", { n: bucket.verified.length }));
  if (bucket.pending > 0) {
    parts.push(t("portal.merit.cardPending", { n: bucket.pending }));
  }
  if (bucket.rejected > 0) {
    parts.push(t("portal.merit.cardRejected", { n: bucket.rejected }));
  }
  return parts.join(" · ");
}

function PublishedBlock({ overlay }: { overlay: MeritOverlay }) {
  return (
    <div>
      <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        {t("portal.merit.publishedAt", { when: formatRelative(overlay.publishedAt) })}
        {" · "}
        {t("portal.merit.publishedBy", { actor: overlay.publishedBy })}
        {" · "}
        <span title={formatTimestamp(overlay.publishedAt)}>
          v{overlay.publishVersion}
        </span>
      </p>

      <div className="mt-3 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full text-left text-[var(--text-sm)]">
          <thead className="bg-[var(--color-background-subtle)] text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            <tr>
              <th className="px-3 py-2 font-[var(--weight-semibold)]">
                {t("portal.merit.rankHeader")}
              </th>
              <th className="px-3 py-2 font-[var(--weight-semibold)]">
                {t("portal.merit.studentHeader")}
              </th>
              <th className="px-3 py-2 font-[var(--weight-semibold)]">
                {t("portal.merit.bofHeader")}
              </th>
              <th className="px-3 py-2 font-[var(--weight-semibold)]">
                {t("portal.merit.categoryHeader")}
              </th>
            </tr>
          </thead>
          <tbody>
            {overlay.ranks.map((entry) => (
              <tr
                key={entry.applicationId}
                className="border-t border-[var(--color-border)]"
              >
                <td className="px-3 py-2 font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                  {entry.rank}
                </td>
                <td className="px-3 py-2 text-[var(--color-text-primary)]">
                  <div>{entry.studentName}</div>
                  <div className="font-mono text-[10px] text-[var(--color-text-tertiary)]">
                    {entry.applicationId}
                  </div>
                </td>
                <td className="px-3 py-2 text-[var(--color-text-primary)]">
                  {entry.bofPercentage.toFixed(2)}%
                </td>
                <td className="px-3 py-2">
                  <span className="rounded-[var(--radius-pill)] bg-[var(--color-background-brand-subtle)] px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase text-[var(--color-text-brand)]">
                    {entry.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        {t("portal.merit.previewNote")}
      </p>
    </div>
  );
}
