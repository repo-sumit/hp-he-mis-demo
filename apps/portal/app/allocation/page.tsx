"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { t as translate } from "@hp-mis/i18n";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Table,
  TableShell,
  TBody,
  TD,
  TH,
  THead,
  TR,
  cn,
  useToast,
} from "@hp-mis/ui";
import {
  ALLOCATION_STORAGE_KEY,
  MERIT_STORAGE_KEY,
  isMeritPublished,
  loadAllocationMap,
  loadMeritMap,
  persistAllocationMap,
  runAllocation,
  type AllocationInputs,
  type AllocationOverlay,
  type AllocationOverlayMap,
  type AllotmentResponse,
  type MeritOverlayMap,
} from "@hp-mis/shared-mock";
import { PortalFrame } from "../_components/portal-frame";
import { SummaryStrip } from "../_components/admin/summary-strip";
import { ReviewSectionCard } from "../_components/admin/review-section-card";
import { formatRelative, formatTimestamp } from "../_components/admin/format";
import {
  MOCK_APPLICATIONS,
  type AppPreference,
  type MockApplication,
} from "../_components/data/mock-applications";
import { useSession } from "../_components/data/session-provider";

// English-only portal surface.
const t = (key: string, vars?: Record<string, string | number>) =>
  translate("en", key, vars);

interface CourseRow {
  courseId: string;
  courseCode: string;
  /** All apps on this course (used for seat inputs + fee lookup). */
  apps: MockApplication[];
}

function buildCourseRows(): CourseRow[] {
  const byCourse = new Map<string, CourseRow>();
  for (const app of MOCK_APPLICATIONS) {
    const row = byCourse.get(app.courseId) ?? {
      courseId: app.courseId,
      courseCode: app.courseCode,
      apps: [],
    };
    row.apps.push(app);
    byCourse.set(app.courseId, row);
  }
  return Array.from(byCourse.values()).sort((a, b) =>
    a.courseCode.localeCompare(b.courseCode),
  );
}

function combinationLabel(pref: AppPreference): string | undefined {
  if (pref.subjectA && pref.subjectB) return `${pref.subjectA} + ${pref.subjectB}`;
  return undefined;
}

/**
 * Builds the AllocationInputs for one course by stitching together the merit
 * list with seat + college data pulled off the seeded application preferences.
 * Vacant seats are tallied per college across every preference that names
 * that college, taking the max vacantSeats value (the seed already reflects
 * current vacancies; we don't want to double-count when an app lists the
 * same college twice under different combinations).
 */
function buildInputs(
  row: CourseRow,
  meritMap: MeritOverlayMap,
): AllocationInputs | null {
  const merit = meritMap[row.courseId];
  if (!merit) return null;

  const vacantByCollege: Record<string, number> = {};
  const collegeNamesById: Record<string, string> = {};
  const preferencesById: Record<
    string,
    Array<{ collegeId: string; combinationLabel?: string }>
  > = {};

  for (const app of row.apps) {
    const prefList: Array<{ collegeId: string; combinationLabel?: string }> = [];
    for (const pref of app.preferences) {
      // Track the highest vacant-seat number we've seen for this college on
      // this course. Two preferences under the same college point at the
      // same seat pool; using the max is the right aggregation.
      const existing = vacantByCollege[pref.collegeId] ?? 0;
      if (pref.vacantSeats > existing) {
        vacantByCollege[pref.collegeId] = pref.vacantSeats;
      }
      collegeNamesById[pref.collegeId] = pref.collegeName;
      prefList.push({
        collegeId: pref.collegeId,
        combinationLabel: combinationLabel(pref),
      });
    }
    preferencesById[app.id] = prefList;
  }

  // Fee is uniform per course in the seed data — pull the first app's fee.
  const feeAmount = row.apps[0]?.applicationFee ?? 50;

  return {
    courseId: row.courseId,
    courseCode: row.courseCode,
    merit: merit.ranks,
    vacantByCollege,
    collegeNamesById,
    preferencesById,
    feeAmount,
  };
}

const RESPONSE_TONE: Record<
  AllotmentResponse,
  { className: string; key: string }
> = {
  pending: {
    className:
      "bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]",
    key: "portal.allocation.responsePending",
  },
  freeze: {
    className:
      "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
    key: "portal.allocation.responseFreeze",
  },
  float: {
    className:
      "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]",
    key: "portal.allocation.responseFloat",
  },
  decline: {
    className:
      "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
    key: "portal.allocation.responseDecline",
  },
  auto_cancelled: {
    className:
      "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
    key: "portal.allocation.responseAutoCancelled",
  },
  fee_paid: {
    className:
      "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
    key: "portal.allocation.responseFeePaid",
  },
  admission_confirmed: {
    className:
      "bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]",
    key: "portal.allocation.responseConfirmed",
  },
};

