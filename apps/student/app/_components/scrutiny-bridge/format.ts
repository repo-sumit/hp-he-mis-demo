/** Relative time helper shared by bridge components. Parallel to the one in
 *  _components/documents/format.ts; kept separate so bridge code has no
 *  cross-module dependency on the documents module. */
export function formatRelative(ms: number, now: number = Date.now()): string {
  const diff = now - ms;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
