import type { HTMLAttributes, TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "./cn";

/**
 * Low-level table primitives that read tokens directly. The typical pattern:
 *
 *   <TableShell>
 *     <Table>
 *       <THead><TR><TH>…</TH></TR></THead>
 *       <TBody><TR><TD>…</TD></TR></TBody>
 *     </Table>
 *   </TableShell>
 *
 * Callers render their own rows so this stays usable across the portal.
 */

export interface TableShellProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Keep the horizontal overflow indicator (a soft inner shadow on the
   * right edge) on dense tables so users notice they can scroll. Defaults
   * to true — safe to leave on because it only renders when content
   * actually overflows.
   */
  overflowHint?: boolean;
}

export function TableShell({
  className,
  children,
  overflowHint = true,
  ...props
}: TableShellProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-table-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]",
        overflowHint && "[scrollbar-gutter:stable]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        "w-full border-collapse text-left text-[var(--text-sm)] text-[var(--color-text-primary)]",
        className,
      )}
      {...props}
    />
  );
}

export interface THeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** Pin the header row while the table body scrolls. Use sparingly. */
  sticky?: boolean;
}

export function THead({ className, sticky, ...props }: THeadProps) {
  return (
    <thead
      className={cn(
        "bg-[var(--color-table-header-bg)] text-[var(--color-table-header-fg)]",
        sticky && "sticky top-0 z-10 shadow-[inset_0_-1px_0_var(--color-table-border)]",
        className,
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        "divide-y divide-[var(--color-table-border)]",
        className,
      )}
      {...props}
    />
  );
}

export interface TRProps extends HTMLAttributes<HTMLTableRowElement> {
  /**
   * Marks the row as interactive (wraps a navigation or opens a detail
   * view). Adds a slightly stronger hover + cursor affordance. Rows that
   * only contain inline actions should leave this off.
   */
  clickable?: boolean;
}

export function TR({ className, clickable, ...props }: TRProps) {
  return (
    <tr
      data-clickable={clickable ? "" : undefined}
      className={cn(
        "transition-colors duration-150 ease-out",
        clickable
          ? "cursor-pointer hover:bg-[var(--color-background-brand-softer)]"
          : "hover:bg-[var(--color-background-brand-softer)]",
        className,
      )}
      {...props}
    />
  );
}

export function TH({ className, scope = "col", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn(
        "px-4 py-3 text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)]",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle text-[var(--text-sm)] text-[var(--color-text-primary)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableEmpty({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-t border-[var(--color-table-border)] px-6 py-10 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
