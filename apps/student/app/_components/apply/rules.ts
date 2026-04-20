/**
 * Rules that govern how many preferences a course accepts and what the base
 * application fee is. Numbers align with the RFP / Sanjauli field-visit notes
 * in docs/project-context.md §2.2-2.7; for V1 they live here as mock data
 * and will move to the mock API in a later sprint.
 */

export const MAX_PREFERENCES: Readonly<Record<string, number>> = {
  ba: 6,
  bcom: 6,
  bsc_med: 3,
  bsc_nonmed: 3,
  bca: 3,
  bba: 3,
  bvoc: 3,
};

export const APPLICATION_FEES: Readonly<Record<string, number>> = {
  ba: 50,
  bcom: 50,
  bsc_med: 50,
  bsc_nonmed: 50,
  bca: 300,
  bba: 300,
  bvoc: 100,
};

const DEFAULT_MAX = 3;
const DEFAULT_FEE = 50;

export function maxPreferencesFor(courseId: string): number {
  return MAX_PREFERENCES[courseId] ?? DEFAULT_MAX;
}

export function feeFor(courseId: string): number {
  return APPLICATION_FEES[courseId] ?? DEFAULT_FEE;
}
