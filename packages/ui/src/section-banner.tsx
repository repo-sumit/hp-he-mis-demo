import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export interface SectionBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Big left-aligned title rendered in white on the saturated blue band. */
  title: ReactNode;
  /** Optional right-aligned actions — typically two pill buttons (e.g. Cancel/Edit). */
  actions?: ReactNode;
  /** Optional eyebrow above the title for secondary context. */
  eyebrow?: ReactNode;
  /** Rounded corners — defaults to the banner radius token. */
  rounded?: boolean;
}

/**
 * Blue sub-header banner used above a form or detail region. Matches the
 * "Employee Details" / "View Training Details" band in the Figma reference.
 */
export function SectionBanner({
  title,
  actions,
  eyebrow,
  rounded = true,
  className,
  ...props
}: SectionBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 bg-[var(--color-banner-bg)] px-5 py-3.5 text-[var(--color-banner-fg)] shadow-[var(--shadow-banner)]",
        rounded && "rounded-[var(--radius-banner)]",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="truncate text-[var(--text-xs)] font-[var(--weight-medium)] uppercase tracking-[var(--tracking-wide)] opacity-85">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="truncate text-[var(--text-xl)] font-[var(--weight-bold)] tracking-[var(--tracking-tight)] sm:text-[var(--text-2xl)]">
          {title}
        </h2>
      </div>
      {actions ? (
        <div className="flex flex-none flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
