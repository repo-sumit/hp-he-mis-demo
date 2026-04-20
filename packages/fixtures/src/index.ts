/**
 * Seed data + typed scaffolding for the 2-app architecture. The HPU-167
 * dataset lands via a later import script; the types and helpers here
 * don't change when the real rows arrive.
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

export * from "./colleges";
export * from "./districts";
