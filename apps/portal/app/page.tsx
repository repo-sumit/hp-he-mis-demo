"use client";

import Link from "next/link";
import { Badge, Card, CardBody, CardTitle, cn } from "@hp-mis/ui";
import { PortalFrame } from "./_components/portal-frame";
import { KPICard } from "./_components/admin/insights/kpi-card";
import { LineChart } from "./_components/admin/insights/line-chart";
import { DonutChart } from "./_components/admin/insights/donut-chart";
import { AlertsPanel } from "./_components/admin/insights/alerts-panel";
import { PriorityActions } from "./_components/admin/insights/priority-actions";
import { DecisionInsightPanel } from "./_components/admin/insights/decision-insight-panel";
import { DashboardHeader } from "./_components/admin/insights/dashboard-header";
import {
  ALERT_SUMMARY,
  CAPEX_REQUIREMENTS,
  COMMAND_CENTER_ALERTS,
  CRITICAL_SHORTAGES,
  CURRENT_FY,
  DECISION_INSIGHTS,
  DISTRICT_ENROLLMENT,
  ENROLLMENT_TREND,
  ENROLLMENT_TREND_FEMALE,
  ENROLLMENT_TREND_MALE,
  FACULTY,
  FINANCE,
  GENDER_DISTRIBUTION,
  HIGH_RISK_COHORTS,
  INFRA,
  LAST_UPDATED_LABEL,
  LIFECYCLE,
  PRIORITY_ACTIONS,
  RURAL_URBAN,
  SCHEME_BUDGET,
  STATE_KPI,
  SUBJECT_VACANCY,
  type DistrictDensity,
} from "./_components/admin/insights/insights-data";

/**
 * State Admin landing — "Higher Education Command Center".
 *
 * Layout contract (enforced by this file):
 *   · 12-column base grid for every region with multiple children
 *   · 32px (mt-8) vertical rhythm between top-level sections
 *   · 24px (gap-6 / mt-6) between cards inside a section
 *   · 16px (p-4) card padding everywhere it is controlled here
 *
 * Data, components, and logic remain untouched from the pre-refactor
 * state; this pass only fixes layout, spacing, alignment, and
 * hierarchy.
 */

const DENSITY_TONE: Record<DistrictDensity, "success" | "brand" | "warning" | "danger"> = {
  high: "success",
  medium: "brand",
  low: "warning",
  critical: "danger",
};

const DENSITY_LABEL: Record<DistrictDensity, string> = {
  high: "High (>20k)",
  medium: "Medium (10–20k)",
  low: "Low (<10k)",
  critical: "Flagged",
};

const DENSITY_BAR: Record<DistrictDensity, string> = {
  high: "bg-[var(--color-chart-1)]",
  medium: "bg-[var(--color-chart-2)]",
  low: "bg-[var(--color-chart-3)]",
  critical: "bg-[var(--color-chart-4)]",
};

