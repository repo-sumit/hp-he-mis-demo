"use client";

import { useMemo } from "react";
import type { AllocationEntry } from "@hp-mis/shared-mock";
import type { StatusStep } from "./status-tracker";
import { useApplications } from "./apply/applications-provider";
import { useAllotmentBridge } from "./allotment-bridge/allotment-bridge-provider";
import { useProfile } from "./profile/profile-provider";
import { useDemoProgress } from "./demo-progress/demo-progress-provider";
import { hasEnoughProfile } from "./discover/evaluate";

export interface EffectiveStudentStep {
  /** Step the UI should render for — demo override when active, real step otherwise. */
  step: StatusStep;
  /** Step derived purely from provider state (real flow). */
  realStep: StatusStep;
  /** True when an operator demo stage is overriding the real step. */
  isDemo: boolean;
  /** First submitted application courseId, or null. */
  firstSubmittedCourseId: string | null;
  /** First submitted application's number, or null. */
  firstApplicationNumber: string | null;
  /** Real allocation for the first submitted course, or null. */
  firstAllocation: AllocationEntry | null;
  /** True when merit has been published for the first submitted course. */
  firstMeritPublished: boolean;
}

/**
 * Single source of truth for "what step is this student on, in this demo".
 *
 * Real step is computed from the same providers the dashboard already uses
 * (Applications + Allotment bridge + Profile). When an operator forces a
 * demo stage via DemoProgressProvider, that wins for UI rendering — the
 * real provider state is left untouched so the underlying data model and
 * write paths still behave normally.
 */
export function useEffectiveStudentStep(): EffectiveStudentStep {
  const { applications, submittedCourseIds } = useApplications();
  const { draft } = useProfile();
  const allotment = useAllotmentBridge();
  const { stage } = useDemoProgress();

  return useMemo<EffectiveStudentStep>(() => {
    const ids = submittedCourseIds();
    const firstSubmitted = ids.length > 0 ? applications[ids[0]!] ?? null : null;
    const firstSubmittedCourseId = firstSubmitted?.courseId ?? null;
    const firstApplicationNumber = firstSubmitted?.applicationNumber ?? null;
    const firstAllocation = firstSubmittedCourseId
      ? allotment.allocationFor(firstSubmittedCourseId)
      : null;
    const firstMeritPublished = firstSubmittedCourseId
      ? allotment.meritPublishedFor(firstSubmittedCourseId)
      : false;

    const realStep: StatusStep = (() => {
      if (
        firstAllocation?.status === "fee_paid" ||
        firstAllocation?.status === "admission_confirmed"
      ) {
        return "admissionConfirmed";
      }
      if (firstAllocation) return "allotted";
      if (firstMeritPublished) return "meritPublished";
      if (firstSubmitted) return "submitted";
      if (hasEnoughProfile(draft)) return "submitted";
      return "profileComplete";
    })();

    return {
      step: stage ?? realStep,
      realStep,
      isDemo: stage !== null,
      firstSubmittedCourseId,
      firstApplicationNumber,
      firstAllocation,
      firstMeritPublished,
    };
  }, [applications, submittedCourseIds, allotment, draft, stage]);
}
