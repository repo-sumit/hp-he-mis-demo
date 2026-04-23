"use client";

import Link from "next/link";
import { Badge, Card, CardBody, CardTitle, cn } from "@hp-mis/ui";
import { PortalFrame } from "../../_components/portal-frame";
import { SummaryStrip } from "../../_components/admin/summary-strip";
import { useSession } from "../../_components/data/session-provider";
import { useScrutiny } from "../../_components/data/scrutiny-provider";
import {
  MOCK_APPLICATIONS,
  type MockApplication,
} from "../../_components/data/mock-applications";

/**
 * College-scoped landing for College Admin and College Operator roles.
 *
 * Shows the slice of the queue this college owns, plus a small alerts
 * panel, a short next-actions card, and three lightweight insights:
 *   - applications by category (general / OBC / SC / ST / EWS)
 *   - today vs yesterday submissions (compares the rolling 24h windows)
 *   - queue health (avg time-in-queue + SLA bucket counts)
 *
 * The scrutiny workbench, discrepancy flow, and queue all already exist
 * under /applications — this page is the role-appropriate "home" that
 * surfaces what needs attention without making the operator hunt.
 */
const SCRUTINY_SLA_HOURS = 72;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export default function CollegeDashboardPage() {
  const { session } = useSession();
  const { effectiveStatus, discrepancyCount } = useScrutiny();

  const collegeId = session.collegeId ?? "gc_sanjauli";
  const collegeName = session.collegeName ?? "Your college";

  const collegeApps = MOCK_APPLICATIONS.filter((app) => app.collegeId === collegeId);

  // Re-derive every metric off the scrutiny overlay so verifying a row
  // in the workbench updates these tiles immediately when the operator
  // returns.
  const buckets = bucketByEffectiveStatus(collegeApps, effectiveStatus);

  const nowMs = Date.now();
  const todayApps = collegeApps.filter((a) => nowMs - a.submittedAt < DAY_MS);
  const yesterdayApps = collegeApps.filter(
    (a) => nowMs - a.submittedAt >= DAY_MS && nowMs - a.submittedAt < 2 * DAY_MS,
  );
  const dayDelta = todayApps.length - yesterdayApps.length;

  const queueMetrics = computeQueueHealth(buckets.pending);
  const categoryBreakdown = countByCategory(collegeApps);

  const alerts = buildAlerts({
    overdue: queueMetrics.overdueCount,
    discrepancies: buckets.discrepancyRaised.length,
    awaitingResponse: collegeApps.filter((a) => discrepancyCount(a.id) > 0)
      .length,
    pending: buckets.pending.length,
  });

  return (
    <PortalFrame
      active="college_dashboard"
      eyebrow={`Cycle 2026-27 · ${collegeName}`}
      title="My college"
      banner={{
        title: collegeName,
        eyebrow: "College dashboard",
        actions: (
          <Badge tone={buckets.pending.length > 0 ? "warning" : "success"} dot>
            {buckets.pending.length > 0
              ? `${buckets.pending.length} pending scrutiny`
              : "Queue clear"}
          </Badge>
        ),
      }}
    >
      <SummaryStrip
        tiles={[
          {
            label: "Today's applications",
            value: todayApps.length,
            hint:
              dayDelta === 0
                ? "Same as yesterday"
                : dayDelta > 0
                  ? `▲ +${dayDelta} vs yesterday`
                  : `▼ ${dayDelta} vs yesterday`,
          },
          { label: "Pending scrutiny", value: buckets.pending.length, tone: "brand" },
          {
            label: "Discrepancies raised",
            value: buckets.discrepancyRaised.length,
            tone: "warning",
          },
          { label: "Verified", value: buckets.verified.length, tone: "success" },
        ]}
      />

      <section className="mt-6 grid gap-4 lg:grid-cols-12">
        {/* Next actions — primary column */}
        <Card className="lg:col-span-8">
          <CardTitle>Next actions</CardTitle>
          <CardBody>
            <NextActionList
              pending={buckets.pending.length}
              discrepancies={buckets.discrepancyRaised.length}
              overdue={queueMetrics.overdueCount}
              collegeName={collegeName}
            />
          </CardBody>
        </Card>

        {/* Alerts panel */}
        <Card className="lg:col-span-4">
          <CardTitle>Alerts</CardTitle>
          <CardBody className="mt-3">
            {alerts.length === 0 ? (
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                Nothing urgent. Queue is healthy and within SLA.
              </p>
            ) : (
              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <AlertRow key={alert.key} alert={alert} />
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* Applications by category */}
        <Card className="lg:col-span-4">
          <CardTitle>By category</CardTitle>
          <CardBody className="mt-3">
            <CategoryBars
              breakdown={categoryBreakdown}
              total={collegeApps.length}
            />
          </CardBody>
        </Card>

        {/* Today vs yesterday */}
        <Card className="lg:col-span-4">
          <CardTitle>Today vs yesterday</CardTitle>
          <CardBody className="mt-3">
            <DayCompareBlock
              today={todayApps.length}
              yesterday={yesterdayApps.length}
            />
          </CardBody>
        </Card>

        {/* Queue health */}
        <Card className="lg:col-span-4">
          <CardTitle>Queue health</CardTitle>
          <CardBody className="mt-3">
            <QueueHealthBlock
              metrics={queueMetrics}
              total={buckets.pending.length}
            />
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}

/* ============================================================ */
/* Derivation helpers                                            */
/* ============================================================ */

interface BucketResult {
  pending: MockApplication[];
  discrepancyRaised: MockApplication[];
  verified: MockApplication[];
}

function bucketByEffectiveStatus(
  apps: MockApplication[],
  effectiveStatus: (id: string) => string,
): BucketResult {
  const pending: MockApplication[] = [];
  const discrepancyRaised: MockApplication[] = [];
  const verified: MockApplication[] = [];
  for (const app of apps) {
    const status = effectiveStatus(app.id);
    if (status === "verified" || status === "conditional") {
      verified.push(app);
    } else if (status === "discrepancy_raised") {
      discrepancyRaised.push(app);
    } else if (status === "submitted" || status === "under_scrutiny") {
      pending.push(app);
    }
  }
  return { pending, discrepancyRaised, verified };
}

function countByCategory(apps: MockApplication[]) {
  const buckets: Record<string, number> = {
    general: 0,
    obc: 0,
    sc: 0,
    st: 0,
    ews: 0,
  };
  for (const app of apps) {
    buckets[app.studentCategory] = (buckets[app.studentCategory] ?? 0) + 1;
  }
  return buckets;
}

interface QueueHealthMetrics {
  /** Avg hours an item has been waiting in scrutiny. */
  avgHours: number;
  /** Within-SLA count (< 72h). */
  withinSlaCount: number;
  /** Approaching SLA (48–72h). */
  approachingCount: number;
  /** Past 72h SLA. */
  overdueCount: number;
}

function computeQueueHealth(pending: MockApplication[]): QueueHealthMetrics {
  if (pending.length === 0) {
    return {
      avgHours: 0,
      withinSlaCount: 0,
      approachingCount: 0,
      overdueCount: 0,
    };
  }
  const now = Date.now();
  let totalHours = 0;
  let withinSla = 0;
  let approaching = 0;
  let overdue = 0;
  for (const app of pending) {
    const hours = (now - app.submittedAt) / HOUR_MS;
    totalHours += hours;
    if (hours >= SCRUTINY_SLA_HOURS) overdue += 1;
    else if (hours >= 48) approaching += 1;
    else withinSla += 1;
  }
  return {
    avgHours: Math.round(totalHours / pending.length),
    withinSlaCount: withinSla,
    approachingCount: approaching,
    overdueCount: overdue,
  };
}

interface AlertItem {
  key: string;
  tone: "danger" | "warning" | "info";
  label: string;
  detail: string;
  href: string;
  cta: string;
}

function buildAlerts({
  overdue,
  discrepancies,
  awaitingResponse,
  pending,
}: {
  overdue: number;
  discrepancies: number;
  awaitingResponse: number;
  pending: number;
}): AlertItem[] {
  const list: AlertItem[] = [];
  if (overdue > 0) {
    list.push({
      key: "overdue",
      tone: "danger",
      label: `${overdue} ${overdue === 1 ? "application is" : "applications are"} past 72h SLA`,
      detail: "Pick these up first to keep the queue green.",
      href: "/applications",
      cta: "Open queue",
    });
  }
  if (discrepancies > 0) {
    list.push({
      key: "discrepancies",
      tone: "warning",
      label: `${discrepancies} ${discrepancies === 1 ? "discrepancy" : "discrepancies"} awaiting student action`,
      detail: "Track responses on the applications queue.",
      href: "/applications",
      cta: "View",
    });
  }
  if (awaitingResponse > 0 && awaitingResponse !== discrepancies) {
    list.push({
      key: "awaiting",
      tone: "info",
      label: `${awaitingResponse} ${awaitingResponse === 1 ? "applicant has" : "applicants have"} responded`,
      detail: "Re-verify uploaded documents to clear the case.",
      href: "/applications",
      cta: "Re-verify",
    });
  }
  if (list.length === 0 && pending > 0) {
    list.push({
      key: "pending",
      tone: "info",
      label: `${pending} ${pending === 1 ? "application waiting" : "applications waiting"} for scrutiny`,
      detail: "All within SLA. Steady review pace recommended.",
      href: "/applications",
      cta: "Open queue",
    });
  }
  return list;
}

/* ============================================================ */
/* Display blocks                                                */
/* ============================================================ */

function NextActionList({
  pending,
  discrepancies,
  overdue,
  collegeName,
}: {
  pending: number;
  discrepancies: number;
  overdue: number;
  collegeName: string;
}) {
  const lines: Array<{ icon: string; text: string }> = [];
  if (pending === 0 && discrepancies === 0) {
    lines.push({
      icon: "✅",
      text: `No applications waiting on ${collegeName}. Nothing to action right now — keep an eye on this page as new submissions land.`,
    });
  }
  if (overdue > 0) {
    lines.push({
      icon: "⏱",
      text: `Clear ${overdue} ${overdue === 1 ? "overdue case" : "overdue cases"} first — they're past the 72h scrutiny SLA.`,
    });
  }
  if (pending > 0) {
    lines.push({
      icon: "🔍",
      text: `Open the queue and verify ${pending} ${pending === 1 ? "pending application" : "pending applications"}.`,
    });
  }
  if (discrepancies > 0) {
    lines.push({
      icon: "⚠",
      text: `${discrepancies} ${discrepancies === 1 ? "applicant is" : "applicants are"} fixing flagged issues — re-verify when they upload.`,
    });
  }
  return (
    <>
      <ul className="space-y-2 text-[var(--text-sm)] text-[var(--color-text-primary)]">
        {lines.map((line) => (
          <li key={line.text} className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-0.5">
              {line.icon}
            </span>
            <span>{line.text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/applications"
          className="inline-flex h-[var(--button-height)] items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-interactive-primary)] px-6 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)] transition-[background-color,box-shadow,transform] duration-150 hover:bg-[var(--color-interactive-primary-hover)] hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
        >
          Open queue <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="/college/seats"
          className="inline-flex h-[var(--button-height)] items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] hover:text-[var(--color-text-brand)]"
        >
          Seat matrix
        </Link>
      </div>
    </>
  );
}

function AlertRow({ alert }: { alert: AlertItem }) {
  const wrap =
    alert.tone === "danger"
      ? "border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)]"
      : alert.tone === "warning"
        ? "border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)]"
        : "border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)]";
  const fg =
    alert.tone === "danger"
      ? "text-[var(--color-status-danger-fg)]"
      : alert.tone === "warning"
        ? "text-[var(--color-status-warning-fg)]"
        : "text-[var(--color-text-primary)]";
  return (
    <li
      className={cn(
        "rounded-[var(--radius-md)] border p-3 text-[var(--text-xs)]",
        wrap,
      )}
    >
      <p className={cn("font-[var(--weight-semibold)]", fg)}>{alert.label}</p>
      <p className="mt-1 text-[var(--color-text-secondary)]">{alert.detail}</p>
      <Link
        href={alert.href}
        className="mt-2 inline-flex items-center gap-1 text-[var(--text-2xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-brand)] hover:underline underline-offset-4"
      >
        {alert.cta} <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}

function CategoryBars({
  breakdown,
  total,
}: {
  breakdown: Record<string, number>;
  total: number;
}) {
  const order: Array<[string, string]> = [
    ["general", "General"],
    ["obc", "OBC"],
    ["sc", "SC"],
    ["st", "ST"],
    ["ews", "EWS"],
  ];
  const max = Math.max(1, ...Object.values(breakdown));
  return (
    <ul className="space-y-2">
      {order.map(([key, label]) => {
        const value = breakdown[key] ?? 0;
        const pct = (value / max) * 100;
        return (
          <li key={key} className="text-[var(--text-xs)]">
            <div className="flex items-baseline justify-between">
              <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                {label}
              </span>
              <span className="font-mono text-[var(--color-text-secondary)]">
                {value} {total > 0 ? `· ${Math.round((value / total) * 100)}%` : ""}
              </span>
            </div>
            <div
              role="presentation"
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-background-muted)]"
            >
              <div
                className="h-full rounded-full bg-[var(--color-interactive-primary)] transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function DayCompareBlock({ today, yesterday }: { today: number; yesterday: number }) {
  const delta = today - yesterday;
  const pctDelta = yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : null;
  const tone = delta > 0 ? "success" : delta < 0 ? "warning" : "neutral";
  const toneClass =
    tone === "success"
      ? "text-[var(--color-status-success-fg)]"
      : tone === "warning"
        ? "text-[var(--color-status-warning-fg)]"
        : "text-[var(--color-text-secondary)]";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[var(--text-2xs)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            Today
          </p>
          <p className="mt-1 text-[var(--text-2xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
            {today}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[var(--text-2xs)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            Yesterday
          </p>
          <p className="mt-1 font-mono text-[var(--text-base)] text-[var(--color-text-secondary)]">
            {yesterday}
          </p>
        </div>
      </div>
      <p className={cn("mt-2 text-[var(--text-xs)] font-[var(--weight-semibold)]", toneClass)}>
        {delta === 0
          ? "Steady — no change in volume."
          : delta > 0
            ? `▲ +${delta}${pctDelta !== null ? ` (+${pctDelta}%)` : ""} vs yesterday`
            : `▼ ${delta}${pctDelta !== null ? ` (${pctDelta}%)` : ""} vs yesterday`}
      </p>
    </div>
  );
}

function QueueHealthBlock({
  metrics,
  total,
}: {
  metrics: QueueHealthMetrics;
  total: number;
}) {
  if (total === 0) {
    return (
      <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        Queue is empty. Nothing in scrutiny right now.
      </p>
    );
  }
  return (
    <div>
      <p className="text-[var(--text-2xs)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
        Avg time in queue
      </p>
      <p className="mt-1 text-[var(--text-2xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
        {metrics.avgHours}h
      </p>
      <ul className="mt-3 space-y-1 text-[var(--text-xs)]">
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-interactive-success)]" />
            Within 48h
          </span>
          <span className="font-mono text-[var(--color-text-primary)]">
            {metrics.withinSlaCount}
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-status-warning-fg)]" />
            Approaching SLA (48–72h)
          </span>
          <span className="font-mono text-[var(--color-text-primary)]">
            {metrics.approachingCount}
          </span>
        </li>
        <li className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-text-danger)]" />
            Past 72h SLA
          </span>
          <span className="font-mono text-[var(--color-text-primary)]">
            {metrics.overdueCount}
          </span>
        </li>
      </ul>
    </div>
  );
}