export default function DashboardPage() {
  const maxDistrictEnrollment = Math.max(
    ...DISTRICT_ENROLLMENT.map((d) => d.students),
  );
  const maxSubjectVacancy = Math.max(
    ...SUBJECT_VACANCY.map((s) => s.filled + s.vacant),
  );
  const maxSchemeBudget = Math.max(
    ...SCHEME_BUDGET.map((s) => s.allocatedCr),
  );

  return (
    <PortalFrame
      active="overview"
      eyebrow="Directorate of Higher Education · Himachal Pradesh · FY 2026-27"
      title="Higher Education Command Center"
      banner={{
        title: "Higher Education Command Center",
        eyebrow: "FY 2026-27 · Live insights",
        actions: (
          <Badge tone="success" dot>
            System status · Online
          </Badge>
        ),
      }}
    >
      {/* ------- Dashboard header · data freshness + filters ------- */}
      <DashboardHeader
        lastUpdatedLabel={LAST_UPDATED_LABEL}
        financialYear={CURRENT_FY}
      />

      {/* ------- Priority Actions Today ------- */}
      <PriorityActions actions={PRIORITY_ACTIONS} />

      {/* ------- Section 1 · Executive KPIs (5 tiles) ------- */}
      <section
        aria-label="Executive KPIs"
        className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5"
      >
        <KPICard
          label="Total Colleges"
          value={STATE_KPI.totalColleges}
          icon="🏛"
          tone="brand"
          context={`${STATE_KPI.govtColleges} Govt · ${STATE_KPI.privateColleges} Pvt`}
        />
        <KPICard
          label="Total Students"
          value={STATE_KPI.totalStudents}
          icon="👥"
          tone="success"
          trend={{ label: `${STATE_KPI.totalStudentsYoY} YoY growth`, direction: "up", tone: "success" }}
        />
        <KPICard
          label="Gross Enrolment Ratio"
          value={STATE_KPI.grossEnrolmentRatio}
          icon="📈"
          tone="success"
          trend={{ label: `${STATE_KPI.grossEnrolmentDelta} vs last year`, direction: "up", tone: "success" }}
        />
        <KPICard
          label="Faculty Vacancies"
          value={STATE_KPI.facultyVacancyPct}
          icon="🧑‍🏫"
          tone="danger"
          trend={{
            label: `${STATE_KPI.facultyVacantPosts.toLocaleString("en-IN")} posts vacant`,
            direction: "down",
            tone: "danger",
          }}
        />
        <KPICard
          label="Fund Utilization"
          value={STATE_KPI.fundUtilizationPct}
          icon="💰"
          tone="warning"
          context={`₹${STATE_KPI.fundUtilizedCr} Cr of ₹${STATE_KPI.fundBudgetCr} Cr utilised YTD`}
        />
      </section>

      {/* ------- Section 2 + 3 · Core insights + Alerts (12-col · 8 + 4) ------- */}
      <section
        aria-label="Core insights and alerts"
        className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        {/* Insights column (8/12) */}
        <div className="grid grid-cols-1 gap-6 lg:col-span-8 lg:grid-cols-12">
          {/* District-wise enrollment — full width of inner 12-col */}
          <Card padded={false} className="lg:col-span-12">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] p-4">
              <div>
                <CardTitle>District-wise enrollment</CardTitle>
                <CardBody className="mt-1">
                  Across all 12 Himachal districts. Bars coloured by density band.
                </CardBody>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                {(Object.keys(DENSITY_LABEL) as DistrictDensity[]).map((d) => (
                  <span key={d} className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn("h-2 w-3 rounded-sm", DENSITY_BAR[d])}
                    />
                    {DENSITY_LABEL[d]}
                  </span>
                ))}
              </div>
            </header>
            <ul className="space-y-3 p-4">
              {DISTRICT_ENROLLMENT.map((row) => {
                const pct = (row.students / maxDistrictEnrollment) * 100;
                return (
                  <li
                    key={row.districtId}
                    className="grid grid-cols-[9rem_1fr_7rem] items-center gap-3 text-[var(--text-sm)]"
                  >
                    <span className="font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                      {row.districtName}
                    </span>
                    <span
                      className="relative h-2.5 rounded-full bg-[var(--color-background-brand-subtle)]"
                      aria-hidden="true"
                    >
                      <span
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out",
                          DENSITY_BAR[row.density],
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="flex items-baseline justify-end gap-2 tabular-nums">
                      <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {row.students.toLocaleString("en-IN")}
                      </span>
                      {row.note ? <Badge tone="danger">!</Badge> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Enrollment trend (7/12) + Gender parity (5/12) */}
          <Card padded={false} className="lg:col-span-7">
            <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] p-4">
              <div>
                <CardTitle>Enrollment analysis</CardTitle>
                <CardBody className="mt-1">
                  Five-year trend, students in Lakhs. Overall plus gender split.
                </CardBody>
              </div>
              <Link
                href="#"
                className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-link)] transition-colors duration-150 ease-out hover:underline underline-offset-4"
              >
                View details →
              </Link>
            </header>
            <div className="p-4">
              <LineChart
                data={ENROLLMENT_TREND}
                series={[
                  { label: "Female", color: "var(--color-chart-5)", data: ENROLLMENT_TREND_FEMALE },
                  { label: "Male", color: "var(--color-chart-3)", data: ENROLLMENT_TREND_MALE },
                ]}
                yMin={0}
                yMax={2.5}
                yTickCount={5}
                yFormatter={(n) => `${n.toFixed(1)}L`}
                ariaLabel="Enrollment trend over five years, total plus female and male"
              />
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                <Legend color="var(--color-chart-1)" label="Total" />
                <Legend color="var(--color-chart-5)" label="Female" dashed />
                <Legend color="var(--color-chart-3)" label="Male" dashed />
              </div>
            </div>
          </Card>

          <Card padded={false} className="lg:col-span-5">
            <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] p-4">
              <CardTitle>Gender parity</CardTitle>
              <Badge tone="success">GPI · {GENDER_DISTRIBUTION.gpi}</Badge>
            </header>
            <div className="p-4">
              <DonutChart
                segments={[
                  { label: "Female", value: GENDER_DISTRIBUTION.female, color: "var(--color-chart-5)" },
                  { label: "Male", value: GENDER_DISTRIBUTION.male, color: "var(--color-chart-1)" },
                ]}
                centerLabel="Total"
                centerValue="2.15 L"
                size={180}
                ariaLabel="Gender distribution donut chart"
              />
            </div>
          </Card>
        </div>

        {/* Alerts column (4/12) */}
        <aside aria-label="Actionable alerts" className="grid gap-6 lg:col-span-4">
          <AlertsPanel
            alerts={COMMAND_CENTER_ALERTS}
            urgentCount={ALERT_SUMMARY.critical}
            viewAllHref="/state/alerts"
          />
          <Card padded={false}>
            <header className="border-b border-[var(--color-border-subtle)] p-4">
              <CardTitle>Alert health</CardTitle>
            </header>
            <div className="space-y-2 p-4 text-[var(--text-sm)]">
              <AlertRow label="Critical" value={ALERT_SUMMARY.critical} tone="danger" />
              <AlertRow label="Warnings" value={ALERT_SUMMARY.warnings} tone="warning" />
              <AlertRow label="Pending reviews" value={ALERT_SUMMARY.pendingReviews} tone="brand" />
              <AlertRow label="Resolved · this week" value={ALERT_SUMMARY.resolvedThisWeek} tone="success" />
            </div>
          </Card>
        </aside>
      </section>

      {/* ------- Decision intelligence ------- */}
      <section aria-label="Decision intelligence" className="mt-8">
        <DecisionInsightPanel insights={DECISION_INSIGHTS} />
      </section>

      {/* ------- Section 4 · Student Lifecycle (12-col · 3+3+3+3) ------- */}
      <section aria-label="Student lifecycle" className="mt-8">
        <SectionHeading
          eyebrow="Student lifecycle"
          title="Are students arriving, staying, and moving on?"
          href="/state/lifecycle"
        />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <KPICard
              label="Total enrollment"
              value={LIFECYCLE.totalEnrollment}
              icon="👥"
              tone="brand"
              trend={{ label: `${LIFECYCLE.totalEnrollmentDelta} YoY`, direction: "up", tone: "success" }}
            />
          </div>
          <div className="lg:col-span-3">
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
          </div>
          <div className="lg:col-span-3">
            <KPICard
              label="Completion rate"
              value={LIFECYCLE.completionRate}
              icon="🎓"
              tone="success"
              context="On track"
            />
          </div>
          <Card padded={false} className="lg:col-span-3">
            <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] p-4">
              <CardTitle>High-risk cohorts</CardTitle>
              <Badge tone="danger">{HIGH_RISK_COHORTS.length} flagged</Badge>
            </header>
            <ul className="divide-y divide-[var(--color-border-subtle)]">
              {HIGH_RISK_COHORTS.map((row, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-3 px-4 py-3 text-[var(--text-sm)]"
                >
                  <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {row.district}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">{row.course}</span>
                  <Badge tone={row.severity === "critical" ? "danger" : "warning"}>
                    {row.riskRate} {row.severity === "critical" ? "critical" : "warning"}
                  </Badge>
                  <Link
                    href="#"
                    className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-link)] hover:underline underline-offset-4"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card padded={false} className="mt-6">
          <header className="border-b border-[var(--color-border-subtle)] p-4">
            <CardTitle>Rural vs urban split</CardTitle>
          </header>
          <div className="space-y-4 p-4">
            <SplitBar label="Rural" value={RURAL_URBAN.rural} tone="success" />
            <SplitBar label="Urban" value={RURAL_URBAN.urban} tone="brand" />
            <p className="rounded-[var(--radius-md)] bg-[var(--color-background-brand-subtle)] p-3 text-[var(--text-xs)] text-[var(--color-text-primary)]">
              <span aria-hidden="true" className="mr-1">ℹ</span>
              {RURAL_URBAN.note}
            </p>
          </div>
        </Card>
      </section>

      {/* ------- Section 5 · Faculty & HR (12-col · 4 + 8) ------- */}
      <section aria-label="Faculty and HR" className="mt-8">
        <SectionHeading
          eyebrow="Faculty & HR"
          title="Where is teaching capacity thin?"
          href="#"
        />
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* KPI 2x2 (4/12) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-4">
            <KPICard
              label="Sanctioned posts"
              value={FACULTY.sanctioned.toLocaleString("en-IN")}
              icon="💼"
              tone="brand"
              context={`+${FACULTY.newPosts} new posts`}
            />
            <KPICard
              label="Filled posts"
              value={FACULTY.filled.toLocaleString("en-IN")}
              icon="🧑‍🏫"
              tone="success"
              context={`${FACULTY.occupancyPct} occupancy`}
            />
            <KPICard
              label="Vacancies"
              value={FACULTY.vacant.toLocaleString("en-IN")}
              icon="❗"
              tone="danger"
              trend={{ label: FACULTY.vacancyPct, direction: "down", tone: "danger" }}
            />
            <KPICard
              label="Retiring · 24 mo"
              value={FACULTY.retiring24Months.toLocaleString("en-IN")}
              icon="⏳"
              tone="warning"
              context="Recruitment planning needed"
            />
          </div>

          {/* Subject-wise vacancy (8/12) */}
          <Card padded={false} className="lg:col-span-8">
            <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] p-4">
              <div>
                <CardTitle>Subject-wise vacancy (top 6)</CardTitle>
                <CardBody className="mt-1">Sanctioned posts · filled vs vacant.</CardBody>
              </div>
              <Link
                href="#"
                className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-link)] hover:underline underline-offset-4"
              >
                View all →
              </Link>
            </header>
            <ul className="space-y-3 p-4">
              {SUBJECT_VACANCY.map((row) => {
                const total = row.filled + row.vacant;
                const filledPct = (row.filled / maxSubjectVacancy) * 100;
                const vacantPct = (row.vacant / maxSubjectVacancy) * 100;
                return (
                  <li
                    key={row.subject}
                    className="grid grid-cols-[7rem_1fr_5rem] items-center gap-3 text-[var(--text-sm)]"
                  >
                    <span className="font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                      {row.subject}
                    </span>
                    <span
                      className="relative h-2.5 rounded-full bg-[var(--color-background-brand-subtle)]"
                      aria-hidden="true"
                    >
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-chart-1)] transition-[width] duration-300 ease-out"
                        style={{ width: `${filledPct}%` }}
                      />
                      <span
                        className="absolute inset-y-0 rounded-r-full bg-[var(--color-chart-4)] transition-[width] duration-300 ease-out"
                        style={{ left: `${filledPct}%`, width: `${vacantPct}%` }}
                      />
                    </span>
                    <span className="flex items-baseline justify-end gap-2 tabular-nums">
                      <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {total}
                      </span>
                      <Badge tone="danger">{row.vacant}</Badge>
                    </span>
                  </li>
                );
              })}
              <li className="flex items-center gap-4 border-t border-[var(--color-border-subtle)] pt-3 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                <Legend color="var(--color-chart-1)" label="Filled" />
                <Legend color="var(--color-chart-4)" label="Vacant" />
              </li>
            </ul>
          </Card>
        </div>

        <Card padded={false} className="mt-6">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] p-4">
            <CardTitle>Critical shortages by college</CardTitle>
            <Badge tone="danger">Vacancy &gt; 30%</Badge>
          </header>
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {CRITICAL_SHORTAGES.map((row) => (
              <li
                key={row.college}
                className="grid grid-cols-[1fr_8rem_6rem_5rem_5rem] items-center gap-3 px-4 py-3 text-[var(--text-sm)]"
              >
                <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                  {row.college}
                </span>
                <span className="text-[var(--color-text-secondary)]">{row.district}</span>
                <span className="text-[var(--color-text-secondary)]">{row.vacantPosts} vacant</span>
                <span className="text-[var(--color-text-primary)] tabular-nums">{row.vacancyPct}</span>
                <Badge tone={row.severity === "critical" ? "danger" : "warning"}>
                  {row.severity === "critical" ? "Critical" : "High"}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* ------- Section 6 · Financial (4 KPIs · then 8+4 detail) ------- */}
      <section aria-label="Financial" className="mt-8">
        <SectionHeading
          eyebrow="Financial monitoring"
          title="Is the money moving on time?"
          href="#"
        />
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Total budget"
            value={`₹${FINANCE.totalBudgetCr} Cr`}
            icon="💳"
            tone="brand"
            context="State + RUSA · allocation finalised"
          />
          <KPICard
            label="Utilisation YTD"
            value={FINANCE.utilizationPct}
            icon="📊"
            tone="success"
            trend={{
              label: `On track (target ${FINANCE.utilizationTarget})`,
              direction: "up",
              tone: "success",
            }}
          />
          <KPICard
            label="Pending UCs"
            value={FINANCE.pendingUCs}
            icon="📄"
            tone="danger"
            context="Action required"
          />
          <KPICard
            label="Available balance"
            value={`₹${FINANCE.availableBalanceCr} Cr`}
            icon="🏦"
            tone="warning"
            context="Remaining for Q4"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card padded={false} className="lg:col-span-8">
            <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] p-4">
              <div>
                <CardTitle>Budget vs utilisation · by scheme</CardTitle>
                <CardBody className="mt-1">Figures in ₹ Crores.</CardBody>
              </div>
              <Link
                href="#"
                className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-link)] hover:underline underline-offset-4"
              >
                Finance dashboard →
              </Link>
            </header>
            <ul className="space-y-3 p-4">
              {SCHEME_BUDGET.map((row) => {
                const utilisedPct = (row.utilizedCr / maxSchemeBudget) * 100;
                const allocatedPct = (row.allocatedCr / maxSchemeBudget) * 100;
                const ratio = Math.round((row.utilizedCr / row.allocatedCr) * 100);
                return (
                  <li
                    key={row.scheme}
                    className="grid grid-cols-[9rem_1fr_6rem] items-center gap-3 text-[var(--text-sm)]"
                  >
                    <span className="font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                      {row.scheme}
                    </span>
                    <span className="relative h-3 rounded-full bg-[var(--color-background-muted)]" aria-hidden="true">
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-chart-grid)] transition-[width] duration-300 ease-out"
                        style={{ width: `${allocatedPct}%` }}
                      />
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-chart-1)] transition-[width] duration-300 ease-out"
                        style={{ width: `${utilisedPct}%` }}
                      />
                    </span>
                    <span className="flex items-baseline justify-end gap-2 tabular-nums">
                      <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {ratio}%
                      </span>
                      <span className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                        ₹{row.utilizedCr}/{row.allocatedCr}
                      </span>
                    </span>
                  </li>
                );
              })}
              <li className="flex items-center gap-4 border-t border-[var(--color-border-subtle)] pt-3 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                <Legend color="var(--color-chart-grid)" label="Allocated" />
                <Legend color="var(--color-chart-1)" label="Utilised" />
              </li>
            </ul>
          </Card>

          <Card padded={false} className="lg:col-span-4">
            <header className="border-b border-[var(--color-border-subtle)] p-4">
              <CardTitle>Fund source distribution</CardTitle>
            </header>
            <div className="space-y-3 p-4">
              {FINANCE.fundSources.map((src) => (
                <div
                  key={src.label}
                  className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-[var(--text-sm)]"
                >
                  <span className="text-[var(--color-text-primary)]">{src.label}</span>
                  <span className="relative h-2 rounded-full bg-[var(--color-background-brand-subtle)]">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-chart-1)] transition-[width] duration-300 ease-out"
                      style={{ width: `${src.share}%` }}
                    />
                  </span>
                  <span className="text-right tabular-nums font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {src.share}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ------- Section 7 · Infrastructure (4 KPIs · then 8+4 detail) ------- */}
      <section aria-label="Infrastructure" className="mt-8">
        <SectionHeading
          eyebrow="Infrastructure & assets"
          title="Where does capacity need capex?"
          href="#"
        />
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Student–classroom ratio"
            value={INFRA.classroomRatio}
            icon="🏫"
            tone="danger"
            trend={{
              label: `Above target (${INFRA.classroomRatioTarget})`,
              direction: "up",
              tone: "danger",
            }}
          />
          <KPICard
            label="Smart classrooms"
            value={INFRA.smartClassroomsInstalled.toLocaleString("en-IN")}
            icon="💻"
            tone="brand"
            context={`Target · ${INFRA.smartClassroomsTarget.toLocaleString("en-IN")} by 2027`}
          />
          <KPICard
            label="ICT enabled"
            value={INFRA.ictEnabledPct}
            icon="📡"
            tone="success"
            context="Colleges connected"
          />
          <KPICard
            label="Lab utilisation"
            value={INFRA.labUtilizationPct}
            icon="🧪"
            tone="warning"
            context="Average weekly usage"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card padded={false} className="lg:col-span-8">
            <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] p-4">
              <div>
                <CardTitle>Priority CAPEX requirements</CardTitle>
                <CardBody className="mt-1">Top-priority asset requirements pending funding or procurement.</CardBody>
              </div>
              <Badge tone="neutral">{CAPEX_REQUIREMENTS.length} items</Badge>
            </header>
            <ul className="divide-y divide-[var(--color-border-subtle)]">
              {CAPEX_REQUIREMENTS.map((row) => (
                <li
                  key={row.asset}
                  className="grid grid-cols-[1.5fr_1fr_1fr_6rem_1fr] items-center gap-3 px-4 py-3 text-[var(--text-sm)]"
                >
                  <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {row.asset}
                  </span>
                  <span className="text-[var(--color-text-secondary)]">{row.quantity}</span>
                  <span className="text-[var(--color-text-primary)] tabular-nums">{row.estCostCr}</span>
                  <Badge tone={row.priority === "High" ? "danger" : "warning"}>
                    {row.priority}
                  </Badge>
                  <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{row.status}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card padded={false} className="lg:col-span-4">
            <header className="border-b border-[var(--color-border-subtle)] p-4">
              <CardTitle>ICT infrastructure</CardTitle>
            </header>
            <div className="space-y-4 p-4">
              <SplitBar label="Wi-Fi campus" value={INFRA.wifiCampusPct} tone="brand" />
              <SplitBar label="Comp. labs (&gt;20 PCs)" value={INFRA.computerLabsPct} tone="success" />
              <SplitBar label="Power backup" value={INFRA.powerBackupPct} tone="danger" />
              <p className="rounded-[var(--radius-md)] bg-[var(--color-status-danger-bg)] p-3 text-[var(--text-xs)] text-[var(--color-status-danger-fg)]">
                <span aria-hidden="true" className="mr-1">⚠</span>
                Critical gap in remote areas. Prioritise Lahaul &amp; Spiti, Kinnaur.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </PortalFrame>
  );
}

// ---------- Small presentational helpers ----------

function SectionHeading({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-3">
      <div className="min-w-0">
        <p className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[var(--text-xl)] font-[var(--weight-bold)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)]">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-link)] transition-colors duration-150 ease-out hover:underline underline-offset-4"
        >
          Open full view →
        </Link>
      ) : null}
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn("inline-block h-0.5 w-5 rounded-full", dashed && "border-t-2 border-dashed")}
        style={dashed ? { borderColor: color, height: 0 } : { backgroundColor: color }}
      />
      <span className="text-[var(--color-text-secondary)]">{label}</span>
    </span>
  );
}

function AlertRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "success" | "warning" | "danger";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

function SplitBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "success" | "warning" | "danger";
}) {
  const barTone: Record<typeof tone, string> = {
    brand: "bg-[var(--color-chart-1)]",
    success: "bg-[var(--color-chart-2)]",
    warning: "bg-[var(--color-chart-3)]",
    danger: "bg-[var(--color-chart-4)]",
  };
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
          className={cn("h-full rounded-full transition-[width] duration-300 ease-out", barTone[tone])}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
