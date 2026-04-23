"use client";

import { Badge, Card, cn } from "@hp-mis/ui";

export type AlertSeverity = "critical" | "warning" | "info";

export interface InsightAlert {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  severity: AlertSeverity;
  tags?: readonly string[];
  cta?: { label: string; href?: string };
}

interface Props {
  alerts: readonly InsightAlert[];
  urgentCount?: number;
  viewAllHref?: string;
  heading?: string;
}

const SEVERITY_GLYPH: Record<AlertSeverity, string> = {
  critical: "⚠",
  warning: "◆",
  info: "●",
};

const SEVERITY_CHIP: Record<AlertSeverity, string> = {
  critical:
    "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-fg)]",
  warning:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]",
  info: "bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]",
};

const SEVERITY_ACCENT: Record<AlertSeverity, string> = {
  critical: "bg-[var(--color-status-danger-bg)]",
  warning: "bg-[var(--color-status-warning-bg)]",
  info: "bg-[var(--color-status-info-bg)]",
};

/**
 * Right-rail alert feed for the command center. Each alert is an
 * at-a-glance card: severity glyph + title + short context + tags + time
 * + optional CTA. Critical items land first; the panel surfaces an
 * urgent-count badge and a "View all" link for drill-down.
 */
export function AlertsPanel({
  alerts,
  urgentCount,
  viewAllHref,
  heading = "Actionable Alerts",
}: Props) {
  return (
    <Card padded={false} className="overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-[var(--color-status-warning-fg)]">
            🔔
          </span>
          <h3 className="text-[var(--text-base)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
            {heading}
          </h3>
        </div>
        {urgentCount !== undefined ? (
          <Badge tone="danger">{urgentCount} Urgent</Badge>
        ) : null}
      </header>
      <ul className="divide-y divide-[var(--color-border-subtle)]">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className={cn(
              "flex items-start gap-3 px-5 py-4 transition-colors duration-150 ease-out",
              SEVERITY_ACCENT[alert.severity],
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-pill)] text-[var(--text-sm)] font-[var(--weight-bold)]",
                SEVERITY_CHIP[alert.severity],
              )}
            >
              {SEVERITY_GLYPH[alert.severity]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                  {alert.title}
                </p>
                <span className="flex-none whitespace-nowrap text-[var(--text-xxs)] text-[var(--color-text-tertiary)]">
                  {alert.timeAgo}
                </span>
              </div>
              <p className="mt-1 text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                {alert.description}
              </p>
              {alert.tags && alert.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {alert.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-2 py-1 text-[var(--text-2xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-secondary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {alert.cta ? (
                <a
                  href={alert.cta.href ?? "#"}
                  className="mt-3 inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-1 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-brand)] transition-colors duration-150 ease-out hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)]"
                >
                  {alert.cta.label}
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {viewAllHref ? (
        <div className="border-t border-[var(--color-border-subtle)] px-5 py-3 text-center">
          <a
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-link)] transition-colors duration-150 ease-out hover:underline underline-offset-4"
          >
            View all alerts <span aria-hidden="true">→</span>
          </a>
        </div>
      ) : null}
    </Card>
  );
}
