/** Shared timestamp + size formatters for portal admin views. */

export function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  return `${date}, ${time}`;
}

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

export function formatSize(sizeKb?: number): string {
  if (!sizeKb && sizeKb !== 0) return "";
  if (sizeKb < 1024) return `${Math.round(sizeKb)} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
}
