/**
 * Mock application-number generator. Real format per docs/project-context.md §8.2
 * looks like `HP-ADM-2026-000147`; here we generate a 6-digit random suffix.
 */
export function makeApplicationNumber(): string {
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `HP-ADM-2026-${suffix}`;
}
