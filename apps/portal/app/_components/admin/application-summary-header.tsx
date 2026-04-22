"use client";

import { Badge, Card } from "@hp-mis/ui";
import type { AppBaseStatus, MockApplication } from "../data/mock-applications";
import { StatusPill } from "./status-pill";
import { formatTimestamp } from "./format";

interface Props {
  app: MockApplication;
  status: AppBaseStatus;
  discrepancyCount: number;
}

/**
 * Sticky top-of-page summary on the application detail / scrutiny /
 * discrepancy routes. Renders identity, context, and the live status pill.
 */
export function ApplicationSummaryHeader({ app, status, discrepancyCount }: Props) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-secondary)]">
              {app.id}
            </p>
            <StatusPill status={status} />
            {discrepancyCount > 0 ? (
              <Badge tone="warning">
                <span aria-hidden="true">⚠</span>
                {discrepancyCount} discrepancy
                {discrepancyCount === 1 ? "" : " items"}
              </Badge>
            ) : null}
          </div>
          <h2 className="mt-1 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
            {app.studentName}
          </h2>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {app.courseCode} · {app.collegeName} · Submitted {formatTimestamp(app.submittedAt)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-[var(--text-xs)]">
          <HeaderStat label="Category" value={app.studentCategory.toUpperCase()} />
          <HeaderStat label="Domicile" value={app.studentDomicileState} />
          <HeaderStat label="Best-of-five" value={`${app.studentBofPercentage}%`} />
          <HeaderStat label="Preferences" value={`${app.preferences.length}`} />
        </dl>
      </div>
    </Card>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--color-text-tertiary)]">{label}</dt>
      <dd className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">{value}</dd>
    </div>
  );
}
