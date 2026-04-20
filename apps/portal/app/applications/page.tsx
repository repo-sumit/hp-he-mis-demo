"use client";

import { useMemo, useState } from "react";
import { PortalFrame } from "../_components/portal-frame";
import {
  MOCK_APPLICATIONS,
  REVIEWER_COLLEGE,
  REVIEWER_NAME,
  REVIEWER_ROLE,
  type AppBaseStatus,
  type MockApplication,
} from "../_components/data/mock-applications";
import { useScrutiny } from "../_components/data/scrutiny-provider";
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
  if (filters.collegeId !== "all" && app.collegeId !== filters.collegeId) return false;
  if (filters.courseId !== "all" && app.courseId !== filters.courseId) return false;
  if (filters.category !== "all" && app.studentCategory !== filters.category) return false;
  if (filters.discrepancyPending && discrepancyCount === 0) return false;
  return true;
}

export default function ApplicationsQueuePage() {
  const { effectiveStatus, discrepancyCount } = useScrutiny();
  const [filters, setFilters] = useState<QueueFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");

  const rows: QueueRow[] = useMemo(
    () =>
      MOCK_APPLICATIONS.map((app) => ({
        app,
        status: effectiveStatus(app.id),
        discrepancyCount: discrepancyCount(app.id),
      })),
    [effectiveStatus, discrepancyCount],
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
    for (const app of MOCK_APPLICATIONS) pairs.set(app.collegeId, app.collegeName);
    return Array.from(pairs.entries()).map(([value, label]) => ({ value, label }));
  }, []);

  const courseOptions = useMemo(() => {
    const pairs = new Map<string, string>();
    for (const app of MOCK_APPLICATIONS) pairs.set(app.courseId, app.courseCode);
    return Array.from(pairs.entries()).map(([value, label]) => ({ value, label }));
  }, []);

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
      eyebrow="Scrutiny · Cycle 2026-27"
      title="Application queue"
      headerRight={
        <div className="text-right">
          <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {REVIEWER_NAME}
          </p>
          <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
            {REVIEWER_ROLE} · {REVIEWER_COLLEGE}
          </p>
        </div>
      }
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
          collegeOptions={collegeOptions}
          courseOptions={courseOptions}
          categoryOptions={categoryOptions}
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
