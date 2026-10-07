"use client";

import { useMemo, useState } from "react";
import type { MedicineDto, SaleDto } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { PageHeader, Button, EmptyState } from "@/components/ui";
import { useApp } from "@/components/providers";
import {
  SearchIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  CashIcon,
  ReceiptIcon,
  BoxIcon,
} from "@/components/icons";

type CartLine = {
  medicine: MedicineDto;
  quantity: number;
};

export default function PosClient({
  initialMedicines,
}: {
  initialMedicines: MedicineDto[];
}) {
  const { lang, t } = useApp();
  const [medicines, setMedicines] = useState(initialMedicines);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [search, setSearch] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastSale, setLastSale] = useState<SaleDto | null>(null);

  async function reloadMedicines() {
    try {
      const res = await fetch("/api/medicines");
      if (res.ok) {
        const data: MedicineDto[] = await res.json();
        setMedicines(data.filter((m) => m.quantity > 0));
      }
    } catch {
      // keep current list if refresh fails
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.barcode.includes(q),
    );
  }, [medicines, search]);

  const totals = useMemo(() => {
    const count = cart.reduce((sum, l) => sum + l.quantity, 0);
    const amount = cart.reduce(
      (sum, l) => sum + l.quantity * l.medicine.sellingPrice,
      0,
    );
    return { count, amount };
  }, [cart]);

  const maxFor = (m: MedicineDto) =>
    Math.max(
      0,
      m.quantity - (cart.find((l) => l.medicine.id === m.id)?.quantity ?? 0),
    );

  function addToCart(m: MedicineDto) {
    setLastSale(null);
    setCheckoutError(null);
    setCart((prev) => {
      const existing = prev.find((l) => l.medicine.id === m.id);
      if (existing) {
        if (existing.quantity >= m.quantity) return prev;
        return prev.map((l) =>
          l.medicine.id === m.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { medicine: m, quantity: 1 }];
    });
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.medicine.id !== id) return l;
          const next = l.quantity + delta;
          if (next < 1 || next > l.medicine.quantity) return l;
          return { ...l, quantity: next };
        })
        .filter((l) => l.quantity > 0),
    );
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((l) => l.medicine.id !== id));
  }

  function localizeApiError(data: {
    error?: string;
    errorCode?: string;
    available?: number;
    name?: string;
  }) {
    switch (data?.errorCode) {
      case "INSUFFICIENT_STOCK":
        return t("pos.errStock", {
          n: data.available ?? "",
          name: data.name ?? "",
        });
      case "EMPTY_CART":
        return t("pos.errEmptyCart");
      case "INVALID_QTY":
        return t("pos.errQty");
      default:
        return data?.error ?? t("common.error");
    }
  }

  async function completeSale() {
    if (cart.length === 0) return;
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((l) => ({
            medicineId: l.medicine.id,
            quantity: l.quantity,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(localizeApiError(data));
      setLastSale(data as SaleDto);
      setCart([]);
      setSearch("");
      await reloadMedicines();
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : t("common.error"),
      );
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div>
      <PageHeader title={t("pos.title")} subtitle={t("pos.subtitle")} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Catalog */}
        <div className="lg:col-span-3">
          <div className="relative mb-4">
            <SearchIcon
              width={18}
              height={18}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-fg-faint"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("pos.search")}
              className="h-10 w-full rounded-lg border border-line-strong bg-surface ps-10 pe-3 text-sm text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<BoxIcon width={40} height={40} />}
                title={search ? t("pos.noMatches") : t("pos.noStock")}
                message={
                  search ? t("pos.noMatchesMsg") : t("pos.noStockMsg")
                }
              />
            ) : (
              <ul className="divide-y divide-line/60">
                {filtered.map((m) => {
                  const left = maxFor(m);
                  const selected = cart.some((l) => l.medicine.id === m.id);
                  const soldOut = selected && left === 0;
                  return (
                    <li
                      key={m.id}
                      className={`flex items-center justify-between gap-3 px-4 py-3 sm:px-5 ${
                        selected ? "bg-accent-soft/50" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-fg">
                          {m.name}
                        </p>
                        <p className="mt-0.5 text-xs text-fg-muted">
                          {m.category} ·{" "}
                          <span className="tnum">
                            {formatCurrency(m.sellingPrice, lang)}
                          </span>
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`tnum text-xs ${
                            soldOut ? "text-fg-faint" : "text-fg-muted"
                          }`}
                        >
                          {t("pos.inStock", { n: left })}
                        </span>
                        <Button
                          size="sm"
                          variant={selected ? "secondary" : "primary"}
                          onClick={() => addToCart(m)}
                          disabled={soldOut}
                        >
                          <PlusIcon width={14} height={14} />
                          {selected ? t("pos.addMore") : t("pos.add")}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 flex flex-col overflow-hidden rounded-xl border border-line bg-surface lg:h-[calc(100dvh-8rem)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <ReceiptIcon width={18} height={18} className="text-accent" />
                {t("pos.currentSale")}
              </h2>
              {cart.length > 0 && (
                <span className="tnum rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                  {totals.count}
                </span>
              )}
            </div>

            {lastSale ? (
              <SuccessReceipt
                sale={lastSale}
                onReset={() => setLastSale(null)}
              />
            ) : cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-fg-faint">
                  <CashIcon width={22} height={22} />
                </div>
                <p className="text-sm font-medium text-fg">
                  {t("pos.cartEmpty")}
                </p>
                <p className="mt-1 text-xs text-fg-muted">
                  {t("pos.cartEmptyMsg")}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-2">
                <ul className="divide-y divide-line/60">
                  {cart.map((line) => (
                    <li key={line.medicine.id} className="py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-fg">
                          {line.medicine.name}
                        </p>
                        <button
                          onClick={() => removeFromCart(line.medicine.id)}
                          aria-label={t("pos.remove", {
                            name: line.medicine.name,
                          })}
                          className="flex h-6 w-6 items-center justify-center rounded text-fg-faint hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15"
                        >
                          <TrashIcon width={14} height={14} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-0.5 rounded-lg border border-line-strong">
                          <button
                            onClick={() => changeQty(line.medicine.id, -1)}
                            aria-label={t("pos.decrease")}
                            className="flex h-7 w-7 items-center justify-center text-fg-muted hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-30"
                            disabled={line.quantity <= 1}
                          >
                            <MinusIcon width={14} height={14} />
                          </button>
                          <span className="tnum w-8 text-center text-sm font-medium text-fg">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => changeQty(line.medicine.id, 1)}
                            disabled={line.quantity >= line.medicine.quantity}
                            aria-label={t("pos.increase")}
                            className="flex h-7 w-7 items-center justify-center text-fg-muted hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <PlusIcon width={14} height={14} />
                          </button>
                        </div>
                        <p className="tnum text-sm font-semibold text-fg">
                          {formatCurrency(
                            line.quantity * line.medicine.sellingPrice,
                            lang,
                          )}
                        </p>
                      </div>
                      <p className="mt-1 text-[11px] text-fg-faint">
                        {t("pos.maxEach", {
                          n: line.medicine.quantity,
                          price: formatCurrency(
                            line.medicine.sellingPrice,
                            lang,
                          ),
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!lastSale && cart.length > 0 && (
              <div className="border-t border-line bg-surface-2 px-5 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-fg-muted">{t("pos.subtotal")}</span>
                  <span className="tnum font-medium text-fg">
                    {formatCurrency(totals.amount, lang)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm text-fg-muted">{t("pos.total")}</span>
                  <span className="tnum text-lg font-semibold text-fg">
                    {formatCurrency(totals.amount, lang)}
                  </span>
                </div>
                {checkoutError && (
                  <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                    {checkoutError}
                  </p>
                )}
                <Button
                  className="mt-4 w-full"
                  onClick={completeSale}
                  disabled={checkingOut}
                >
                  {checkingOut ? t("pos.completing") : t("pos.complete")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessReceipt({
  sale,
  onReset,
}: {
  sale: SaleDto;
  onReset: () => void;
}) {
  const { lang, t } = useApp();
  return (
    <div className="flex flex-1 flex-col px-5 py-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
        <CheckIcon />
      </div>
      <h3 className="mt-3 text-center text-base font-semibold text-fg">
        {t("pos.completed")}
      </h3>
      <p className="tnum mt-1 text-center text-sm text-fg-muted">
        {t("pos.receiptNo", { n: String(sale.id).padStart(4, "0") })} ·{" "}
        {formatCurrency(sale.total, lang)}
      </p>

      <div className="mt-5 rounded-lg border border-line">
        {sale.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-line/60 px-3 py-2 text-sm last:border-0"
          >
            <span className="truncate pe-2 text-fg">
              {item.medicine.name}{" "}
              <span className="tnum text-fg-faint">×{item.quantity}</span>
            </span>
            <span className="tnum shrink-0 text-fg">
              {formatCurrency(item.quantity * item.unitPrice, lang)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm text-fg-muted">{t("pos.totalPaid")}</span>
        <span className="tnum text-lg font-semibold text-fg">
          {formatCurrency(sale.total, lang)}
        </span>
      </div>

      <Button className="mt-6 w-full" onClick={onReset}>
        <PlusIcon width={16} height={16} />
        {t("pos.newSale")}
      </Button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={22}
      height={22}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}