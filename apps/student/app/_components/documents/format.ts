/**
 * Small formatting helpers shared by the document screens. Kept locale-agnostic
 * on purpose — date/month names come from the Intl formatter, which picks up
 * the <html lang> set by LocaleProvider.
 */

export function formatTimestamp(ms: number, locale: "en" | "hi" = "en"): string {
  const tag = locale === "hi" ? "hi-IN" : "en-IN";
  const d = new Date(ms);
  const date = d.toLocaleDateString(tag, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString(tag, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

export function formatSize(sizeKb?: number): string {
  if (!sizeKb && sizeKb !== 0) return "";
  if (sizeKb < 1024) return `${Math.round(sizeKb)} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}

/** Short relative-time helper used in timeline hints ("2 hr ago", "3 days ago"). */
export function formatRelative(ms: number, now: number = Date.now()): string {
  const diff = Math.max(0, now - ms);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
