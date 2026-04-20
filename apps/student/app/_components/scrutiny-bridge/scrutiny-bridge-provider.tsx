"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SCRUTINY_STORAGE_KEY,
  emptyOverlay,
  generateDiscrepancyId,
  loadOverlayMap,
  persistOverlayMap,
  sortDiscrepancies,
  type AppBaseStatus,
  type DiscrepancyScope,
  type ScrutinyDiscrepancy,
  type ScrutinyOverlayMap,
} from "@hp-mis/shared-mock";
import { useApplications } from "../apply/applications-provider";

/**
 * Student-side mirror of the portal's scrutiny overlay. Reads the shared
 * localStorage key on mount and seeds a demo-friendly discrepancy against the
 * student's most recent submitted application if none exists. Exposes
 * focused selectors (by application, by scope, by document) plus the tiny
 * mutator a student can trigger — "Mark as updated" — which stamps
 * `studentActionAt` so the banner flips to the re-check state without
 * needing a real backend round-trip.
 */

export interface BridgeDiscrepancy extends ScrutinyDiscrepancy {
  applicationId: string;
}

interface BridgeContextValue {
  hydrated: boolean;
  /** All discrepancies on all applications, sorted by priority / open-first. */
  all: BridgeDiscrepancy[];
  /** Status override for a given application (if any). */
  statusFor: (applicationId: string) => AppBaseStatus | undefined;
  /** Open + sent-for-re-check discrepancies for one application. */
  byApplication: (applicationId: string) => BridgeDiscrepancy[];
  /** Discrepancies for a specific profile scope on an application. */
  byScope: (applicationId: string, scope: DiscrepancyScope) => BridgeDiscrepancy[];
  /** Discrepancies tied to a specific document code on an application. */
  byDocCode: (applicationId: string, code: string) => BridgeDiscrepancy[];
  /** Flip a discrepancy into the "sent for re-check" state (student action). */
  markStudentAction: (applicationId: string, discrepancyId: string) => void;
  /** Mark every open discrepancy on an application as student-touched. Used by
   *  the documents flow when a rejected file is re-uploaded. */
  markDocResubmitted: (applicationId: string, docCode: string) => void;
}

const BridgeContext = createContext<BridgeContextValue | null>(null);

function buildDemoDiscrepancy(applicationId: string): ScrutinyDiscrepancy {
  return {
    id: generateDiscrepancyId(),
    scope: "document",
    targetRef: "photo",
    reasonEn:
      "Passport-size photo is blurry. Seal or details are not clearly visible. Please upload a clearer photo.",
    reasonHi:
      "पासपोर्ट साइज़ फ़ोटो धुंधली है। विवरण स्पष्ट नहीं है। कृपया साफ़ फ़ोटो अपलोड करें।",
    deadline: "Friday, 26 June 2026, 5:00 PM",
    createdAt: Date.now() - 1000 * 60 * 45, // ~45 min ago
    createdBy: "Sanjauli Govt College · Scrutiny",
  };
}

function hasAnyDiscrepancyAcrossMap(map: ScrutinyOverlayMap): boolean {
  return Object.values(map).some((overlay) => overlay.discrepancies.length > 0);
}

