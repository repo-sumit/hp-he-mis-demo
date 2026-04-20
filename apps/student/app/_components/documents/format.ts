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
