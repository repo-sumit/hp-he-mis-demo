"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import type { AppBaseStatus, MockApplication } from "../data/mock-applications";
import { StatusPill } from "./status-pill";
import { formatRelative } from "./format";

export interface QueueRow {
  app: MockApplication;
  status: AppBaseStatus;
  discrepancyCount: number;
}

interface Props {
  rows: QueueRow[];
  emptyMessage: string;
}

/**
 * Operational queue table. Trimmed to six columns — student name is the
 * anchor, the rest of the metadata flows into the same cell so each row
 * scans as a single unit. Discrepancy count is merged into the status cell
 * to reduce visual noise; the full id moves to a muted sub-line under the
 * name so "what is this row" is answered in a single glance.
 */
export function ApplicationQueueTable({ rows, emptyMessage }: Props) {
  if (rows.length === 0) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-6 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {emptyMessage}
      </section>
    );
  }

  return (
    <section className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full min-w-[720px] border-collapse text-left text-[var(--text-sm)]">
        <thead className="bg-[var(--color-background-subtle)] text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          <tr>
            <Th>Student</Th>
            <Th>Course · College</Th>
            <Th>Category</Th>
            <Th>Status</Th>
            <Th>Submitted</Th>
            <Th className="text-right">&nbsp;</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ app, status, discrepancyCount }, idx) => {
            const isAsha = app.studentName === "Asha Sharma";
            const needsAttention = status === "discrepancy_raised" || discrepancyCount > 0;
            return (
              <tr
                key={app.id}
                className={cn(
                  "border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-background-subtle)]",
                  idx % 2 === 1 ? "bg-[var(--color-background-subtle)]/40" : "bg-[var(--color-surface)]",
                  needsAttention ? "ring-1 ring-inset ring-[var(--color-status-warning-fg)]/30" : "",
                )}
              >
                <Td>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                      {app.studentName}
                    </p>
                    {isAsha ? (
                      <span className="rounded-[var(--radius-pill)] bg-[var(--color-background-brand-subtle)] px-1.5 py-0.5 text-[10px] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-brand)]">
                        Demo hero
                      </span>
                    ) : null}
                  </div>
                  <p className="font-mono text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                    {app.id}
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                    {app.studentEmail}
                  </p>
                </Td>
                <Td>
                  <p className="font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                    {app.courseCode}
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                    {app.collegeName}
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                    {app.preferences.length} preference
                    {app.preferences.length === 1 ? "" : "s"}
                  </p>
                </Td>
                <Td>
                  <span className="inline-flex rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] px-2 py-0.5 text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-secondary)]">
                    {app.studentCategory.toUpperCase()}
                  </span>
                </Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusPill status={status} />
                    {discrepancyCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-status-warning-bg)] px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-status-warning-fg)]">
                        ⚠ {discrepancyCount}
                      </span>
                    ) : null}
                  </div>
                </Td>
                <Td>
                  <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {formatRelative(app.submittedAt)}
                  </span>
                </Td>
                <Td className="text-right">
                  <Link
                    href={`/applications/${app.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
                  >
                    Open →
                  </Link>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn("px-4 py-2.5 font-[var(--weight-semibold)]", className)}
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 align-top text-[var(--color-text-primary)]", className)}>
      {children}
    </td>
  );
}
