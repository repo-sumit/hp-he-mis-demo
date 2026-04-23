"use client";

import { useMemo } from "react";
import type { AllocationEntry } from "@hp-mis/shared-mock";
import type { StatusStep } from "./status-tracker";
import { useApplications } from "./apply/applications-provider";
import { useAllotmentBridge } from "./allotment-bridge/allotment-bridge-provider";
import { useProfile } from "./profile/profile-provider";
import { useDemoProgress } from "./demo-progress/demo-progress-provider";
import { hasEnoughProfile } from "./discover/evaluate";
import { getCollege, offeringsFor } from "./discover/mock-data";
import { feeFor } from "./apply/rules";

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
  /**
   * Effective allocation for the first submitted course. Real entry from
   * the bridge when present; otherwise a read-only demo entry synthesised
   * from the offering catalog when an operator forces `allotted` /
   * `admissionConfirmed`. Null when neither applies.
   */
  firstAllocation: AllocationEntry | null;
  /** True when merit has been published for the first submitted course. */
  firstMeritPublished: boolean;
}

/**
 * Build a read-only AllocationEntry from the offering catalog so the
 * dashboard / allotment / payment pages can render the offer + fee
 * panels even though the real allocation pipeline never ran. The bridge
 * is never written from here — this is purely a display fallback.
 */
function buildDemoAllocation(
  courseId: string,
  step: StatusStep,
  applicationNumber: string | null,
  studentName: string,
): AllocationEntry | null {
  if (step !== "allotted" && step !== "admissionConfirmed") return null;
  const offering = offeringsFor(undefined, courseId)[0];
  const college = offering ? getCollege(offering.collegeId) : undefined;
  const collegeIdSeed = (college?.id ?? "demo").toUpperCase();
  return {
    applicationId: applicationNumber ?? "DEMO-APP",
    rank: 47,
    studentName: studentName || "Student",
    category: "general",
    offer: {
      collegeId: college?.id ?? "demo-college",
      collegeName: college?.name ?? "Your first preference college",
      feeAmount: feeFor(courseId),
    },
    status: step === "admissionConfirmed" ? "admission_confirmed" : "pending",
    offeredAt: Date.now(),
    rollNumber:
      step === "admissionConfirmed"
        ? `${collegeIdSeed}/2026/0047`
        : undefined,
  };
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
    const realAllocation = firstSubmittedCourseId
      ? allotment.allocationFor(firstSubmittedCourseId)
      : null;
    const firstMeritPublished = firstSubmittedCourseId
      ? allotment.meritPublishedFor(firstSubmittedCourseId)
      : false;

    const realStep: StatusStep = (() => {
      if (
        realAllocation?.status === "fee_paid" ||
        realAllocation?.status === "admission_confirmed"
      ) {
        return "admissionConfirmed";
      }
      if (realAllocation) return "allotted";
      if (firstMeritPublished) return "meritPublished";
      if (firstSubmitted) return "submitted";
      if (hasEnoughProfile(draft)) return "submitted";
      return "profileComplete";
    })();

    const step = stage ?? realStep;

    // When demo forces a stage past allotment but the real bridge never
    // wrote an allocation, synthesise one so downstream UI has a coherent
    // offer + fee + roll number to render. Real allocations always win.
    const effectiveAllocation: AllocationEntry | null =
      realAllocation ??
      (stage && firstSubmittedCourseId
        ? buildDemoAllocation(
            firstSubmittedCourseId,
            step,
            firstApplicationNumber,
            draft.fullName,
          )
        : null);

    return {
      step,
      realStep,
      isDemo: stage !== null,
      firstSubmittedCourseId,
      firstApplicationNumber,
      firstAllocation: effectiveAllocation,
      firstMeritPublished,
    };
  }, [applications, submittedCourseIds, allotment, draft, stage]);
}
