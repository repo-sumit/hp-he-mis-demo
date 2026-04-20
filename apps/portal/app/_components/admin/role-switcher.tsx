"use client";

import {
  ROLE_LABELS,
  SESSION_PRESETS,
  useSession,
  type PortalRole,
} from "../data/session-provider";

const ROLE_ORDER: PortalRole[] = [
  "state_admin",
  "college_admin",
  "college_operator",
  "convenor",
  "finance",
  "leadership",
];

/**
 * Demo-only role switcher rendered in the portal top bar. Flips the mock
 * SessionProvider so presenters can move between "State Admin" and
 * "College Operator" in one click and show how the same portal code renders
 * differently per role.
 */
export function RoleSwitcher() {
  const { session, setRole } = useSession();

  return (
    <label className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
      <span className="uppercase tracking-wide">Role</span>
      <select
        value={session.role}
        onChange={(event) => setRole(event.target.value as PortalRole)}
        className="h-9 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30"
      >
        {ROLE_ORDER.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
      <span className="hidden text-[var(--text-xs)] text-[var(--color-text-tertiary)] sm:inline">
        · {session.name}
        {SESSION_PRESETS[session.role].collegeName
          ? ` · ${SESSION_PRESETS[session.role].collegeName}`
          : ""}
      </span>
    </label>
  );
}
