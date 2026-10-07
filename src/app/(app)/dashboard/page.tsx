import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime, formatDate, isLowStock } from "@/lib/format";
import { translate, parseSettings, SETTINGS_COOKIE, type Lang } from "@/lib/i18n";
import {
  BoxIcon,
  PillIcon,
  CashIcon,
  AlertIcon,
  ReceiptIcon,
  TrendingIcon,
} from "@/components/icons";
import { PageHeader, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-fg-muted">{label}</p>
          <p className="tnum mt-1.5 text-2xl font-semibold text-fg">{value}</p>
          {sub && <p className="tnum mt-1 text-xs text-fg-faint">{sub}</p>}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SalesChart({
  data,
  lang,
  title,
}: {
  data: { label: string; amount: number }[];
  lang: Lang;
  title: string;
}) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-5 flex items-center gap-2">
        <TrendingIcon width={18} height={18} className="text-accent" />
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
      </div>
      <div className="flex h-40 items-end justify-between gap-3">
        {data.map((d, i) => {
          const pct = Math.round((d.amount / max) * 100);
          const today = i === data.length - 1;
          return (
            <div
              key={d.label}
              className="group flex flex-1 flex-col items-center gap-2"
            >
              <span className="tnum text-[11px] font-medium text-fg-faint opacity-0 transition-opacity group-hover:opacity-100">
                {d.amount > 0 ? formatCurrency(d.amount, lang) : "—"}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  title={`${d.label}: ${formatCurrency(d.amount, lang)}`}
                  className={`w-full rounded-t-md transition-colors ${
                    today ? "bg-accent" : "bg-accent/25 group-hover:bg-accent/45"
                  }`}
                  style={{ height: `${Math.max(pct, d.amount > 0 ? 8 : 2)}%` }}
                />
              </div>
              <span
                className={`text-[11px] ${today ? "font-semibold text-accent" : "text-fg-faint"}`}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const settings = parseSettings((await cookies()).get(SETTINGS_COOKIE)?.value);
  const lang: Lang = settings.lang;
  const t = (k: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
    translate(lang, k, vars);

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  endOfDay.setMilliseconds(-1);

  const [
    totalMedicines,
    totalStockRaw,
    todaySalesAgg,
    lowStock,
    recentSales,
    last7Sales,
  ] = await Promise.all([
    prisma.medicine.count(),
    prisma.medicine.aggregate({ _sum: { quantity: true } }),
    prisma.sale.aggregate({
      _count: { id: true },
      _sum: { total: true },
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
    }),
    prisma.medicine.findMany({
      where: { quantity: { lte: 10 } },
      include: { supplier: true },
      orderBy: { quantity: "asc" },
      take: 8,
    }),
    prisma.sale.findMany({
      include: {
        items: { include: { medicine: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.sale.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 7 * 86400000) } },
      select: { total: true, createdAt: true },
    }),
  ]);

  const chart: { label: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    day.setHours(12, 0, 0, 0);
    const key = day.toDateString();
    const amount = last7Sales
      .filter((s) => new Date(s.createdAt).toDateString() === key)
      .reduce((sum, s) => sum + s.total, 0);
    chart.push({
      label: day.toLocaleDateString(lang === "ar" ? "ar" : "en-US", {
        weekday: "short",
      }),
      amount,
    });
  }

  const expiringSoon = lowStock
    .filter(
      (m) =>
        isLowStock(m.quantity) &&
        new Date(m.expiryDate).getTime() < now.getTime() + 180 * 86400000,
    )
    .slice(0, 4);

  const totalStock = totalStockRaw._sum.quantity ?? 0;
  const todayRevenue = todaySalesAgg._sum.total ?? 0;
  const todayCount = todaySalesAgg._count.id;

  return (
    <div>
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.totalMedicines")}
          value={String(totalMedicines)}
          sub={t("dashboard.totalMedicinesSub")}
          icon={<PillIcon width={18} height={18} className="text-accent-fg" />}
          accent="bg-accent"
        />
        <StatCard
          label={t("dashboard.totalStock")}
          value={String(totalStock)}
          sub={t("dashboard.totalStockSub")}
          icon={<BoxIcon width={18} height={18} className="text-accent-fg" />}
          accent="bg-cyan-500"
        />
        <StatCard
          label={t("dashboard.todaySales")}
          value={formatCurrency(todayRevenue, lang)}
          sub={t(
            todayCount === 1 ? "dashboard.todaySaleOne" : "dashboard.todaySaleOther",
            { n: todayCount },
          )}
          icon={<CashIcon width={18} height={18} className="text-accent-fg" />}
          accent="bg-accent"
        />
        <StatCard
          label={t("dashboard.lowStock")}
          value={String(lowStock.length)}
          sub={
            lowStock.length
              ? t("dashboard.lowStockSubNeeds")
              : t("dashboard.lowStockSubOk")
          }
          icon={<AlertIcon width={18} height={18} className="text-white" />}
          accent="bg-amber-500"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SalesChart data={chart} lang={lang} title={t("dashboard.chartTitle")} />

          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <ReceiptIcon width={18} height={18} className="text-accent" />
                {t("dashboard.recentSales")}
              </h2>
            </div>
            {recentSales.length === 0 ? (
              <EmptyState
                title={t("dashboard.emptySales")}
                message={t("dashboard.emptySalesMsg")}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-start text-xs text-fg-faint">
                      <th className="px-5 py-3 font-medium text-start">
                        {t("dashboard.receipt")}
                      </th>
                      <th className="px-5 py-3 font-medium text-start">
                        {t("dashboard.items")}
                      </th>
                      <th className="px-5 py-3 font-medium text-end">
                        {t("dashboard.total")}
                      </th>
                      <th className="px-5 py-3 font-medium text-end">
                        {t("dashboard.time")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-surface-2/60">
                        <td className="tnum px-5 py-3 text-fg">
                          #{String(sale.id).padStart(4, "0")}
                        </td>
                        <td className="px-5 py-3 text-fg-muted">
                          {t(
                            sale.items.length === 1
                              ? "dashboard.itemOne"
                              : "dashboard.itemOther",
                            { n: sale.items.length },
                          )}
                        </td>
                        <td className="tnum px-5 py-3 text-end font-medium text-fg">
                          {formatCurrency(sale.total, lang)}
                        </td>
                        <td className="tnum px-5 py-3 text-end text-fg-muted">
                          {formatDateTime(sale.createdAt, lang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <AlertIcon width={18} height={18} className="text-amber-500" />
                {t("dashboard.lowStockTitle")}
              </h2>
              <Link
                href="/medicines"
                className="text-xs font-medium text-accent hover:text-accent-strong"
              >
                {t("dashboard.viewAll")}
              </Link>
            </div>
            {lowStock.length === 0 ? (
              <EmptyState
                title={t("dashboard.nothingLow")}
                message={t("dashboard.nothingLowMsg")}
              />
            ) : (
              <ul className="divide-y divide-line/60">
                {lowStock.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">
                        {m.name}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {m.category}
                        {m.supplier ? ` · ${m.supplier.name}` : ""}
                      </p>
                    </div>
                    <span
                      className={`tnum shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                        m.quantity === 0
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      }`}
                    >
                      {t("dashboard.left", { n: m.quantity })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {expiringSoon.length > 0 && (
            <div className="mt-6 rounded-xl border border-accent-soft bg-accent-soft/60 p-5">
              <h3 className="text-sm font-semibold text-accent">
                {t("dashboard.expiringSoon")}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                {t("dashboard.expiringDesc")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {expiringSoon.map((m) => (
                  <span
                    key={m.id}
                    className="rounded-full border border-accent/25 bg-surface px-2.5 py-1 text-xs text-accent"
                  >
                    {m.name} · {formatDate(m.expiryDate, lang)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}