"use client";

import {
  Badge,
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
} from "@hp-mis/ui";
import {
  COLLEGES,
  COLLEGE_COUNT_BY_DISTRICT,
  getCollegeById,
  HP_DISTRICTS,
} from "@hp-mis/fixtures";
import { PortalFrame } from "../_components/portal-frame";
import { SummaryStrip } from "../_components/admin/summary-strip";
import {
  MOCK_APPLICATIONS,
  type AppBaseStatus,
} from "../_components/data/mock-applications";
import { useSession } from "../_components/data/session-provider";

const CATEGORY_LABEL: Record<string, string> = {
  general: "General",
  obc: "OBC",
  sc: "SC",
  st: "ST",
  ews: "EWS",
};

const STATUS_ORDER: readonly AppBaseStatus[] = [
  "submitted",
  "under_scrutiny",
  "discrepancy_raised",
  "verified",
  "conditional",
  "rejected",
];

const STATUS_LABEL: Record<AppBaseStatus, string> = {
  submitted: "Submitted",
  under_scrutiny: "Under scrutiny",
  discrepancy_raised: "Discrepancy",
  verified: "Verified",
  conditional: "Conditional",
  rejected: "Rejected",
};

const STATUS_TONE: Record<AppBaseStatus, "brand" | "warning" | "success" | "danger" | "neutral"> = {
  submitted: "neutral",
  under_scrutiny: "brand",
  discrepancy_raised: "warning",
  verified: "success",
  conditional: "warning",
  rejected: "danger",
};