export default function SeatAllocationPage() {
  const { session, hydrated: sessionHydrated } = useSession();

  const [meritMap, setMeritMap] = useState<MeritOverlayMap>({});
  const [allocationMap, setAllocationMap] = useState<AllocationOverlayMap>({});
  const { toast } = useToast();

  useEffect(() => {
    // Hydration read from localStorage — synchronous setState here is the
    // intended pattern, matching ScrutinyProvider. No cascading render since
    // the values are read once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeritMap(loadMeritMap());
    setAllocationMap(loadAllocationMap());
  }, []);

  // Cross-tab sync: if the State Admin publishes merit in another tab, this
  // page picks it up and the "merit required" gate flips automatically.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === MERIT_STORAGE_KEY) setMeritMap(loadMeritMap());
      if (e.key === ALLOCATION_STORAGE_KEY) setAllocationMap(loadAllocationMap());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const rows = useMemo(() => buildCourseRows(), []);

  const counts = useMemo(() => {
    let meritPublished = 0;
    let runs = 0;
    let seatsOffered = 0;
    for (const r of rows) {
      if (meritMap[r.courseId]) meritPublished += 1;
      const alloc = allocationMap[r.courseId];
      if (alloc) {
        runs += 1;
        seatsOffered += alloc.seatsOffered;
      }
    }
    return { courses: rows.length, meritPublished, runs, seatsOffered };
  }, [rows, meritMap, allocationMap]);

  const run = useCallback(
    (row: CourseRow) => {
      const inputs = buildInputs(row, meritMap);
      if (!inputs) return;
      const existing = allocationMap[row.courseId];
      const nextRound = existing ? existing.roundNumber + 1 : 1;
      const overlay = runAllocation(inputs, Date.now(), session.name, nextRound);
      const updated = { ...allocationMap, [row.courseId]: overlay };
      setAllocationMap(updated);
      persistAllocationMap(updated);
      toast(t("portal.allocation.toastRun", { course: row.courseCode }), {
        tone: "success",
      });
    },
    [meritMap, allocationMap, session.name, toast],
  );

  if (sessionHydrated && session.role !== "state_admin") {
    return (
      <PortalFrame
        active="allocation"
        eyebrow={t("portal.allocation.eyebrow")}
        title={t("portal.allocation.pageTitle")}
      >
        <Card>
          <CardTitle>Role required</CardTitle>
          <CardBody>{t("portal.allocation.roleGate")}</CardBody>
        </Card>
      </PortalFrame>
    );
  }

  return (
    <PortalFrame
      active="allocation"
      eyebrow={t("portal.allocation.eyebrow")}
      title={t("portal.allocation.pageTitle")}
    >
      <p className="max-w-3xl text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("portal.allocation.lead")}
      </p>

      <div className="mt-5">
        <SummaryStrip
          tiles={[
            { label: "Courses in cycle", value: counts.courses },
            { label: "Merit published", value: counts.meritPublished, tone: "success" },
            { label: "Allocation runs", value: counts.runs, tone: "brand" },
            { label: "Seats offered", value: counts.seatsOffered, tone: "success" },
          ]}
        />
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((row) => {
          const meritReady = isMeritPublished(meritMap, row.courseId);
          const overlay = allocationMap[row.courseId];
          return (
            <ReviewSectionCard
              key={row.courseId}
              title={row.courseCode}
              description={
                meritReady
                  ? overlay
                    ? t("portal.allocation.runAt", {
                        n: overlay.roundNumber,
                        when: formatRelative(overlay.runAt),
                      })
                    : `${meritMap[row.courseId]?.ranks.length ?? 0} ranked candidates`
                  : t("portal.allocation.noMerit")
              }
              action={
                <Button
                  variant="primary"
                  onClick={() => run(row)}
                  disabled={!meritReady}
                >
                  {overlay
                    ? t("portal.allocation.rerunCta")
                    : t("portal.allocation.runCta")}
                </Button>
              }
            >
              {!meritReady ? (
                <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  {t("portal.allocation.meritRequired")}
                </p>
              ) : overlay ? (
                <AllocationResultBlock overlay={overlay} />
              ) : (
                <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  Ready to run. Merit list published{" "}
                  {formatRelative(meritMap[row.courseId]!.publishedAt)}.
                </p>
              )}
            </ReviewSectionCard>
          );
        })}
      </div>

    </PortalFrame>
  );
}

function AllocationResultBlock({ overlay }: { overlay: AllocationOverlay }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        <span title={formatTimestamp(overlay.runAt)}>
          {t("portal.allocation.runAt", {
            n: overlay.roundNumber,
            when: formatRelative(overlay.runAt),
          })}
        </span>
        <span>· {overlay.runBy}</span>
        <Badge tone="success">
          {t("portal.allocation.seatsOffered", { n: overlay.seatsOffered })}
        </Badge>
        <Badge tone="neutral">
          {t("portal.allocation.seatsVacant", { n: overlay.seatsVacantAfterRound })}
        </Badge>
      </div>

      <TableShell className="mt-3">
        <Table>
          <THead>
            <TR>
              <TH>{t("portal.allocation.rankHeader")}</TH>
              <TH>{t("portal.allocation.studentHeader")}</TH>
              <TH>{t("portal.allocation.offerHeader")}</TH>
              <TH>{t("portal.allocation.responseHeader")}</TH>
            </TR>
          </THead>
          <TBody>
            {overlay.allocations.map((entry) => {
              const tone = RESPONSE_TONE[entry.status];
              return (
                <TR key={entry.applicationId}>
                  <TD className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {entry.rank}
                  </TD>
                  <TD>
                    <div>{entry.studentName}</div>
                    <div className="font-mono text-[var(--text-2xs)] text-[var(--color-text-tertiary)]">
                      {entry.applicationId}
                    </div>
                  </TD>
                  <TD>
                    <div>{entry.offer.collegeName}</div>
                    {entry.offer.combinationLabel ? (
                      <div className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                        {entry.offer.combinationLabel}
                      </div>
                    ) : null}
                    <div className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                      ₹{entry.offer.feeAmount}
                    </div>
                  </TD>
                  <TD>
                    <span
                      className={cn(
                        "inline-flex rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)]",
                        tone.className,
                      )}
                    >
                      {t(tone.key)}
                    </span>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </TableShell>
    </div>
  );
}
