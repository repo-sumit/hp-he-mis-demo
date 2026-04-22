"use client";

import Link from "next/link";
import {
  Badge,
  Table,
  TableEmpty,
  TableShell,
  TBody,
  TD,
  TH,
  THead,
  TR,
  cn,
} from "@hp-mis/ui";
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
      <TableShell>
        <TableEmpty>{emptyMessage}</TableEmpty>
      </TableShell>
    );
  }

  return (
    <TableShell>
      <Table className="min-w-[var(--table-min-width-narrow)]">
        <THead>
          <TR>
            <TH>Student</TH>
            <TH>Course · College</TH>
            <TH>Category</TH>
            <TH>Status</TH>
            <TH>Submitted</TH>
            <TH className="text-right">&nbsp;</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map(({ app, status, discrepancyCount }) => {
            const isAsha = app.studentName === "Asha Sharma";
            const needsAttention = status === "discrepancy_raised" || discrepancyCount > 0;
            return (
              <TR
                key={app.id}
                className={cn(
                  needsAttention
                    ? "shadow-[inset_2px_0_0_var(--color-status-warning-fg)]"
                    : "",
                )}
              >
                <TD className="align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                      {app.studentName}
                    </p>
                    {isAsha ? <Badge tone="brand">Demo hero</Badge> : null}
                  </div>
                  <p className="font-mono text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                    {app.id}
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                    {app.studentEmail}
                  </p>
                </TD>
                <TD className="align-top">
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
                </TD>
                <TD className="align-top">
                  <Badge tone="neutral" className="uppercase">
                    {app.studentCategory.toUpperCase()}
                  </Badge>
                </TD>
                <TD className="align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={status} />
                    {discrepancyCount > 0 ? (
                      <Badge tone="warning">
                        <span aria-hidden="true">⚠</span>
                        {discrepancyCount}
                      </Badge>
                    ) : null}
                  </div>
                </TD>
                <TD className="align-top">
                  <span className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {formatRelative(app.submittedAt)}
                  </span>
                </TD>
                <TD className="text-right align-top">
                  <Link
                    href={`/applications/${app.id}`}
                    aria-label={`Open application ${app.id}`}
                    className="group/action inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-interactive-primary)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)] transition-[background-color,box-shadow] duration-150 ease-out hover:bg-[var(--color-interactive-primary-hover)] hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                  >
                    Open
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-150 ease-out group-hover/action:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </TableShell>
  );
}
