"use client";

import { useCallback } from "react";
import { useProfile } from "./profile-provider";
import { useDocuments } from "../documents/documents-provider";

/**
 * Claim code → claim-driven document code it requires. When the user
 * un-checks one of these claims, the matching uploaded document is dropped
 * too so no stale state lingers.
 *
 * Note: a document stays required if the profile still implies it another
 * way — e.g. `isPwd === true` keeps `pwd_cert` in the checklist even after
 * the "pwd" claim is removed. Keeping this mapping tight means we only
 * clear the uploaded copy, and only when the source of the requirement was
 * the claim itself.
 */
const CLAIM_TO_DOC: Record<string, string> = {
  sc: "caste_cert",
  st: "caste_cert",
  obc: "caste_cert",
  ews: "ews_cert",
  pwd: "pwd_cert",
};

/**
 * Returns a `setClaims` function that:
 *   1. replaces `profile.claims` with the new list,
 *   2. drops any certificate entry whose claim was just removed,
 *   3. clears the `isPwd` flag if "pwd" was removed,
 *   4. resets the uploaded document for claim-driven docs (caste / ews /
 *      pwd) when the surviving profile no longer requires them.
 *
 * This is the single source of truth for the "remove-a-claim → cascade"
 * behaviour, so Step 4 and any future edit surface stay consistent.
 */
export function useClaimsUpdater(): (next: string[]) => void {
  const { draft, update } = useProfile();
  const { resetToNotUploaded } = useDocuments();

  return useCallback(
    (next: string[]) => {
      const previous = draft.claims;
      const removed = previous.filter((code) => !next.includes(code));
      if (removed.length === 0) {
        update("claims", next);
        return;
      }

      // 1. Drop certificate entries for removed claims.
      const nextCerts = { ...draft.certificates };
      for (const code of removed) {
        delete nextCerts[code];
      }

      // 2. If "pwd" was removed, clear the derived isPwd flag too. Keep
      //    the toggle-driven flag in sync with the claim list.
      const nextIsPwd = removed.includes("pwd") ? false : draft.isPwd;

      // 3. Clear claim-driven uploaded documents that are no longer
      //    required by the surviving profile. We peek at the next state
      //    (using `nextClaims` + `nextIsPwd`) to decide.
      const survivingClaims = new Set(next);
      const category = draft.category;
      for (const code of removed) {
        const docCode = CLAIM_TO_DOC[code];
        if (!docCode) continue;

        const stillRequired = (() => {
          if (docCode === "caste_cert") {
            // Caste cert is driven by either the category or a surviving
            // claim in {sc, st, obc}.
            const catDriven = ["sc", "st", "obc"].includes(category);
            const claimDriven = ["sc", "st", "obc"].some((c) =>
              survivingClaims.has(c),
            );
            return catDriven || claimDriven;
          }
          if (docCode === "ews_cert") {
            return category === "ews" || survivingClaims.has("ews");
          }
          if (docCode === "pwd_cert") {
            return nextIsPwd || survivingClaims.has("pwd");
          }
          return false;
        })();

        if (!stillRequired) resetToNotUploaded(docCode);
      }

      // 4. Commit profile-side changes in one pass so autosave sees a
      //    single coherent state.
      update("claims", next);
      update("certificates", nextCerts);
      if (nextIsPwd !== draft.isPwd) update("isPwd", nextIsPwd);
    },
    [draft, update, resetToNotUploaded],
  );
}
