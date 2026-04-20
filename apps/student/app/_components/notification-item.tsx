"use client";

import { cn } from "@hp-mis/ui";

type Props = {
  title: string;
  time: string;
  unread?: boolean;
};

export function NotificationItem({ title, time, unread }: Props) {
  return (
    <li className="flex items-start gap-3 border-b border-[var(--color-border)] py-3 last:border-b-0">
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 h-2 w-2 flex-none rounded-full",
          unread ? "bg-[var(--color-interactive-brand)]" : "bg-[var(--color-border-strong)]",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[var(--text-sm)] text-[var(--color-text-primary)]">{title}</p>
        <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">{time}</p>
      </div>
    </li>
  );
}
