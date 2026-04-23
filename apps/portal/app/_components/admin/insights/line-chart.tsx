"use client";

import { useId } from "react";

export interface LineChartPoint {
  label: string;
  value: number;
}

export interface LineChartSeries {
  label: string;
  color: string;
  data: readonly LineChartPoint[];
}

interface Props {
  /** Primary (solid) series. Drives the x-axis label set. */
  data: readonly LineChartPoint[];
  /** Optional additional dashed series overlaid on the same chart. */
  series?: readonly LineChartSeries[];
  yMin?: number;
  yMax?: number;
  yTickCount?: number;
  yFormatter?: (n: number) => string;
  /** Rendered pixel height of the chart. SVG is fully responsive horizontally. */
  height?: number;
  ariaLabel?: string;
}

/**
 * Lightweight inline-SVG line chart. No external dependencies. Draws a
 * gridded plot area with a filled-area primary line and optional dashed
 * overlay series (e.g. male / female split over the total). Axis labels
 * inherit text tokens so they re-tint with the brand.
 */
export function LineChart({
  data,
  series = [],
  yMin,
  yMax,
  yTickCount = 5,
  yFormatter = (n) => String(n),
  height = 260,
  ariaLabel = "Line chart",
}: Props) {
  const gradientId = useId();
  const W = 1000;
  const H = 400;
  const PAD = { t: 16, r: 16, b: 40, l: 64 };

  const allValues = [
    ...data.map((d) => d.value),
    ...series.flatMap((s) => s.data.map((d) => d.value)),
  ];
  const dataMin = yMin ?? Math.min(0, ...allValues);
  const dataMax =
    yMax ?? Math.max(...allValues, allValues.length > 0 ? allValues[0]! : 1) * 1.1;

  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const xStep = data.length > 1 ? chartW / (data.length - 1) : 0;
  const xScale = (i: number) => PAD.l + i * xStep;
  const yScale = (v: number) =>
    PAD.t + chartH - ((v - dataMin) / (dataMax - dataMin || 1)) * chartH;

  const mainPoints = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(" ");
  const areaPath = `M ${xScale(0)} ${yScale(dataMin)} L ${data
    .map((d, i) => `${xScale(i)} ${yScale(d.value)}`)
    .join(" L ")} L ${xScale(data.length - 1)} ${yScale(dataMin)} Z`;

  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
    dataMin + ((dataMax - dataMin) * i) / yTickCount,
  );

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height, maxHeight: height }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity="0.24" />
          <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={`y-${i}`}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={yScale(t)}
            y2={yScale(t)}
            stroke="var(--color-chart-grid)"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <text
            x={PAD.l - 12}
            y={yScale(t)}
            dy="0.35em"
            textAnchor="end"
            fill="var(--color-text-tertiary)"
            fontSize="14"
          >
            {yFormatter(t)}
          </text>
        </g>
      ))}

      {data.map((d, i) => (
        <text
          key={`x-${d.label}-${i}`}
          x={xScale(i)}
          y={H - PAD.b + 22}
          textAnchor="middle"
          fill="var(--color-text-tertiary)"
          fontSize="14"
        >
          {d.label}
        </text>
      ))}

      <path d={areaPath} fill={`url(#${gradientId})`} />

      <polyline
        points={mainPoints}
        fill="none"
        stroke="var(--color-chart-1)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {data.map((d, i) => (
        <circle
          key={`dot-${i}`}
          cx={xScale(i)}
          cy={yScale(d.value)}
          r="4"
          fill="var(--color-chart-1)"
        />
      ))}

      {series.map((s, sIdx) => (
        <polyline
          key={`s-${sIdx}`}
          points={s.data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(" ")}
          fill="none"
          stroke={s.color}
          strokeWidth="2"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
