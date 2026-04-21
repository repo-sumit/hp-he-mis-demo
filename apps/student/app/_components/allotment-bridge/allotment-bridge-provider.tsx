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
  ALLOCATION_STORAGE_KEY,
  findStudentAllocation,
  generateRollNumber,
  isMeritPublished,
  loadAllocationMap,
  loadMeritMap,
  persistAllocationMap,
  setStudentResponse,
  type AllocationEntry,
  type AllocationOverlayMap,
  type AllotmentResponse,
  type MeritOverlayMap,
} from "@hp-mis/shared-mock";

/**
 * Student-side bridge over the portal's allocation overlay. Mirrors the
 * scrutiny-bridge pattern: hydrates from localStorage on mount, listens to
 * storage events for cross-tab sync, and exposes focused selectors for the
 * allotment + payment pages. Mutators write back to the same overlay so the
 * portal's allocation page reflects the student's response on the next
 * render (or next reload, across dev-server origins).
 *
 * Demo binding: `allocationFor(courseId)` uses `findStudentAllocation`'s
 * default — top-ranked entry — so the student persona naturally maps onto
 * Asha Sharma (#147) for BA, Rohit Thakur for BSc Non-Med, etc. No auth
 * layer required.
 */

interface AllotmentBridgeValue {
  hydrated: boolean;
  /** The allocation entry assigned to this student for the given course. */
  allocationFor: (courseId: string) => AllocationEntry | null;
  /** True if merit has been published for the course (enables "waiting" vs
   *  "not started" copy on the student side). */
  meritPublishedFor: (courseId: string) => boolean;
  /** Record the student's response (freeze/float/decline). Returns the
   *  updated entry or null if no allocation exists. */
  setResponse: (
    courseId: string,
    response: Extract<AllotmentResponse, "freeze" | "float" | "decline">,
  ) => AllocationEntry | null;
  /** Mark fee paid + admission confirmed, generating a roll number on the
   *  entry. Returns the updated entry with rollNumber set. */
  markAdmissionConfirmed: (
    courseId: string,
    courseCode: string,
  ) => AllocationEntry | null;
}

const AllotmentBridgeContext = createContext<AllotmentBridgeValue | null>(null);

export function AllotmentBridgeProvider({ children }: { children: ReactNode }) {
  const [allocationMap, setAllocationMap] = useState<AllocationOverlayMap>({});
  const [meritMap, setMeritMap] = useState<MeritOverlayMap>({});
  const [hydrated, setHydrated] = useState(false);
  const writeTimer = useRef<number | null>(null);

  // Hydrate from the shared storage keys.
  useEffect(() => {
    setAllocationMap(loadAllocationMap());
    setMeritMap(loadMeritMap());
    setHydrated(true);
  }, []);

  // Cross-tab sync — picks up portal writes on a different tab / port
  // within the same origin. Across origins (dev: 3001 vs 3002) this is a
  // best-effort hook; a manual refresh still works.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === ALLOCATION_STORAGE_KEY) setAllocationMap(loadAllocationMap());
      if (e.key === "hp-mis:merit") setMeritMap(loadMeritMap());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist allocation back to shared storage, debounced.
  useEffect(() => {
    if (!hydrated) return;
    if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => {
      persistAllocationMap(allocationMap);
    }, 200);
    return () => {
      if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    };
  }, [allocationMap, hydrated]);

  const allocationFor = useCallback(
    (courseId: string): AllocationEntry | null => {
      return findStudentAllocation(allocationMap[courseId]);
    },
    [allocationMap],
  );

  const meritPublishedFor = useCallback(
    (courseId: string) => isMeritPublished(meritMap, courseId),
    [meritMap],
  );

  const setResponse = useCallback<AllotmentBridgeValue["setResponse"]>(
    (courseId, response) => {
      const current = findStudentAllocation(allocationMap[courseId]);
      if (!current) return null;
      const next = setStudentResponse(
        allocationMap,
        courseId,
        current.applicationId,
        response,
      );
      setAllocationMap(next);
      return findStudentAllocation(next[courseId]);
    },
    [allocationMap],
  );

  const markAdmissionConfirmed = useCallback<
    AllotmentBridgeValue["markAdmissionConfirmed"]
  >(
    (courseId, courseCode) => {
      const current = findStudentAllocation(allocationMap[courseId]);
      if (!current) return null;
      const rollNumber = current.rollNumber ?? generateRollNumber(current, courseCode);
      const next = setStudentResponse(
        allocationMap,
        courseId,
        current.applicationId,
        "admission_confirmed",
        rollNumber,
      );
      setAllocationMap(next);
      return findStudentAllocation(next[courseId]);
    },
    [allocationMap],
  );

  const value = useMemo<AllotmentBridgeValue>(
    () => ({
      hydrated,
      allocationFor,
      meritPublishedFor,
      setResponse,
      markAdmissionConfirmed,
    }),
    [hydrated, allocationFor, meritPublishedFor, setResponse, markAdmissionConfirmed],
  );

  return (
    <AllotmentBridgeContext.Provider value={value}>
      {children}
    </AllotmentBridgeContext.Provider>
  );
}

export function useAllotmentBridge(): AllotmentBridgeValue {
  const ctx = useContext(AllotmentBridgeContext);
  if (!ctx) {
    throw new Error(
      "useAllotmentBridge must be used inside <AllotmentBridgeProvider>",
    );
  }
  return ctx;
}
