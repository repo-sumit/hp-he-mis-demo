"use client";

import { useMemo, useState } from "react";
import {
  getCollegeById,
  HP_DISTRICTS,
  type HPCollegeType,
} from "@hp-mis/fixtures";
import { PortalFrame } from "../_components/portal-frame";
import {
  MOCK_APPLICATIONS,
  type AppBaseStatus,
  type MockApplication,
} from "../_components/data/mock-applications";
import { useScrutiny } from "../_components/data/scrutiny-provider";
import { useSession, type PortalRole } from "../_components/data/session-provider";
import { SummaryStrip } from "../_components/admin/summary-strip";
import {
  EMPTY_FILTERS,
  FilterBar,
  type QueueFilters,
} from "../_components/admin/filter-bar";
import {
  ApplicationQueueTable,
  type QueueRow,
} from "../_components/admin/application-queue-table";

const COLLEGE_TYPE_LABEL: Record<HPCollegeType, string> = {
  government_degree: "Govt degree college",
  government_aided: "Govt-aided",
  private: "Private",
  sanskrit: "Sanskrit",
  autonomous: "Autonomous",
  medical: "Medical",
  pharmacy: "Pharmacy",
  engineering: "Engineering",
  teacher_education: "Teacher education",
  university: "University",
  institute: "Institute",
};

function matches(app: MockApplication, query: string): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  return (
    app.id.toLowerCase().includes(q) ||
    app.studentName.toLowerCase().includes(q) ||
    app.studentEmail.toLowerCase().includes(q) ||
    app.studentRollNumber.toLowerCase().includes(q) ||
    app.collegeName.toLowerCase().includes(q) ||
    app.courseCode.toLowerCase().includes(q)
  );
}

function passesFilters(
  app: MockApplication,
  status: AppBaseStatus,
  discrepancyCount: number,
  filters: QueueFilters,
): boolean {
  if (filters.status !== "all" && status !== filters.status) return false;
  if (filters.districtId !== "all" || filters.collegeType !== "all") {
    const college = getCollegeById(app.collegeId);
    if (filters.districtId !== "all" && college?.district !== filters.districtId) return false;
    if (filters.collegeType !== "all" && college?.type !== filters.collegeType) return false;
  }
  if (filters.collegeId !== "all" && app.collegeId !== filters.collegeId) return false;
  if (filters.courseId !== "all" && app.courseId !== filters.courseId) return false;
  if (filters.category !== "all" && app.studentCategory !== filters.category) return false;
  if (filters.discrepancyPending && discrepancyCount === 0) return false;
  return true;
}

/**
 * Scope the queue by the active role:
 *   - state_admin → every application
 *   - college_admin → only their college's applications
 */
function scopedApplications(
  all: readonly MockApplication[],
  role: PortalRole,
  collegeId: string | undefined,
  _effectiveStatus: (id: string) => AppBaseStatus,
): MockApplication[] {
  if (role === "state_admin") return [...all];
  return all.filter((app) => app.collegeId === collegeId);
}

export default function ApplicationsQueuePage() {
  const { effectiveStatus, discrepancyCount } = useScrutiny();
  const { session } = useSession();
  const [filters, setFilters] = useState<QueueFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");

  const visible = useMemo(
    () => scopedApplications(MOCK_APPLICATIONS, session.role, session.collegeId, effectiveStatus),
    [session.role, session.collegeId, effectiveStatus],
  );

  const rows: QueueRow[] = useMemo(
    () =>
      visible.map((app) => ({
        app,
        status: effectiveStatus(app.id),
        discrepancyCount: discrepancyCount(app.id),
      })),
    [visible, effectiveStatus, discrepancyCount],
  );

  const counts = useMemo(() => {
    let total = 0;
    let pending = 0;
    let discrepancy = 0;
    let verified = 0;
    for (const { app, status, discrepancyCount: disc } of rows) {
      void app;
      total++;
      if (status === "submitted" || status === "under_scrutiny") pending++;
      if (disc > 0 || status === "discrepancy_raised") discrepancy++;
      if (status === "verified") verified++;
    }
    return { total, pending, discrepancy, verified };
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows
        .filter(({ app, status, discrepancyCount: disc }) =>
          matches(app, search) && passesFilters(app, status, disc, filters),
        )
        .sort((a, b) => {
          const priority: Record<AppBaseStatus, number> = {
            discrepancy_raised: 0,
            submitted: 1,
            under_scrutiny: 2,
            conditional: 3,
            verified: 4,
            rejected: 5,
          };
          const byStatus = priority[a.status] - priority[b.status];
          if (byStatus !== 0) return byStatus;
          return b.app.submittedAt - a.app.submittedAt;
        }),
    [rows, search, filters],
  );

  const collegeOptions = useMemo(() => {
    const pairs = new Map<string, string>();
    for (const app of visible) pairs.set(app.collegeId, app.collegeName);
    return Array.from(pairs.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [visible]);

  const courseOptions = useMemo(() => {
    const pairs = new Map<string, string>();
    for (const app of visible) pairs.set(app.courseId, app.courseCode);
    return Array.from(pairs.entries()).map(([value, label]) => ({ value, label }));
  }, [visible]);

  const districtOptions = useMemo(() => {
    const present = new Set<string>();
    for (const app of visible) {
      const c = getCollegeById(app.collegeId);
      if (c) present.add(c.district);
    }
    return HP_DISTRICTS.filter((d) => present.has(d.id)).map((d) => ({
      value: d.id,
      label: d.name,
    }));
  }, [visible]);

  const typeOptions = useMemo(() => {
    const present = new Set<HPCollegeType>();
    for (const app of visible) {
      const c = getCollegeById(app.collegeId);
      if (c) present.add(c.type);
    }
    return Array.from(present)
      .map((t) => ({ value: t, label: COLLEGE_TYPE_LABEL[t] ?? t }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [visible]);

  const singleCollegeScope = session.role === "college_admin";

  const categoryOptions = [
    { value: "general", label: "General" },
    { value: "ews", label: "EWS" },
    { value: "obc", label: "OBC" },
    { value: "sc", label: "SC" },
    { value: "st", label: "ST" },
  ];

  return (
    <PortalFrame
      active="applications"
      eyebrow={
        session.collegeName
          ? `Scrutiny · ${session.collegeName}`
          : "Scrutiny · Cycle 2026-27"
      }
      title="Application queue"
      banner={{
        title: session.collegeName ?? "All colleges · HPU-167",
        eyebrow: "Scrutiny workbench",
      }}
    >
      <SummaryStrip
        tiles={[
          { label: "Total applications", value: counts.total },
          { label: "Pending scrutiny", value: counts.pending, tone: "brand" },
          { label: "Discrepancy raised", value: counts.discrepancy, tone: "warning" },
          { label: "Verified", value: counts.verified, tone: "success" },
        ]}
      />

      <div className="mt-5">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          search={search}
          onSearchChange={setSearch}
          districtOptions={districtOptions}
          typeOptions={typeOptions}
          collegeOptions={collegeOptions}
          courseOptions={courseOptions}
          categoryOptions={categoryOptions}
          hideScopeFilters={singleCollegeScope}
        />
      </div>

      <div className="mt-5">
        <ApplicationQueueTable
          rows={filtered}
          emptyMessage="No applications match the current filters. Clear filters to see the full queue."
        />
      </div>
    </PortalFrame>
  );
}
