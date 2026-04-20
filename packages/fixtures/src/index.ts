/**
 * Seed data for demo fixtures. Populated in Sprint 1/2; this file exposes
 * the shape so apps can import it without a runtime dependency on the mock API.
 */
import type { AdmissionCycle, College, Course } from "@hp-mis/types";

export const demoCycle: AdmissionCycle = {
  id: "cycle-2026-27",
  name: "2026-27 Admissions",
  academicYear: "2026-27",
  isCurrent: true,
};

export const demoColleges: College[] = [];
export const demoCourses: Course[] = [];
