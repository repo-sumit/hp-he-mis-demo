"use client";

import { Badge, Card, CardBody, CardTitle, Table, TableShell, TBody, TD, TH, THead, TR, cn } from "@hp-mis/ui";
import { PortalFrame } from "../../_components/portal-frame";
import { SummaryStrip } from "../../_components/admin/summary-strip";
import { KPICard } from "../../_components/admin/insights/kpi-card";
import { LineChart } from "../../_components/admin/insights/line-chart";
import { DonutChart } from "../../_components/admin/insights/donut-chart";
import {
  ENROLLMENT_TREND,
  ENROLLMENT_TREND_FEMALE,
  ENROLLMENT_TREND_MALE,
  GENDER_DISTRIBUTION,
  HIGH_RISK_COHORTS,
  LIFECYCLE,
  RURAL_URBAN,
} from "../../_components/admin/insights/insights-data";
import { useSession } from "../../_components/data/session-provider";

export default function StateLifecyclePage() {
  const { session, hydrated } = useSession();

  if (hydrated && session.role !== "state_admin") {
    return (
      <PortalFrame active="overview" eyebrow="Student lifecycle" title="Lifecycle">
        <Card>
          <CardTitle>Role required</CardTitle>
          <CardBody>
            Student-lifecycle analytics are restricted to State Admin. Switch roles to
            continue.
          </CardBody>
        </Card>
      </PortalFrame>
    );
  }

  return (
    <PortalFrame
      active="overview"
      eyebrow="Student lifecycle · Cycle 2026-27"
      title="Student Lifecycle"
      breadcrumbs={[{ label: "Command Center", href: "/" }, { label: "Student lifecycle" }]}
      breadcrumbsBackHref="/"
      banner={{
        title: "Student lifecycle",
        eyebrow: "Directorate of Higher Education",
        actions: <Badge tone="brand">Academic year 2025-26</Badge>,
      }}
    >
      <section aria-label="Lifecycle KPIs" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total enrollment"
          value={LIFECYCLE.totalEnrollment}
          icon="👥"
          tone="brand"
          trend={{
            label: `${LIFECYCLE.totalEnrollmentDelta} YoY`,
            direction: "up",
            tone: "success",
          }}
        />
        <KPICard
          label="Dropout rate"
          value={LIFECYCLE.dropoutRate}
          icon="⚠"
          tone="danger"
          trend={{
            label: `Above target ${LIFECYCLE.dropoutTarget}`,
            direction: "up",
            tone: "danger",
          }}
        />
        <KPICard
          label="Completion rate"
          value={LIFECYCLE.completionRate}
          icon="🎓"
          tone="success"
          context="On track"
        />
        <KPICard
          label="Transition rate"
          value={LIFECYCLE.transitionRate}
          icon="🔁"
          tone="brand"
          context="UG to PG"
        />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[3fr_2fr]">
        <Card padded={false}>
          <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
            <CardTitle>Enrollment trends · 5 years</CardTitle>
            <CardBody className="mt-1">
              Students in Lakhs. Gender overlay shown as dashed series.
            </CardBody>
          </div>
          <div className="px-5 py-5">
            <LineChart
              data={ENROLLMENT_TREND}
              series={[
                {
                  label: "Female",
                  color: "var(--color-chart-5)",
                  data: ENROLLMENT_TREND_FEMALE,
                },
                { label: "Male", color: "var(--color-chart-3)", data: ENROLLMENT_TREND_MALE },
              ]}
              yMin={0}
              yMax={2.5}
              yTickCount={5}
              yFormatter={(n) => `${n.toFixed(1)}L`}
              ariaLabel="Five-year enrollment trend with gender split"
            />
          </div>
        </Card>

        <Card padded={false}>
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
            <CardTitle>Gender distribution</CardTitle>
            <Badge tone="success">GPI · {GENDER_DISTRIBUTION.gpi}</Badge>
          </div>
          <div className="px-5 py-6">
            <DonutChart
              segments={[
                { label: "Female", value: GENDER_DISTRIBUTION.female, color: "var(--color-chart-5)" },
                { label: "Male", value: GENDER_DISTRIBUTION.male, color: "var(--color-chart-1)" },
              ]}
              centerLabel="Total"
              centerValue="2.15 L"
              size={200}
              ariaLabel="Gender distribution donut chart"
            />
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card padded={false}>
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
            <CardTitle>High-risk cohorts · dropout &gt; 10%</CardTitle>
            <Badge tone="danger">{HIGH_RISK_COHORTS.length} flagged</Badge>
          </div>
          <TableShell className="rounded-none border-0 shadow-none">
            <Table>
              <THead>
                <TR>
                  <TH>District</TH>
                  <TH>Course / stream</TH>
                  <TH>Risk level</TH>
                  <TH className="text-right">Dropout rate</TH>
                </TR>
              </THead>
              <TBody>
                {HIGH_RISK_COHORTS.map((row, i) => (
                  <TR key={i}>
                    <TD className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                      {row.district}
                    </TD>
                    <TD className="text-[var(--color-text-secondary)]">{row.course}</TD>
                    <TD>
                      <Badge tone={row.severity === "critical" ? "danger" : "warning"}>
                        {row.severity === "critical" ? "Critical" : "Warning"}
                      </Badge>
                    </TD>
                    <TD className={cn(
                      "text-right tabular-nums font-[var(--weight-semibold)]",
                      row.severity === "critical"
                        ? "text-[var(--color-status-danger-fg)]"
                        : "text-[var(--color-status-warning-fg)]",
                    )}>
                      {row.riskRate}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableShell>
        </Card>

        <Card>
          <CardTitle>Rural vs urban split</CardTitle>
          <CardBody className="mt-4 space-y-4">
            <Split label="Rural" value={RURAL_URBAN.rural} tone="success" />
            <Split label="Urban" value={RURAL_URBAN.urban} tone="brand" />
            <p className="rounded-[var(--radius-md)] bg-[var(--color-background-brand-subtle)] p-3 text-[var(--text-xs)] text-[var(--color-text-primary)]">
              <span aria-hidden="true" className="mr-1">ℹ</span>
              {RURAL_URBAN.note}
            </p>
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}

function Split({ label, value, tone }: { label: string; value: number; tone: "brand" | "success" }) {
  const barClass = tone === "success" ? "bg-[var(--color-chart-2)]" : "bg-[var(--color-chart-1)]";
  return (
    <div>
      <div className="flex items-center justify-between text-[var(--text-sm)]">
        <span className="font-[var(--weight-medium)] text-[var(--color-text-primary)]">
          {label}
        </span>
        <span className="tabular-nums font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {value}%
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[var(--color-background-brand-subtle)]">
        <div
          className={cn("h-full rounded-full transition-[width] duration-300 ease-out", barClass)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