export default function ReportsPage() {
  const { session, hydrated } = useSession();

  if (hydrated && session.role !== "state_admin" && session.role !== "college_admin") {
    return (
      <PortalFrame active="reports" eyebrow="Reports" title="Reports">
        <Card>
          <CardTitle>Role required</CardTitle>
          <CardBody>
            Reports are visible to State Admin and College Admin. Switch roles to
            continue.
          </CardBody>
        </Card>
      </PortalFrame>
    );
  }

  const isCollegeScoped = session.role === "college_admin";
  const scopedApps = isCollegeScoped
    ? MOCK_APPLICATIONS.filter((a) => a.collegeId === session.collegeId)
    : MOCK_APPLICATIONS;

  const total = scopedApps.length;

  // Status breakdown
  const byStatus = new Map<AppBaseStatus, number>();
  for (const app of scopedApps) {
    byStatus.set(app.baseStatus, (byStatus.get(app.baseStatus) ?? 0) + 1);
  }
  const statusMax = Math.max(1, ...STATUS_ORDER.map((s) => byStatus.get(s) ?? 0));

  // Category breakdown
  const byCategory = new Map<string, number>();
  for (const app of scopedApps) {
    byCategory.set(
      app.studentCategory,
      (byCategory.get(app.studentCategory) ?? 0) + 1,
    );
  }
  const categoryRows = Array.from(byCategory.entries()).sort((a, b) => b[1] - a[1]);
  const categoryMax = Math.max(1, ...categoryRows.map(([, n]) => n));

  // District breakdown (state admin only)
  const byDistrict = new Map<string, number>();
  for (const app of scopedApps) {
    const c = getCollegeById(app.collegeId);
    const d = c?.district ?? "unknown";
    byDistrict.set(d, (byDistrict.get(d) ?? 0) + 1);
  }
  const districtRows = HP_DISTRICTS.map((d) => ({
    id: d.id,
    name: d.name,
    colleges: COLLEGE_COUNT_BY_DISTRICT[d.id] ?? 0,
    apps: byDistrict.get(d.id) ?? 0,
  }))
    .filter((r) => r.colleges > 0)
    .sort((a, b) => b.apps - a.apps);
  const districtMax = Math.max(1, ...districtRows.map((r) => r.apps));

  // Seat fill by college (state admin). For college admin, skip — only their
  // own college matters and the seat matrix screen covers it.
  const collegeApps = new Map<string, number>();
  for (const app of scopedApps) {
    collegeApps.set(app.collegeId, (collegeApps.get(app.collegeId) ?? 0) + 1);
  }
  const collegeRows = COLLEGES.map((c) => ({
    id: c.id,
    name: c.name,
    district: c.district,
    sanctioned: c.totalSanctionedSeats,
    apps: collegeApps.get(c.id) ?? 0,
  }))
    .filter((row) => row.apps > 0)
    .sort((a, b) => b.apps / b.sanctioned - a.apps / a.sanctioned)
    .slice(0, 10);

  const verified = byStatus.get("verified") ?? 0;
  const pending =
    (byStatus.get("submitted") ?? 0) + (byStatus.get("under_scrutiny") ?? 0);
  const discrepancies = byStatus.get("discrepancy_raised") ?? 0;

  return (
    <PortalFrame
      active="reports"
      eyebrow={`Reports · Cycle 2026-27 · ${isCollegeScoped ? session.collegeName : "State-wide"}`}
      title="Reports"
      banner={{
        title: "Reports",
        eyebrow: isCollegeScoped
          ? `Scope · ${session.collegeName ?? "Your college"}`
          : "Scope · All HPU-167 colleges",
        actions: <Badge tone="neutral">Live · Cycle 2026-27</Badge>,
      }}
    >
      <SummaryStrip
        tiles={[
          { label: "Applications to date", value: total, tone: "brand" },
          { label: "Verified", value: verified, tone: "success" },
          { label: "Pending scrutiny", value: pending, tone: "warning" },
          { label: "Discrepancies", value: discrepancies, tone: "danger" },
        ]}
      />

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card padded={false}>
          <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
            <div>
              <CardTitle>Applications by status</CardTitle>
              <CardBody className="mt-1">
                Live scrutiny state across the current cycle.
              </CardBody>
            </div>
            <span className="whitespace-nowrap text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
              n = {total}
            </span>
          </div>
          <ul className="space-y-3 px-5 py-5">
            {STATUS_ORDER.map((status) => {
              const n = byStatus.get(status) ?? 0;
              const pct = (n / statusMax) * 100;
              const share = total > 0 ? (n / total) * 100 : 0;
              return (
                <li
                  key={status}
                  className="grid grid-cols-[10rem_1fr_5.5rem] items-center gap-3 text-[var(--text-sm)]"
                >
                  <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                  <span
                    className="relative h-2.5 rounded-full bg-[var(--color-background-brand-subtle)]"
                    aria-hidden="true"
                  >
                    <span
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full",
                        status === "verified"
                          ? "bg-[var(--color-interactive-success)]"
                          : status === "discrepancy_raised" || status === "rejected"
                            ? "bg-[var(--color-interactive-danger)]"
                            : status === "conditional"
                              ? "bg-[var(--color-status-warning-fg)]"
                              : "bg-[var(--color-interactive-primary)]",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="flex items-baseline justify-end gap-2 tabular-nums">
                    <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                      {n}
                    </span>
                    <span className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                      {share.toFixed(0)}%
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-border-subtle)] px-5 py-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
            <LegendDot className="bg-[var(--color-interactive-primary)]" label="In progress" />
            <LegendDot className="bg-[var(--color-interactive-success)]" label="Verified" />
            <LegendDot className="bg-[var(--color-status-warning-fg)]" label="Conditional" />
            <LegendDot className="bg-[var(--color-interactive-danger)]" label="Blocked" />
          </div>
        </Card>

        <Card padded={false}>
          <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
            <div>
              <CardTitle>Applications by category</CardTitle>
              <CardBody className="mt-1">
                Self-declared on the application form. Verified during scrutiny.
              </CardBody>
            </div>
            <span className="whitespace-nowrap text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
              {categoryRows.length} {categoryRows.length === 1 ? "group" : "groups"}
            </span>
          </div>
          <ul className="space-y-3 px-5 py-5">
            {categoryRows.length === 0 ? (
              <li className="text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                No applications in scope yet.
              </li>
            ) : null}
            {categoryRows.map(([cat, n]) => {
              const pct = (n / categoryMax) * 100;
              const share = total > 0 ? (n / total) * 100 : 0;
              return (
                <li
                  key={cat}
                  className="grid grid-cols-[10rem_1fr_5.5rem] items-center gap-3 text-[var(--text-sm)]"
                >
                  <Badge tone="brand" className="uppercase">
                    {CATEGORY_LABEL[cat] ?? cat}
                  </Badge>
                  <span
                    className="relative h-2.5 rounded-full bg-[var(--color-background-brand-subtle)]"
                    aria-hidden="true"
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-interactive-primary)]"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="flex items-baseline justify-end gap-2 tabular-nums">
                    <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                      {n}
                    </span>
                    <span className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                      {share.toFixed(0)}%
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        {!isCollegeScoped ? (
          <Card padded={false}>
            <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
              <CardTitle>Applications by district</CardTitle>
              <CardBody className="mt-1">
                Across HPU-167. Bars scale to the busiest district.
              </CardBody>
            </div>
            <ul className="space-y-2.5 px-5 py-5">
              {districtRows.slice(0, 8).map((row) => {
                const pct = (row.apps / districtMax) * 100;
                return (
                  <li
                    key={row.id}
                    className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-[var(--text-sm)]"
                  >
                    <span className="text-[var(--color-text-primary)]">{row.name}</span>
                    <span
                      className="relative h-2 rounded-full bg-[var(--color-background-brand-subtle)]"
                      aria-hidden="true"
                    >
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-interactive-primary)]"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="tabular-nums text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      {row.apps} · {row.colleges} {row.colleges === 1 ? "college" : "colleges"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        ) : null}

        <Card padded={false} className={cn(isCollegeScoped && "lg:col-span-2")}>
          <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
            <CardTitle>Seat fill — top 10 colleges</CardTitle>
            <CardBody className="mt-1">
              Applications received as a share of sanctioned UG seats. High fill
              indicates strong demand at that institution.
            </CardBody>
          </div>
          <TableShell className="rounded-none border-0 shadow-none">
            <Table>
              <THead>
                <TR>
                  <TH>College</TH>
                  <TH className="text-right">Sanctioned</TH>
                  <TH className="text-right">Applications</TH>
                  <TH className="text-right">Fill</TH>
                </TR>
              </THead>
              <TBody>
                {collegeRows.length === 0 ? (
                  <TR>
                    <TD className="text-center text-[var(--color-text-secondary)]" colSpan={4}>
                      No application volume yet for this scope.
                    </TD>
                  </TR>
                ) : null}
                {collegeRows.map((row) => {
                  const fill = (row.apps / row.sanctioned) * 100;
                  const tone =
                    fill >= 100 ? "danger" : fill >= 60 ? "warning" : "success";
                  return (
                    <TR key={row.id}>
                      <TD>
                        <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                          {row.name}
                        </p>
                        <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                          {row.district}
                        </p>
                      </TD>
                      <TD className="text-right tabular-nums text-[var(--color-text-secondary)]">
                        {row.sanctioned}
                      </TD>
                      <TD className="text-right tabular-nums font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {row.apps}
                      </TD>
                      <TD className="text-right">
                        <Badge tone={tone}>{fill.toFixed(0)}%</Badge>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableShell>
        </Card>
      </section>

      <p className="mt-6 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        Numbers reflect live scrutiny state. Export to CSV / XLSX and the weekly DHE
        report pack will land in a later sprint.
      </p>
    </PortalFrame>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn("inline-block h-2 w-2 rounded-full", className)}
      />
      {label}
    </span>
  );
}
