"use client";

import Link from "next/link";
import {
  Badge,
  Card,
  CardBody,
  CardTitle,
  Stepper,
  Table,
  TableShell,
  TBody,
  TD,
  TH,
  THead,
  TR,
  type Step,
} from "@hp-mis/ui";
import {
  COLLEGES,
  COLLEGE_COUNT_BY_DISTRICT,
  getCollegeById,
  HP_DISTRICTS,
} from "@hp-mis/fixtures";
import { PortalFrame } from "./_components/portal-frame";
import { MOCK_APPLICATIONS } from "./_components/data/mock-applications";
import { SummaryStrip } from "./_components/admin/summary-strip";

export default function DashboardPage() {
  const totalSeats = COLLEGES.reduce((acc, c) => acc + c.totalSanctionedSeats, 0);
  const pending = MOCK_APPLICATIONS.filter(
    (a) => a.baseStatus === "submitted" || a.baseStatus === "under_scrutiny",
  ).length;
  const verified = MOCK_APPLICATIONS.filter((a) => a.baseStatus === "verified").length;
  const discrepancy = MOCK_APPLICATIONS.filter(
    (a) => a.baseStatus === "discrepancy_raised",
  ).length;

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

  const phaseSteps: readonly Step[] = [
    { number: 1, label: "Cycle setup", state: "done" },
    { number: 2, label: "Application open", state: "active" },
    { number: 3, label: "Scrutiny", state: "idle" },
    { number: 4, label: "Merit & allotment", state: "idle" },
    { number: 5, label: "Admission confirmed", state: "idle" },
  ];

  return (
    <PortalFrame
      active="overview"
      title="Dashboard"
      banner={{
        title: "State overview · Cycle 2026-27",
        eyebrow: "HPU Admission",
        actions: (
          <Badge tone="success" dot>
            Application open · Day 3 of 10
          </Badge>
        ),
      }}
    >
      <SummaryStrip
        tiles={[
          { label: "Active cycle", value: "2026-27", hint: "Live across 167 colleges" },
          {
            label: "Applications to date",
            value: MOCK_APPLICATIONS.length.toString(),
            tone: "brand",
          },
          { label: "Scrutiny in queue", value: pending.toString(), tone: "warning" },
          {
            label: "Seats configured",
            value: totalSeats.toLocaleString("en-IN"),
            tone: "success",
          },
        ]}
      />

      <section className="mt-6">
        <Card padded={false}>
          <div className="p-5 pb-3">
            <CardTitle>Cycle phase</CardTitle>
            <CardBody>
              Toggle phases from <strong>State admin → Cycle setup</strong> (coming soon).
            </CardBody>
          </div>
          <div className="px-5 pb-5 pt-2">
            <Stepper steps={phaseSteps} />
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padded={false}>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
              <div>
                <CardTitle>Applications by district</CardTitle>
                <CardBody className="mt-1">
                  Live counts laid over the HPU-167 college footprint.
                </CardBody>
              </div>
              <Link
                href="/applications"
                className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-link)] hover:underline"
              >
                Open queue →
              </Link>
            </div>
            <TableShell className="rounded-none border-0 shadow-none">
              <Table>
                <THead>
                  <TR>
                    <TH className="w-48">District</TH>
                    <TH>Coverage</TH>
                    <TH className="w-28 text-right">Colleges</TH>
                    <TH className="w-28 text-right">Apps</TH>
                  </TR>
                </THead>
                <TBody>
                  {districtRows.map((row) => (
                    <TR key={row.id}>
                      <TD className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {row.name}
                      </TD>
                      <TD>
                        <span
                          className="block h-1.5 rounded-full bg-[var(--color-background-brand-subtle)]"
                          aria-hidden="true"
                        >
                          <span
                            className="block h-full rounded-full bg-[var(--color-interactive-brand)]"
                            style={{ width: `${(row.colleges / maxCollegeCount) * 100}%` }}
                          />
                        </span>
                      </TD>
                      <TD className="text-right tabular-nums">
                        {row.colleges}
                      </TD>
                      <TD className="text-right tabular-nums">
                        <Badge tone={row.apps > 0 ? "brand" : "neutral"}>{row.apps}</Badge>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableShell>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle>Scrutiny health</CardTitle>
            <CardBody className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span>Pending</span>
                <Badge tone="warning">{pending}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Discrepancies</span>
                <Badge tone="danger">{discrepancy}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Verified</span>
                <Badge tone="success">{verified}</Badge>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardTitle>Next actions</CardTitle>
            <CardBody className="mt-3">
              Scrutiny and discrepancy workflows are live on the{" "}
              <Link
                href="/applications"
                className="font-[var(--weight-semibold)] text-[var(--color-text-link)] hover:underline"
              >
                Applications queue
              </Link>
              .
            </CardBody>
          </Card>
        </div>
      </section>
    </PortalFrame>
  );
}
