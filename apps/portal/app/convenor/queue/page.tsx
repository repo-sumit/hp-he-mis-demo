"use client";

import Link from "next/link";
import { Card, CardBody, CardTitle } from "@hp-mis/ui";
import { PortalFrame } from "../../_components/portal-frame";
import { SummaryStrip } from "../../_components/admin/summary-strip";
import {
  ScrutinyProvider,
  useScrutiny,
} from "../../_components/data/scrutiny-provider";
import { MOCK_APPLICATIONS } from "../../_components/data/mock-applications";
import { StatusPill } from "../../_components/admin/status-pill";
import { formatRelative } from "../../_components/admin/format";

/**
 * Convenor queue — flagged applications waiting for a second-level review
 * before they enter the state merit pool. In the mock data we use the
 * `discrepancy_raised` status as the "flagged for convenor" proxy.
 */
export default function ConvenorQueuePage() {
  return (
    <ScrutinyProvider>
      <ConvenorQueueInner />
    </ScrutinyProvider>
  );
}

function ConvenorQueueInner() {
  const { effectiveStatus } = useScrutiny();
  const flagged = MOCK_APPLICATIONS.filter(
    (app) => effectiveStatus(app.id) === "discrepancy_raised",
  );

  const decidedThisWeek = 0; // wire to real action log in a later sprint

  return (
    <PortalFrame
      active="convenor_queue"
      eyebrow="Convenor · Second-level review"
      title="Convenor queue"
    >
      <SummaryStrip
        tiles={[
          { label: "Flagged to me", value: flagged.length, tone: "warning" },
          { label: "Decided this week", value: decidedThisWeek },
        ]}
      />

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>How this queue works</CardTitle>
          <CardBody>
            Colleges forward edge-case applications (SGC claims, tribal-quota
            disputes, borderline marks) here before they enter the state merit pool.
            You can approve or send back with a note — you don't make admission
            decisions directly.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>SLA timer</CardTitle>
          <CardBody>
            {flagged[0]
              ? `Oldest flagged application: ${formatRelative(flagged[0].submittedAt)}`
              : "Nothing waiting right now."}
          </CardBody>
        </Card>
      </section>

      <section className="mt-6 space-y-3">
        <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          Flagged applications
        </h3>
        {flagged.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] px-4 py-5 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Nothing waiting — colleges haven't forwarded anything to the convenor yet.
          </p>
        ) : (
          flagged.map((app) => (
            <article
              key={app.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                  {app.studentName}
                </p>
                <p className="font-mono text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                  {app.id}
                </p>
                <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                  {app.courseCode} · {app.collegeName} ·{" "}
                  {formatRelative(app.submittedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={effectiveStatus(app.id)} />
                <Link
                  href={`/applications/${app.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
                >
                  Review →
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </PortalFrame>
  );
}
