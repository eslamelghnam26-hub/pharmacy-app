"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/providers";
import {
  DashboardIcon,
  PillIcon,
  PosIcon,
  SupplierIcon,
  CloseIcon,
} from "./icons";
import { BrandMark } from "./TopBar";

const navKeys = [
  { href: "/dashboard", key: "nav.dashboard", icon: DashboardIcon },
  { href: "/medicines", key: "nav.medicines", icon: PillIcon },
  { href: "/sales", key: "nav.sales", icon: PosIcon },
  { href: "/suppliers", key: "nav.suppliers", icon: SupplierIcon },
] as const;

export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useApp();
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      {!compact && (
        <div className="leading-tight">
          <p className="text-[15px] font-semibold text-fg">{t("brand.name")}</p>
          <p className="text-[11px] text-fg-muted">{t("brand.tagline")}</p>
        </div>
      )}
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useApp();

  return (
    <nav className="flex flex-col gap-1">
      {navKeys.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active
                ? "bg-accent-soft text-accent"
                : "text-fg-muted hover:bg-surface-2 hover:text-fg"
            }`}
          >
            <item.icon width={18} height={18} />
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useApp();

  return (
    <>
      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden
          />
          <div className="absolute inset-y-0 start-0 flex w-64 flex-col border-e border-line bg-surface p-4 pb-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button
                onClick={onClose}
                aria-label={t("brand.closeMenu")}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <NavLinks onNavigate={onClose} />
            <div className="mt-auto rounded-lg bg-surface-2 px-3 py-4">
              <p className="text-xs font-medium text-fg-muted">{t("nav.demo")}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-fg-faint">
                {t("nav.demoDesc")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col gap-5 border-e border-line bg-surface px-3 py-5 md:sticky md:top-14 md:flex md:h-[calc(100dvh-3.5rem)] md:overflow-y-auto">
        <div className="px-2">
          <Brand />
        </div>
        <NavLinks />
        <div className="mt-auto rounded-lg border border-line bg-surface-2 px-3 py-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("nav.demo")}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-fg-faint">
            {t("nav.demoDesc")}
          </p>
        </div>
      </aside>
    </>
  );
}