import type { EligibilityReason } from "./evaluate";

type TFn = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Resolve a reason to a single localized string. Vars prefixed with `__i18n:`
 * are themselves translation keys (e.g. the stream name), letting the
 * evaluator stay pure while copy lives in the dictionaries.
 */
export function renderReason(t: TFn, reason: EligibilityReason): string {
  if (!reason.vars) return t(reason.key);
  const resolved: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(reason.vars)) {
    if (typeof v === "string" && v.startsWith("__i18n:")) {
      resolved[k] = t(v.slice("__i18n:".length));
    } else {
      resolved[k] = v;
    }
  }
  return t(reason.key, resolved);
}
