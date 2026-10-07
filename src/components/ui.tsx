"use client";

import { useEffect } from "react";
import { useApp } from "@/components/providers";
import { CloseIcon } from "./icons";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { t } = useApp();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-surface shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="flex-1 truncate text-base font-semibold text-fg">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-faint hover:bg-surface-2 hover:text-fg"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 rounded-b-2xl border-t border-line bg-surface-2 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
}) {
  const { t } = useApp();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-fg-muted">{message}</p>
    </Modal>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary: "bg-accent text-accent-fg hover:bg-accent-strong",
    secondary:
      "border border-line-strong bg-surface text-fg hover:bg-surface-2",
    danger: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500/90",
    ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon?: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <div className="mb-3 text-fg-faint">{icon}</div>}
      <p className="text-sm font-medium text-fg">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">{message}</p>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-accent"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-20"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}