"use client";

import Link from "next/link";
import { Card, CardBody, CardTitle } from "@hp-mis/ui";
import {
  COLLEGES,
  COLLEGE_COUNT_BY_DISTRICT,
  getCollegeById,
  HP_DISTRICTS,
} from "@hp-mis/fixtures";
import { PortalFrame } from "./_components/portal-frame";
import { MOCK_APPLICATIONS } from "./_components/data/mock-applications";

export default function DashboardPage() {
  const totalSeats = COLLEGES.reduce((acc, c) => acc + c.totalSanctionedSeats, 0);
  const pending = MOCK_APPLICATIONS.filter(
    (a) => a.baseStatus === "submitted" || a.baseStatus === "under_scrutiny",
  ).length;

  const kpis = [
    { label: "Active cycle", value: "2026-27" },
    { label: "Applications to date", value: MOCK_APPLICATIONS.length.toString() },
    { label: "Scrutiny in queue", value: pending.toString() },
    { label: "Seats configured", value: totalSeats.toLocaleString("en-IN") },
  ];

  const appsByDistrict = new Map<string, number>();
  for (const app of MOCK_APPLICATIONS) {
    const college = getCollegeById(app.collegeId);
    const districtId = college?.district ?? "unknown";
    appsByDistrict.set(districtId, (appsByDistrict.get(districtId) ?? 0) + 1);
  }

  const districtRows = HP_DISTRICTS.map((d) => ({
    id: d.id,
    name: d.name,
    colleges: COLLEGE_COUNT_BY_DISTRICT[d.id] ?? 0,
    apps: appsByDistrict.get(d.id) ?? 0,
  }))
    .filter((row) => row.colleges > 0)
    .sort((a, b) => b.apps - a.apps || b.colleges - a.colleges);

  const maxCollegeCount = Math.max(1, ...districtRows.map((r) => r.colleges));

  return (
    <PortalFrame active="overview" title="Dashboard">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <div className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {kpi.label}
            </div>
            <div className="mt-2 text-[var(--text-3xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              {kpi.value}
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Applications by district</CardTitle>
          <CardBody>
            <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              Live count of scrutiny-stage applications, laid over the HPU-167 college footprint.
            </p>
            <ul className="mt-3 space-y-1.5">
              {districtRows.map((row) => (
                <li key={row.id} className="grid grid-cols-[10rem_1fr_auto] items-center gap-3 text-[var(--text-sm)]">
                  <span className="text-[var(--color-text-primary)]">{row.name}</span>
                  <span
                    className="h-2 rounded-full bg-[var(--color-background-brand-subtle)]"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full rounded-full bg-[var(--color-interactive-brand)]"
                      style={{ width: `${(row.colleges / maxCollegeCount) * 100}%` }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {row.apps} app{row.apps === 1 ? "" : "s"} · {row.colleges} college
                    {row.colleges === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Cycle phase</CardTitle>
          <CardBody>
            Toggle cycle phases from <strong>State admin → Cycle setup</strong> (coming
            soon). Currently parked at <em>Application Open — Day 3 of 10</em>.
            <p className="mt-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              Scrutiny and discrepancy workflows are live on the{" "}
              <Link
                href="/applications"
                className="font-[var(--weight-semibold)] text-[var(--color-text-link)]"
              >
                Applications queue
              </Link>
              .
            </p>
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}
