"use client";

import type { ReactNode } from "react";

export interface DonutSegment {
  label: string;
  value: number;
  /** CSS color — typically `var(--color-chart-N)`. */
  color: string;
}

interface Props {
  segments: readonly DonutSegment[];
  centerLabel?: ReactNode;
  centerValue?: ReactNode;
  /** Rendered pixel diameter of the donut. Legend sits below regardless. */
  size?: number;
  ariaLabel?: string;
}

/**
 * Two-plus-segment donut rendered as `stroke-dasharray` arcs on a single
 * circle. No layout shift on hover; colors flow from chart tokens. Center
 * slot shows a short label + total.
 */
export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  size = 200,
  ariaLabel = "Donut chart",
}: Props) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 80;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let offsetPx = 0;
  const arcs = segments.map((seg) => {
    const length = total > 0 ? (seg.value / total) * circumference : 0;
    const arc = {
      seg,
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -offsetPx,
    };
    offsetPx += length;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          role="img"
          aria-label={ariaLabel}
          viewBox="0 0 200 200"
          className="h-full w-full -rotate-90"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="var(--color-background-muted)"
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={arc.seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={arc.dashArray}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        {centerLabel || centerValue ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerLabel ? (
              <p className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
                {centerLabel}
              </p>
            ) : null}
            {centerValue ? (
              <p className="mt-1 text-[var(--text-xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
                {centerValue}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <ul className="flex flex-wrap items-center justify-center gap-4 text-[var(--text-xs)]">
        {segments.map((s, i) => {
          const share = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <li key={i} className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                {s.label}
              </span>
              <span className="text-[var(--color-text-tertiary)]">
                {share.toFixed(0)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
