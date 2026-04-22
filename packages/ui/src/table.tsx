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

export function TableShell({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-table-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]",
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

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-[var(--color-table-header-bg)] text-[var(--color-table-header-fg)]",
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

export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-[var(--color-background-brand-softer)]",
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
