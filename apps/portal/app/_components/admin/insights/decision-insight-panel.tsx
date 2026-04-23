"use client";

import Link from "next/link";
import { Badge, Card, CardBody, CardTitle, cn } from "@hp-mis/ui";
import type { DecisionInsight, DecisionPriority } from "./insights-data";

interface Props {
  insights: readonly DecisionInsight[];
  /** Optional section intro shown above the card grid. */
  title?: string;
  eyebrow?: string;
  description?: string;
}

const PRIORITY_TONE: Record<DecisionPriority, "danger" | "warning" | "brand"> = {
  Critical: "danger",
  High: "warning",
  Medium: "brand",
};

const PRIORITY_STRIPE: Record<DecisionPriority, string> = {
  Critical: "bg-[var(--color-interactive-danger)]",
  High: "bg-[var(--color-status-warning-fg)]",
  Medium: "bg-[var(--color-interactive-primary)]",
};

/**
 * Decision-intelligence layer — sits directly below the insights-and-alerts
 * row and tells the admin "what to do next" about the biggest active
 * problems. Each card states the problem, quantifies impact, proposes
 * concrete actions, and offers a drill-down CTA.
 */
export function DecisionInsightPanel({
  insights,
  title = "What should we act on?",
  eyebrow = "Decision intelligence",
  description = "Top recommendations surfaced from active alerts and data patterns.",
}: Props) {
  return (
    <section aria-label="Decision intelligence">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-3">
        <div className="min-w-0">
          <p className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-[var(--text-xl)] font-[var(--weight-bold)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        <Badge tone="brand">{insights.length} active</Badge>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {insights.map((insight) => (
          <DecisionCard key={insight.id} insight={insight} />
        ))}
      </div>
    </section>
  );
}

function DecisionCard({ insight }: { insight: DecisionInsight }) {
  return (
    <Card padded={false} className="relative flex h-full flex-col overflow-hidden">
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1", PRIORITY_STRIPE[insight.priority])}
      />
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-[var(--text-lg)]">{insight.title}</CardTitle>
          {insight.contexts.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {insight.contexts.map((ctx, i) => (
                <span
                  key={i}
                  className="inline-flex rounded-[var(--radius-sm)] bg-[var(--color-background-muted)] px-2 py-1 text-[var(--text-2xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-secondary)]"
                >
                  {ctx}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <Badge tone={PRIORITY_TONE[insight.priority]}>{insight.priority}</Badge>
      </header>

      <CardBody className="mt-4 flex-1 space-y-4 px-5">
        <section>
          <h4 className="text-[var(--text-2xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            Impact
          </h4>
          <ul className="mt-2 space-y-1.5 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)]">
            {insight.impact.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[var(--color-status-warning-fg)]"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="text-[var(--text-2xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            Recommendation
          </h4>
          <ul className="mt-2 space-y-1.5 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)]">
            {insight.recommendations.map((line, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full bg-[var(--color-interactive-primary)]"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </CardBody>

      <footer className="flex items-center justify-end border-t border-[var(--color-border-subtle)] px-5 py-3">
        <Link
          href={insight.cta.href}
          className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 py-1.5 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-brand)] transition-[background-color,border-color] duration-150 ease-out hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
        >
          {insight.cta.label}
          <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </Card>
  );
}
