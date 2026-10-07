import type { Lang } from "@/lib/i18n";

function localeFor(lang: Lang): string {
  return lang === "ar" ? "ar" : "en-US";
}

export function formatCurrency(value: number, lang: Lang = "en"): string {
  return new Intl.NumberFormat(localeFor(lang), {
    style: "currency",
    currency: "EGP",
    currencyDisplay: "narrowSymbol",
    numberingSystem: lang === "ar" ? "latn" : undefined,
  })
    .formatToParts(value)
    .map((part) =>
      part.type === "currency"
        ? lang === "ar"
          ? "جنيه"
          : "EGP"
        : part.value,
    )
    .join("");
}

export function formatDate(date: string | Date, lang: Lang = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeFor(lang), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date, lang: Lang = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(localeFor(lang), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isLowStock(quantity: number): boolean {
  return quantity <= 10;
}

export function countable(
  lang: Lang,
  n: number,
  one: string,
  other: string,
): string {
  return `${n} ${n === 1 ? one : other}`;
}