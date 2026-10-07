"use client";

import { useApp } from "@/components/providers";
import { SunIcon, MoonIcon, GlobeIcon, FlaskIcon } from "@/components/icons";
import { Brand } from "@/components/Sidebar";

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              active
                ? "bg-accent text-accent-fg"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { lang, theme, setLang, setTheme, t } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 md:flex-1">
          <button
            onClick={onOpenMenu}
            aria-label={t("brand.openMenu")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width={20}
              height={20}
              aria-hidden
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Mobile brand only; desktop shows tagline */}
          <div className="md:hidden">
            <Brand compact />
          </div>
          <p className="hidden truncate text-sm text-fg-muted md:block">
            {t("brand.tagline")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Segmented
            label={t("settings.language")}
            value={lang}
            onChange={setLang}
            options={[
              { value: "en", label: "EN", icon: <GlobeIcon width={13} height={13} /> },
              { value: "ar", label: "ع", icon: <GlobeIcon width={13} height={13} /> },
            ]}
          />
          <Segmented
            label={t("settings.theme")}
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: t("settings.light"), icon: <SunIcon width={13} height={13} /> },
              { value: "dark", label: t("settings.dark"), icon: <MoonIcon width={13} height={13} /> },
            ]}
          />
        </div>
      </div>
    </header>
  );
}

export function BrandMark() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-fg">
      <FlaskIcon width={18} height={18} />
    </div>
  );
}