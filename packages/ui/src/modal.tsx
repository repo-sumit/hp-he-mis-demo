"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "./cn";

type Tone = "default" | "danger" | "success";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Big centered title, navy by default. Matches the Figma "Add New Item" / "Delete" modals. */
  title?: ReactNode;
  /** Optional red one-liner under the title ("This action cannot be undone"). */
  caption?: ReactNode;
  children?: ReactNode;
  /** Right/primary action button area. Usually two pill buttons. */
  footer?: ReactNode;
  tone?: Tone;
  /** Max width — "sm" for confirmation, "md" for forms, "lg" for data modals. */
  size?: "sm" | "md" | "lg";
  /** Close when the user clicks outside / presses ESC. Defaults to true. */
  dismissible?: boolean;
  /** Accessible label when no visible title is provided. */
  ariaLabel?: string;
}

const sizes: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

/**
 * Accessible modal built on the native <dialog>. Opens via showModal() so it
 * traps focus and lays down a backdrop without extra JS. Closes on ESC and
 * backdrop click when `dismissible` is true (default).
 */
export function Modal({
  open,
  onClose,
  title,
  caption,
  children,
  footer,
  tone = "default",
  size = "md",
  dismissible = true,
  ariaLabel,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (dismissible) onClose();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (!dismissible) return;
    const rect = (event.target as HTMLDialogElement).getBoundingClientRect?.();
    if (!rect) return;
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) onClose();
  };

  const titleClass =
    tone === "danger"
      ? "text-[var(--color-text-danger)]"
      : tone === "success"
        ? "text-[var(--color-text-success)]"
        : "text-[var(--color-text-brand-strong)]";

  return (
    <dialog
      ref={ref}
      aria-label={typeof title === "string" ? undefined : ariaLabel}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={cn(
        "p-0 bg-transparent",
        "backdrop:bg-[var(--color-surface-overlay)] backdrop:backdrop-blur-sm",
        "m-auto w-[calc(100%-2rem)]",
        sizes[size],
      )}
    >
      <div className="rounded-[var(--radius-modal)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        {title ? (
          <h2
            className={cn(
              "text-center text-[var(--text-2xl)] font-[var(--weight-bold)] tracking-[var(--tracking-tight)]",
              titleClass,
            )}
          >
            {title}
          </h2>
        ) : null}
        {caption ? (
          <p className="mt-2 text-center text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-danger)]">
            {caption}
          </p>
        ) : null}
        {children ? <div className="mt-5 text-[var(--text-sm)] text-[var(--color-text-secondary)]">{children}</div> : null}
        {footer ? <div className="mt-6 flex items-center justify-center gap-3">{footer}</div> : null}
      </div>
    </dialog>
  );
}