export function ScrutinyBridgeProvider({ children }: { children: ReactNode }) {
  const { applications, hydrated: appsHydrated, submittedCourseIds } = useApplications();
  const [overlayMap, setOverlayMap] = useState<ScrutinyOverlayMap>({});
  const [hydrated, setHydrated] = useState(false);
  const seededRef = useRef(false);
  const writeTimer = useRef<number | null>(null);

  // Hydrate from the shared storage key once on mount.
  useEffect(() => {
    setOverlayMap(loadOverlayMap());
    setHydrated(true);
  }, []);

  // Persist back to shared storage, debounced.
  useEffect(() => {
    if (!hydrated) return;
    if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => {
      persistOverlayMap(overlayMap);
    }, 200);
    return () => {
      if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    };
  }, [overlayMap, hydrated]);

  // Seed demo discrepancy against the student's freshest submitted application
  // if the bridge is totally empty. This makes the loop demonstrable even when
  // the portal (on a different dev port) can't write live into our localStorage.
  useEffect(() => {
    if (!hydrated || !appsHydrated || seededRef.current) return;
    if (hasAnyDiscrepancyAcrossMap(overlayMap)) {
      seededRef.current = true;
      return;
    }
    const submittedIds = submittedCourseIds();
    if (submittedIds.length === 0) {
      // No submitted app yet — don't seed. We'll try again when one appears.
      return;
    }
    // Pick the most recently submitted course.
    const mostRecent = submittedIds
      .map((cid) => applications[cid])
      .filter((d): d is NonNullable<typeof d> => Boolean(d))
      .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0))[0];
    if (!mostRecent?.applicationNumber) return;

    const appNumber = mostRecent.applicationNumber;
    const demo = buildDemoDiscrepancy(appNumber);
    seededRef.current = true;
    setOverlayMap((prev) => {
      const current = prev[appNumber] ?? emptyOverlay();
      if (current.discrepancies.length > 0) return prev;
      return {
        ...prev,
        [appNumber]: {
          ...current,
          statusOverride: "discrepancy_raised",
          discrepancies: [...current.discrepancies, demo],
          history: [
            ...current.history,
            {
              at: demo.createdAt,
              actor: demo.createdBy,
              action: "Raised discrepancy",
              target: "photo",
              note: demo.reasonEn,
            },
          ],
        },
      };
    });
  }, [hydrated, appsHydrated, overlayMap, applications, submittedCourseIds]);

  const all = useMemo<BridgeDiscrepancy[]>(() => {
    const flat: BridgeDiscrepancy[] = [];
    for (const [applicationId, overlay] of Object.entries(overlayMap)) {
      for (const disc of overlay.discrepancies) {
        flat.push({ ...disc, applicationId });
      }
    }
    return flat.sort(sortDiscrepancies);
  }, [overlayMap]);

  const statusFor = useCallback<BridgeContextValue["statusFor"]>(
    (applicationId) => overlayMap[applicationId]?.statusOverride,
    [overlayMap],
  );

  const byApplication = useCallback<BridgeContextValue["byApplication"]>(
    (applicationId) => {
      const list = overlayMap[applicationId]?.discrepancies ?? [];
      return [...list]
        .sort(sortDiscrepancies)
        .map((d) => ({ ...d, applicationId }));
    },
    [overlayMap],
  );

  const byScope = useCallback<BridgeContextValue["byScope"]>(
    (applicationId, scope) =>
      byApplication(applicationId).filter((d) => d.scope === scope),
    [byApplication],
  );

  const byDocCode = useCallback<BridgeContextValue["byDocCode"]>(
    (applicationId, code) =>
      byApplication(applicationId).filter(
        (d) => d.scope === "document" && d.targetRef === code,
      ),
    [byApplication],
  );

  const markStudentAction = useCallback<BridgeContextValue["markStudentAction"]>(
    (applicationId, discrepancyId) => {
      setOverlayMap((prev) => {
        const current = prev[applicationId];
        if (!current) return prev;
        const next = current.discrepancies.map((d) =>
          d.id === discrepancyId && !d.studentActionAt
            ? { ...d, studentActionAt: Date.now() }
            : d,
        );
        if (next === current.discrepancies) return prev;
        return {
          ...prev,
          [applicationId]: {
            ...current,
            discrepancies: next,
            lastTouchedAt: Date.now(),
          },
        };
      });
    },
    [],
  );

  const markDocResubmitted = useCallback<BridgeContextValue["markDocResubmitted"]>(
    (applicationId, docCode) => {
      setOverlayMap((prev) => {
        const current = prev[applicationId];
        if (!current) return prev;
        let changed = false;
        const next = current.discrepancies.map((d) => {
          if (d.scope === "document" && d.targetRef === docCode && !d.studentActionAt) {
            changed = true;
            return { ...d, studentActionAt: Date.now() };
          }
          return d;
        });
        if (!changed) return prev;
        return {
          ...prev,
          [applicationId]: {
            ...current,
            discrepancies: next,
            lastTouchedAt: Date.now(),
          },
        };
      });
    },
    [],
  );

  const value = useMemo<BridgeContextValue>(
    () => ({
      hydrated,
      all,
      statusFor,
      byApplication,
      byScope,
      byDocCode,
      markStudentAction,
      markDocResubmitted,
    }),
    [
      hydrated,
      all,
      statusFor,
      byApplication,
      byScope,
      byDocCode,
      markStudentAction,
      markDocResubmitted,
    ],
  );

  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
}

export function useScrutinyBridge(): BridgeContextValue {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error("useScrutinyBridge must be used inside <ScrutinyBridgeProvider>");
  return ctx;
}

export { SCRUTINY_STORAGE_KEY };
