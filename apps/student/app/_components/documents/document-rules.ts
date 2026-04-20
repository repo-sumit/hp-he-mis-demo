import type { ProfileDraft } from "../profile/profile-provider";

export type DocStatus =
  | "not_uploaded"
  | "uploaded"
  | "under_review"
  | "verified"
  | "rejected"
  | "re_upload_required";

export type DocCategory = "academic" | "identity" | "claim" | "other";

export interface DocumentRule {
  code: string;
  category: DocCategory;
  acceptedFormats: readonly string[];
  maxSizeMb: number;
  /** Base-required docs ship with this true. Conditional docs flip to `required: true` via applicability. */
  baseRequired: boolean;
}

export interface ChecklistItem {
  rule: DocumentRule;
  required: boolean;
  /** True when this doc is only required because of a profile choice. */
  conditional: boolean;
  /** Optional i18n key + vars explaining why this doc is in the list. */
  reasonKey?: string;
  reasonVars?: Record<string, string | number>;
}

export const DOCUMENT_RULES: readonly DocumentRule[] = [
  {
    code: "aadhaar",
    category: "identity",
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSizeMb: 2,
    baseRequired: true,
  },
  {
    code: "marksheet_12",
    category: "academic",
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSizeMb: 2,
    baseRequired: true,
  },
  {
    code: "photo",
    category: "identity",
    acceptedFormats: ["JPG", "PNG"],
    maxSizeMb: 1,
    baseRequired: true,
  },
  {
    code: "signature",
    category: "identity",
    acceptedFormats: ["JPG", "PNG"],
    maxSizeMb: 1,
    baseRequired: true,
  },
  {
    code: "character_cert",
    category: "academic",
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSizeMb: 2,
    baseRequired: true,
  },
  {
    code: "domicile_cert",
    category: "claim",
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSizeMb: 2,
    baseRequired: false,
  },
  {
    code: "caste_cert",
    category: "claim",
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSizeMb: 2,
    baseRequired: false,
  },
  {
    code: "ews_cert",
    category: "claim",
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSizeMb: 2,
    baseRequired: false,
  },
  {
    code: "pwd_cert",
    category: "claim",
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSizeMb: 2,
    baseRequired: false,
  },
  {
    code: "gap_affidavit",
    category: "other",
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSizeMb: 2,
    baseRequired: false,
  },
  {
    code: "migration_cert",
    category: "academic",
    acceptedFormats: ["PDF", "JPG", "PNG"],
    maxSizeMb: 2,
    baseRequired: false,
  },
];

const RULE_BY_CODE: Record<string, DocumentRule> = Object.fromEntries(
  DOCUMENT_RULES.map((rule) => [rule.code, rule]),
);

export function getRule(code: string): DocumentRule | undefined {
  return RULE_BY_CODE[code];
}

/**
 * Derive the checklist from a profile snapshot. Conditional docs only appear
 * when their condition is met (SC/ST/OBC → caste cert, gap > 0 → affidavit…).
 * Required base docs always appear.
 */
export function buildChecklist(draft: ProfileDraft | null): ChecklistItem[] {
  const claims = new Set(draft?.claims ?? []);
  const category = draft?.category ?? "";
  const isPwd = Boolean(draft?.isPwd) || claims.has("pwd");
  const gapYears = Number(draft?.gapYears ?? 0);
  const board = draft?.board ?? "";
  const state = draft?.state ?? "";

  const items: ChecklistItem[] = [];

  for (const rule of DOCUMENT_RULES) {
    if (rule.baseRequired) {
      items.push({ rule, required: true, conditional: false });
      continue;
    }

    switch (rule.code) {
      case "domicile_cert": {
        // In the HP cycle every HP-domicile applicant needs this; if the user
        // hasn't picked a state yet we still show it (default is HP).
        const applicable = !state || state === "Himachal Pradesh";
        if (applicable) {
          items.push({
            rule,
            required: true,
            conditional: true,
            reasonKey: "document.condition.hpDomicile",
          });
        }
        break;
      }
      case "caste_cert": {
        const reasonCode = ["sc", "st", "obc"].find(
          (c) => category === c || claims.has(c),
        );
        if (reasonCode) {
          items.push({
            rule,
            required: true,
            conditional: true,
            reasonKey: `document.condition.claim.${reasonCode}`,
          });
        }
        break;
      }
      case "ews_cert": {
        if (category === "ews" || claims.has("ews")) {
          items.push({
            rule,
            required: true,
            conditional: true,
            reasonKey: "document.condition.claim.ews",
          });
        }
        break;
      }
      case "pwd_cert": {
        if (isPwd) {
          items.push({
            rule,
            required: true,
            conditional: true,
            reasonKey: "document.condition.claim.pwd",
          });
        }
        break;
      }
      case "gap_affidavit": {
        if (gapYears > 0) {
          items.push({
            rule,
            required: true,
            conditional: true,
            reasonKey: "document.condition.gapYears",
            reasonVars: { n: gapYears },
          });
        }
        break;
      }
      case "migration_cert": {
        if (board && board !== "hpbose") {
          items.push({
            rule,
            required: true,
            conditional: true,
            reasonKey: "document.condition.nonHpBoard",
          });
        }
        break;
      }
      default:
        // no-op
        break;
    }
  }

  return items;
}
