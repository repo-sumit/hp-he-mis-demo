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
 * Mock session layer for the portal. In V1 this is driven entirely by a
 * role-switcher in the header so demo-day presenters can flip between
 * State Admin, College Admin, Operator, Convenor, Finance, and DHE
 * Secretary in one click. A real SSO provider replaces this hook in V2+.
 */

export type PortalRole =
  | "state_admin"
  | "college_admin"
  | "college_operator"
  | "convenor"
  | "finance"
  | "leadership";

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
  college_operator: {
    role: "college_operator",
    name: "Priya Negi",
    email: "scrutiny@gcsanjauli.ac.in",
    collegeId: "gc_sanjauli",
    collegeName: "Government College Sanjauli",
  },
  convenor: {
    role: "convenor",
    name: "Prof. Anil Kaushal",
    email: "convenor@hp.gov.in",
  },
  finance: {
    role: "finance",
    name: "Neha Gupta",
    email: "finance@hp.gov.in",
  },
  leadership: {
    role: "leadership",
    name: "Secretary (DHE)",
    email: "dhe-secretary@hp.gov.in",
  },
};

export const ROLE_LABELS: Record<PortalRole, string> = {
  state_admin: "State Admin",
  college_admin: "College Admin",
  college_operator: "College Operator",
  convenor: "Convenor",
  finance: "Finance",
  leadership: "DHE Secretary",
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
  // Default to the college operator role — that's the persona the demo
  // usually opens with (Priya Negi at Sanjauli).
  const [session, setSession] = useState<PortalSession>(SESSION_PRESETS.college_operator);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw && isPortalRole(raw)) {
        setSession(SESSION_PRESETS[raw]);
      }
    } catch {
      /* default to college_operator on corrupt storage */
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
