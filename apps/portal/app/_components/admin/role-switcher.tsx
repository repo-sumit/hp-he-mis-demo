"use client";

import { ROLE_LABELS, useSession, type PortalRole } from "../data/session-provider";

const ROLE_ORDER: PortalRole[] = ["state_admin", "college_admin"];

/**
 * Demo-only role switcher in the portal top bar — a brand-blue pill chip
 * with the active role label. Switching flips the mock SessionProvider so
 * presenters can jump between State Admin and College Admin in one click.
 * V1 scope covers these two roles only.
 */
export function RoleSwitcher() {
  const { session, setRole } = useSession();

  return (
    <label className="group relative inline-flex items-center">
      <span className="sr-only">Switch role</span>
      <span
        aria-hidden="true"
        className="pointer-events-none inline-flex h-10 items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-interactive-primary)] pl-3 pr-9 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)]"
      >
        <span
          aria-hidden="true"
          className="inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-pill)] bg-white/25 text-[var(--text-xs)]"
        >
          👤
        </span>
        <span className="max-w-[10rem] truncate">{ROLE_LABELS[session.role]}</span>
        <span className="absolute right-3 text-[var(--text-xs)]">▾</span>
      </span>
      <select
        value={session.role}
        onChange={(event) => setRole(event.target.value as PortalRole)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={`Current role: ${ROLE_LABELS[session.role]}`}
      >
        {ROLE_ORDER.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
    </label>
  );
}
