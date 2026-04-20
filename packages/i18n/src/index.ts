import en from "./locales/en.json";
import hi from "./locales/hi.json";

export const locales = ["en", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const dictionaries = { en, hi } as const;

export type Dictionary = typeof en;

/**
 * Resolve a dot-separated key (e.g. "cta.register") against a dictionary.
 * Silently falls back to English, then to the raw key, so a missing Hindi
 * string never crashes the UI — matches the fallback policy in
 * docs/project-context.md §12.7.
 */
export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const read = (dict: unknown): string | undefined => {
    const parts = key.split(".");
    let node: unknown = dict;
    for (const part of parts) {
      if (node && typeof node === "object" && part in (node as object)) {
        node = (node as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return typeof node === "string" ? node : undefined;
  };

  const raw = read(dictionaries[locale]) ?? read(dictionaries.en) ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export { en, hi };
