"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Mock session layer for the portal. V1 demo is restricted to two roles:
 * State Admin (DHE) and College Admin (Principal + scrutiny operators).
 * Finance, Convenor, and Leadership are out of scope for this release and
 * have been removed from the role switcher.
 */

export type PortalRole = "state_admin" | "college_admin";

export interface PortalSession {
  role: PortalRole;
  name: string;
  email: string;
  /** Set for college-scoped roles; otherwise undefined. */
  collegeId?: string;
  collegeName?: string;
}

/** Demo presets exposed in the role switcher. One realistic identity per role. */
export const SESSION_PRESETS: Record<PortalRole, PortalSession> = {
  state_admin: {
    role: "state_admin",
    name: "Ritu Sharma",
    email: "admissions-secretary@hp.gov.in",
  },
  college_admin: {
    role: "college_admin",
    name: "Dr. Ravi Thakur",
    email: "principal@gcsanjauli.ac.in",
    collegeId: "gc_sanjauli",
    collegeName: "Government College Sanjauli",
  },
};

export const ROLE_LABELS: Record<PortalRole, string> = {
  state_admin: "State Admin",
  college_admin: "College Admin",
};

interface SessionContextValue {
  session: PortalSession;
  setRole: (role: PortalRole) => void;
  hydrated: boolean;
}

const STORAGE_KEY = "hp-mis:portal-session";
const SessionContext = createContext<SessionContextValue | null>(null);

function isPortalRole(value: string): value is PortalRole {
  return value in SESSION_PRESETS;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  // Default to college admin — the most common demo entry point.
  const [session, setSession] = useState<PortalSession>(SESSION_PRESETS.college_admin);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw && isPortalRole(raw)) {
        setSession(SESSION_PRESETS[raw]);
      }
    } catch {
      /* default on corrupt storage */
    }
    setHydrated(true);
  }, []);

  const setRole = useCallback((role: PortalRole) => {
    const next = SESSION_PRESETS[role];
    setSession(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, role);
    } catch {
      /* ignore quota */
    }
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, setRole, hydrated }),
    [session, setRole, hydrated],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
