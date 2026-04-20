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
import { maxPreferencesFor } from "./rules";

export interface ApplicationDraft {
  courseId: string;
  itemIds: string[];
  updatedAt?: number;
}

type ApplicationsMap = Record<string, ApplicationDraft>;

interface ApplicationsContextValue {
  applications: ApplicationsMap;
  getDraft: (courseId: string) => ApplicationDraft;
  count: (courseId: string) => number;
  has: (courseId: string, itemId: string) => boolean;
  /** Add when there is room; no-ops silently when the course is at its max. */
  add: (courseId: string, itemId: string) => boolean;
  remove: (courseId: string, itemId: string) => void;
  toggle: (courseId: string, itemId: string) => void;
  moveUp: (courseId: string, itemId: string) => void;
  moveDown: (courseId: string, itemId: string) => void;
  clear: (courseId: string) => void;
}

const STORAGE_KEY = "hp-mis:applications";
const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

function emptyDraft(courseId: string): ApplicationDraft {
  return { courseId, itemIds: [] };
}

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<ApplicationsMap>({});
  const hydrated = useRef(false);
  const writeTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setApplications(JSON.parse(raw) as ApplicationsMap);
    } catch {
      /* start fresh on corrupted state */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    }, 200);
    return () => {
      if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    };
  }, [applications]);

  const getDraft = useCallback<ApplicationsContextValue["getDraft"]>(
    (courseId) => applications[courseId] ?? emptyDraft(courseId),
    [applications],
  );

  const count = useCallback<ApplicationsContextValue["count"]>(
    (courseId) => getDraft(courseId).itemIds.length,
    [getDraft],
  );

  const has = useCallback<ApplicationsContextValue["has"]>(
    (courseId, itemId) => getDraft(courseId).itemIds.includes(itemId),
    [getDraft],
  );

  const patch = useCallback(
    (courseId: string, next: ApplicationDraft) => {
      setApplications((prev) => ({ ...prev, [courseId]: { ...next, updatedAt: Date.now() } }));
    },
    [],
  );

  const add = useCallback<ApplicationsContextValue["add"]>(
    (courseId, itemId) => {
      const draft = applications[courseId] ?? emptyDraft(courseId);
      if (draft.itemIds.includes(itemId)) return true;
      if (draft.itemIds.length >= maxPreferencesFor(courseId)) return false;
      patch(courseId, { ...draft, itemIds: [...draft.itemIds, itemId] });
      return true;
    },
    [applications, patch],
  );

  const remove = useCallback<ApplicationsContextValue["remove"]>(
    (courseId, itemId) => {
      const draft = applications[courseId] ?? emptyDraft(courseId);
      if (!draft.itemIds.includes(itemId)) return;
      patch(courseId, { ...draft, itemIds: draft.itemIds.filter((id) => id !== itemId) });
    },
    [applications, patch],
  );

  const toggle = useCallback<ApplicationsContextValue["toggle"]>(
    (courseId, itemId) => {
      if (has(courseId, itemId)) remove(courseId, itemId);
      else add(courseId, itemId);
    },
    [add, has, remove],
  );

  const moveUp = useCallback<ApplicationsContextValue["moveUp"]>(
    (courseId, itemId) => {
      const draft = applications[courseId] ?? emptyDraft(courseId);
      const i = draft.itemIds.indexOf(itemId);
      if (i <= 0) return;
      const next = [...draft.itemIds];
      const current = next[i];
      const above = next[i - 1];
      if (!current || !above) return;
      next[i - 1] = current;
      next[i] = above;
      patch(courseId, { ...draft, itemIds: next });
    },
    [applications, patch],
  );

  const moveDown = useCallback<ApplicationsContextValue["moveDown"]>(
    (courseId, itemId) => {
      const draft = applications[courseId] ?? emptyDraft(courseId);
      const i = draft.itemIds.indexOf(itemId);
      if (i < 0 || i >= draft.itemIds.length - 1) return;
      const next = [...draft.itemIds];
      const current = next[i];
      const below = next[i + 1];
      if (!current || !below) return;
      next[i] = below;
      next[i + 1] = current;
      patch(courseId, { ...draft, itemIds: next });
    },
    [applications, patch],
  );

  const clear = useCallback<ApplicationsContextValue["clear"]>(
    (courseId) => {
      patch(courseId, emptyDraft(courseId));
    },
    [patch],
  );

  const value = useMemo<ApplicationsContextValue>(
    () => ({ applications, getDraft, count, has, add, remove, toggle, moveUp, moveDown, clear }),
    [applications, getDraft, count, has, add, remove, toggle, moveUp, moveDown, clear],
  );

  return <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>;
}

export function useApplications(): ApplicationsContextValue {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error("useApplications must be used inside <ApplicationsProvider>");
  return ctx;
}
