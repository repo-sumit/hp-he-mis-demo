"use client";

import { Badge, Tabs, type Tab } from "@hp-mis/ui";

export interface TabItem {
  key: string;
  label: string;
  badge?: string | number;
}

interface Props {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

/**
 * Horizontal tab strip used on the application detail page. Thin wrapper
 * around the shared `Tabs` primitive so every portal tab bar reads the same
 * visual language; keeps its own `TabItem` signature intact so callers don't
 * have to change shape.
 */
export function TabNav({ tabs, active, onChange, className }: Props) {
  const mapped: readonly Tab[] = tabs.map((tab) => ({
    value: tab.key,
    label: tab.label,
    badge:
      tab.badge !== undefined && tab.badge !== 0 ? (
        <Badge tone="brand">{tab.badge}</Badge>
      ) : undefined,
  }));

  return (
    <Tabs
      tabs={mapped}
      value={active}
      onChange={onChange}
      variant="underline"
      ariaLabel="Application sections"
      className={className}
    />
  );
}
