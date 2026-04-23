"use client";

import { Badge, Card, CardBody, CardTitle, Table, TableShell, TBody, TD, TH, THead, TR } from "@hp-mis/ui";
import { PortalFrame } from "../../_components/portal-frame";
import { SummaryStrip } from "../../_components/admin/summary-strip";
import {
  ALERT_SUMMARY,
  COMMAND_CENTER_ALERTS,
  DECISION_INSIGHTS,
} from "../../_components/admin/insights/insights-data";
import { useSession } from "../../_components/data/session-provider";

const SEVERITY_TONE = {
  critical: "danger",
  warning: "warning",
  info: "info",
} as const;

const SEVERITY_LABEL = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
} as const;

export default function StateAlertsPage() {
  const { session, hydrated } = useSession();

  if (hydrated && session.role !== "state_admin") {
    return (
      <PortalFrame active="overview" eyebrow="Policy alerts" title="Alerts">
        <Card>
          <CardTitle>Role required</CardTitle>
          <CardBody>
            Policy alerts are restricted to State Admin. Switch roles to continue.
          </CardBody>
        </Card>
      </PortalFrame>
    );
  }

  return (
    <PortalFrame
      active="overview"
      eyebrow="Policy alerts & decision support · Cycle 2026-27"
      title="Policy Alerts"
      breadcrumbs={[{ label: "Command Center", href: "/" }, { label: "Alerts" }]}
      breadcrumbsBackHref="/"
      banner={{
        title: "Policy alerts & decision support",
        eyebrow: "Directorate of Higher Education",
        actions: (
          <Badge tone="success" dot>
            System online · Last updated 2 mins ago
          </Badge>
        ),
      }}
    >
      <SummaryStrip
        tiles={[
          { label: "Critical alerts", value: ALERT_SUMMARY.critical, tone: "danger" },
          { label: "Warnings", value: ALERT_SUMMARY.warnings, tone: "warning" },
          { label: "Pending reviews", value: ALERT_SUMMARY.pendingReviews, tone: "brand" },
          { label: "Resolved · this week", value: ALERT_SUMMARY.resolvedThisWeek, tone: "success" },
        ]}
      />

      <section className="mt-6">
        <Card padded={false}>
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
            <div>
              <CardTitle>Active alerts feed</CardTitle>
              <CardBody className="mt-1">
                Every open alert across the state. Status and SLA reflect the current
                resolution stage.
              </CardBody>
            </div>
            <Badge tone="neutral">{COMMAND_CENTER_ALERTS.length} active</Badge>
          </div>
          <TableShell className="rounded-none border-0 shadow-none">
            <Table>
              <THead>
                <TR>
                  <TH>Alert</TH>
                  <TH className="w-32">Severity</TH>
                  <TH>Scope</TH>
                  <TH>Status</TH>
                  <TH>SLA</TH>
                  <TH>Raised</TH>
                </TR>
              </THead>
              <TBody>
                {COMMAND_CENTER_ALERTS.map((alert) => (
                  <TR key={alert.id} id={alert.id}>
                    <TD className="align-top">
                      <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {alert.title}
                      </p>
                      <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                        {alert.description}
                      </p>
                    </TD>
                    <TD className="align-top">
                      <Badge tone={SEVERITY_TONE[alert.severity]}>
                        {SEVERITY_LABEL[alert.severity]}
                      </Badge>
                    </TD>
                    <TD className="align-top">
                      {alert.tags && alert.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {alert.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-[var(--radius-sm)] bg-[var(--color-background-muted)] px-2 py-1 text-[var(--text-2xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-secondary)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-tertiary)]">—</span>
                      )}
                    </TD>
                    <TD className="align-top text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      {alert.status ?? "—"}
                    </TD>
                    <TD className="align-top text-[var(--text-xs)] text-[var(--color-text-primary)]">
                      {alert.sla ?? "—"}
                    </TD>
                    <TD className="align-top whitespace-nowrap text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                      {alert.timeAgo}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableShell>
        </Card>
      </section>

      <section className="mt-6">
        <Card padded={false}>
          <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
            <CardTitle>Recommended actions</CardTitle>
            <CardBody className="mt-1">
              Decision-intelligence recommendations derived from the active alert set.
            </CardBody>
          </div>
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {DECISION_INSIGHTS.map((decision) => (
              <li key={decision.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                      {decision.title}
                    </p>
                    <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      {decision.contexts.join(" · ")}
                    </p>
                  </div>
                  <Badge
                    tone={
                      decision.priority === "Critical"
                        ? "danger"
                        : decision.priority === "High"
                          ? "warning"
                          : "brand"
                    }
                  >
                    {decision.priority}
                  </Badge>
                </div>
                <ul className="mt-3 grid gap-1 text-[var(--text-sm)] text-[var(--color-text-primary)] sm:grid-cols-2 sm:gap-x-6">
                  {decision.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[var(--color-interactive-primary)]"
                      />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </PortalFrame>
  );
}
