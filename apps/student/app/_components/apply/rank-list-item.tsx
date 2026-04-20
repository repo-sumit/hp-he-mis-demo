"use client";

import { useLocale } from "../locale-provider";
import type { PreferenceCandidate } from "./candidates";
import { ReorderControls } from "./reorder-controls";
import { SelectedPreferenceCard } from "./selected-preference-card";

interface Props {
  rank: number;
  candidate: PreferenceCandidate;
  canUp: boolean;
  canDown: boolean;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}

/**
 * One row on the /apply/[courseId]/rank screen. Combines the rank number,
 * the selected preference card, and the reorder controls.
 */
export function RankListItem({ rank, candidate, canUp, canDown, onUp, onDown, onRemove }: Props) {
  const { t } = useLocale();
  return (
    <div className="flex items-start gap-2">
      <span
        className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] text-[var(--text-sm)] font-[var(--weight-bold)] text-[var(--color-text-inverse)]"
        aria-label={t("apply.rank.rankBadge", { n: rank })}
      >
        {rank}
      </span>
      <SelectedPreferenceCard
        candidate={candidate}
        className="flex-1"
        trailing={
          <ReorderControls
            canUp={canUp}
            canDown={canDown}
            onUp={onUp}
            onDown={onDown}
            onRemove={onRemove}
          />
        }
      />
    </div>
  );
}
