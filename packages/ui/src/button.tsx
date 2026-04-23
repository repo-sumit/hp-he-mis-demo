import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";
type Size = "sm" | "md" | "lg";
type Shape = "pill" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  shape?: Shape;
  fullWidth?: boolean;
  /**
   * Show an inline spinner and disable interaction. The button keeps its
   * width — the spinner replaces the leading icon (or precedes the label
   * when there is no icon) so layout doesn't shift.
   */
  loading?: boolean;
  /**
   * Optional copy shown next to the spinner while `loading` is true. Falls
   * back to the regular `children` so callers can omit it for short labels
   * like "Save".
   */
  loadingLabel?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-[var(--weight-semibold)] " +
  "tracking-[var(--tracking-snug)] transition-[background-color,box-shadow,border-color,color,transform] " +
  "duration-150 select-none focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] " +
  "active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100 " +
  "aria-[busy=true]:cursor-progress";

const variants: Record<Variant, string> = {
  // Primary button — design system §Buttons (verified): bg =
  // color/interactive/primary, text = color/text/onBrand. Aliased to HP's
  // sky-blue primitive so the product identity stays HP Admission, not
  // SwiftChat, while the token names match the system vocabulary.
  primary:
    "bg-[var(--color-interactive-primary)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)] " +
    "hover:bg-[var(--color-interactive-primary-hover)] hover:shadow-[var(--shadow-md)] " +
    "active:bg-[var(--color-interactive-primary-active)] active:shadow-none",
  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] " +
    "hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] " +
    "hover:text-[var(--color-text-brand)] hover:shadow-[var(--shadow-sm)]",
  ghost:
    "text-[var(--color-text-brand)] hover:bg-[var(--color-background-brand-subtle)]",
  danger:
    "bg-[var(--color-interactive-danger)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)] " +
    "hover:bg-[var(--color-interactive-danger-hover)] hover:shadow-[var(--shadow-md)] " +
    "active:shadow-none focus-visible:shadow-[var(--focus-ring-danger)]",
  success:
    "bg-[var(--color-interactive-success)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)] " +
    "hover:bg-[var(--color-interactive-success-hover)] hover:shadow-[var(--shadow-md)] " +
    "active:shadow-none",
  warning:
    "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)] border border-[var(--color-status-warning-fg)] " +
    "hover:bg-[var(--color-status-warning-fg)] hover:text-[var(--color-text-on-brand)] hover:shadow-[var(--shadow-sm)]",
};

const sizes: Record<Size, string> = {
  sm: "h-[var(--button-height-sm)] px-4 text-[var(--text-xs)]",
  md: "h-[var(--button-height)] px-5 text-[var(--text-sm)]",
  lg: "h-12 px-6 text-[var(--text-base)]",
};

const shapes: Record<Shape, string> = {
  pill: "rounded-[var(--radius-pill)]",
  md: "rounded-[var(--radius-md)]",
};

function Spinner({ size }: { size: Size }) {
  // Sized so the stroke stays visible against any of the variant
  // backgrounds. `currentColor` lets us inherit the button's text colour
  // for free, including the warning variant's amber-on-amber treatment.
  const dim = size === "sm" ? 12 : size === "lg" ? 18 : 14;
  return (
    <svg
      aria-hidden="true"
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  shape = "pill",
  fullWidth,
  loading = false,
  loadingLabel,
  className,
  type,
  disabled,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const isBusy = loading;
  return (
    <button
      type={type ?? "button"}
      aria-busy={isBusy || undefined}
      disabled={disabled || isBusy}
      onClick={isBusy ? undefined : onClick}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        shapes[shape],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {isBusy ? (
        <>
          <Spinner size={size} />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
