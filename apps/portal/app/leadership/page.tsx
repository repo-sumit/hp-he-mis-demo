"use client";

import { Card, CardBody, CardTitle } from "@hp-mis/ui";
import {
  COLLEGES,
  COLLEGE_COUNT_BY_DISTRICT,
  getCollegeById,
  HP_DISTRICTS,
  type HPCollegeType,
} from "@hp-mis/fixtures";
import { PortalFrame } from "../_components/portal-frame";
import { SummaryStrip } from "../_components/admin/summary-strip";
import { MOCK_APPLICATIONS } from "../_components/data/mock-applications";

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

/**
 * Leadership (DHE Secretary) read-only dashboard. Aggregate glances across
 * the HPU-167 footprint + current scrutiny queue.
 */
export default function LeadershipDashboardPage() {
  const total = MOCK_APPLICATIONS.length;
  const verified = MOCK_APPLICATIONS.filter((a) => a.baseStatus === "verified").length;
  const discrepancies = MOCK_APPLICATIONS.filter(
    (a) => a.baseStatus === "discrepancy_raised",
  ).length;
  const rejected = MOCK_APPLICATIONS.filter((a) => a.baseStatus === "rejected").length;
  const girlChild = MOCK_APPLICATIONS.filter((a) => a.isSingleGirlChild).length;
  const scStObc = MOCK_APPLICATIONS.filter((a) =>
    ["sc", "st", "obc"].includes(a.studentCategory),
  ).length;

  const typeCounts = new Map<HPCollegeType, number>();
  for (const c of COLLEGES) typeCounts.set(c.type, (typeCounts.get(c.type) ?? 0) + 1);

  const appsByDistrict = new Map<string, number>();
  for (const a of MOCK_APPLICATIONS) {
    const c = getCollegeById(a.collegeId);
    if (!c) continue;
    appsByDistrict.set(c.district, (appsByDistrict.get(c.district) ?? 0) + 1);
  }

  const districtRows = HP_DISTRICTS.map((d) => ({
    id: d.id,
    name: d.name,
    colleges: COLLEGE_COUNT_BY_DISTRICT[d.id] ?? 0,
    apps: appsByDistrict.get(d.id) ?? 0,
  }))
    .filter((r) => r.colleges > 0)
    .sort((a, b) => b.colleges - a.colleges);

  const topDistrict = districtRows[0];
  const maxColleges = Math.max(1, ...districtRows.map((r) => r.colleges));

  return (
    <PortalFrame
      active="leadership"
      eyebrow="HPU Admission · Department of Higher Education · Cycle 2026-27"
      title="Leadership dashboard"
    >
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] px-4 py-3 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        Read-only view · No write actions available from this role.
      </div>

      <SummaryStrip
        tiles={[
          { label: "Applications to date", value: total },
          { label: "Verified", value: verified, tone: "success" },
          { label: "Discrepancy raised", value: discrepancies, tone: "warning" },
          { label: "Rejected", value: rejected, tone: "danger" },
        ]}
      />

      <SummaryStrip
        className="mt-4"
        tiles={[
          { label: "HPU-167 colleges", value: COLLEGES.length },
          { label: "Districts covered", value: districtRows.length },
          {
            label: topDistrict
              ? `Largest footprint · ${topDistrict.name}`
              : "Largest footprint",
            value: topDistrict?.colleges ?? 0,
            tone: "brand",
          },
          {
            label: "Sanctioned UG seats",
            value: COLLEGES.reduce((acc, c) => acc + c.totalSanctionedSeats, 0),
          },
        ]}
      />

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>College distribution — by district</CardTitle>
          <CardBody>
            <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              Bars show HPU-167 institution count. Numbers on the right pair college count with
              live application volume in that district.
            </p>
            <ul className="mt-3 space-y-1.5">
              {districtRows.map((row) => (
                <li
                  key={row.id}
                  className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-[var(--text-sm)]"
                >
                  <span className="text-[var(--color-text-primary)]">{row.name}</span>
                  <span
                    className="h-2 rounded-full bg-[var(--color-background-brand-subtle)]"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full rounded-full bg-[var(--color-interactive-brand)]"
                      style={{ width: `${(row.colleges / maxColleges) * 100}%` }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {row.colleges} college{row.colleges === 1 ? "" : "s"} · {row.apps} app
                    {row.apps === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardTitle>College distribution — by type</CardTitle>
          <CardBody>
            <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              Institution mix across the HPU-167 footprint.
            </p>
            <ul className="mt-3 space-y-1.5 text-[var(--text-sm)]">
              {Array.from(typeCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([type, n]) => (
                  <li key={type} className="flex items-center justify-between gap-3">
                    <span className="text-[var(--color-text-primary)]">
                      {COLLEGE_TYPE_LABEL[type] ?? type}
                    </span>
                    <span className="text-[var(--color-text-secondary)]">
                      {n} college{n === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardTitle>Reservation mix (current queue)</CardTitle>
          <CardBody>
            <ul className="space-y-1 text-[var(--text-sm)]">
              <li>SC / ST / OBC applications: {scStObc}</li>
              <li>Single Girl Child claims: {girlChild}</li>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardTitle>Coverage notes</CardTitle>
          <CardBody>
            <ul className="space-y-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              <li>
                Data source: <strong>HPU 167-college dataset</strong> ·{" "}
                {COLLEGES.length} institutions seeded in{" "}
                <code className="rounded bg-[var(--color-background-subtle)] px-1 py-0.5 text-[0.75em]">
                  packages/fixtures
                </code>.
              </li>
              <li>
                Daily trend and district heatmap land when the mock API exposes a
                time-series. Today the district card reflects baseline college footprint +
                live scrutiny counts.
              </li>
            </ul>
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}
