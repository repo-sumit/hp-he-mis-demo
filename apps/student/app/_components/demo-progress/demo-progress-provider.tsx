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
import type { StatusStep } from "../status-tracker";

/**
 * Demo-only progression override for the student status tracker.
 *
 * The real student flow is still driven by:
 *   - ApplicationsProvider   (submitted)
 *   - ScrutinyBridgeProvider (discrepancy / scrutiny overlay)
 *   - AllotmentBridgeProvider (merit published / allocation / fee)
 *
 * This provider sits alongside those and exposes an optional "forced"
 * `StatusStep` the dashboard can use to override its derived
 * `currentStep` during a live demo. It is intentionally isolated — when
 * `stage` is null the real flow is untouched.
 */

/** The subset of StatusSteps the operator can force from the demo control. */
export type DemoStage =
  | "submitted"
  | "underScrutiny"
  | "meritPublished"
  | "allotted"
  | "admissionConfirmed";

const DEMO_ORDER: readonly DemoStage[] = [
  "submitted",
  "underScrutiny",
  "meritPublished",
  "allotted",
  "admissionConfirmed",
];

/** Full 7-step order of the student status tracker. Used to derive the next demo stage from whatever step the UI is currently showing (real or forced). */
const FULL_ORDER: readonly StatusStep[] = [
  "registered",
  "profileComplete",
  "submitted",
  "underScrutiny",
  "meritPublished",
  "allotted",
  "admissionConfirmed",
];

const STORAGE_KEY = "hp-mis:student-demo-stage";

interface DemoProgressValue {
  /** True once initial localStorage read has finished. */
  hydrated: boolean;
  /** Active forced stage, or null when the real flow should apply. */
  stage: DemoStage | null;
  /** Force a specific stage. Pass null to drop back to the real flow. */
  setStage: (next: DemoStage | null) => void;
  /** Drop all demo overrides. Alias for setStage(null). */
  reset: () => void;
  /** Walk to the next DemoStage after the given reference step. */
  nextStageAfter: (currentStep: StatusStep) => DemoStage | null;
  /**
   * Convenience: given the dashboard's effective `currentStep`, advance one
   * step in the DEMO_ORDER sequence. No-op when already at the final stage.
   * Returns the stage that was set (or null if nothing changed).
   */
  advanceFrom: (currentStep: StatusStep) => DemoStage | null;
}

const DemoProgressContext = createContext<DemoProgressValue | null>(null);

function isDemoStage(value: string): value is DemoStage {
  return (DEMO_ORDER as readonly string[]).includes(value);
}

export function DemoProgressProvider({ children }: { children: ReactNode }) {
  const [stage, setStageState] = useState<DemoStage | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // One-time hydration from localStorage so a demo survives refreshes.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw && isDemoStage(raw)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStageState(raw);
      }
    } catch {
      /* fresh state on corrupt storage */
    }
    setHydrated(true);
  }, []);

  const writeStage = useCallback((next: DemoStage | null) => {
    setStageState(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, next);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, []);

  const nextStageAfter = useCallback(
    (currentStep: StatusStep): DemoStage | null => {
      const currentFullIdx = FULL_ORDER.indexOf(currentStep);
      // Find the first DemoStage whose position in FULL_ORDER is strictly
      // after the currentStep. This way if the dashboard is already at
      // e.g. "profileComplete" (not in DemoStage), the next demo stage is
      // "submitted".
      for (const demo of DEMO_ORDER) {
        if (FULL_ORDER.indexOf(demo) > currentFullIdx) return demo;
      }
      return null;
    },
    [],
  );

  const advanceFrom = useCallback(
    (currentStep: StatusStep): DemoStage | null => {
      const next = nextStageAfter(currentStep);
      if (!next) return null;
      writeStage(next);
      return next;
    },
    [nextStageAfter, writeStage],
  );

  const value = useMemo<DemoProgressValue>(
    () => ({
      hydrated,
      stage,
      setStage: writeStage,
      reset: () => writeStage(null),
      nextStageAfter,
      advanceFrom,
    }),
    [hydrated, stage, writeStage, nextStageAfter, advanceFrom],
  );

  return (
    <DemoProgressContext.Provider value={value}>
      {children}
    </DemoProgressContext.Provider>
  );
}

export function useDemoProgress(): DemoProgressValue {
  const ctx = useContext(DemoProgressContext);
  if (!ctx) {
    throw new Error(
      "useDemoProgress must be used inside <DemoProgressProvider>",
    );
  }
  return ctx;
}

export { DEMO_ORDER };
