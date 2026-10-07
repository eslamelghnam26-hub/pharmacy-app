"use client";

import { useState } from "react";
import type { MedicineDto } from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  isLowStock,
} from "@/lib/format";
import { useApp } from "@/components/providers";
import { ConfirmDialog } from "@/components/ui";
import { EditIcon, TrashIcon } from "@/components/icons";

export function MedicineList({
  medicines,
  onEdit,
  onDelete,
}: {
  medicines: MedicineDto[];
  onEdit: (medicine: MedicineDto) => void;
  onDelete: (id: number) => void;
}) {
  const { lang, t } = useApp();
  const [toDelete, setToDelete] = useState<MedicineDto | null>(null);
  // Capture "now" once so expiry comparisons stay stable across renders.
  const [now] = useState(() => Date.now());

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2/60 text-start text-xs text-fg-faint">
              <th className="px-4 py-3 font-medium text-start sm:px-5">
                {t("medicines.colName")}
              </th>
              <th className="px-4 py-3 font-medium text-start sm:px-5">
                {t("medicines.colCategory")}
              </th>
              <th className="hidden px-4 py-3 font-medium md:table-cell sm:px-5">
                {t("medicines.colBarcode")}
              </th>
              <th className="hidden px-4 py-3 text-end font-medium sm:table-cell sm:px-5">
                {t("medicines.colPurchase")}
              </th>
              <th className="px-4 py-3 text-end font-medium sm:px-5">
                {t("medicines.colPrice")}
              </th>
              <th className="px-4 py-3 text-end font-medium sm:px-5">
                {t("medicines.colStock")}
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell sm:px-5">
                {t("medicines.colExpiry")}
              </th>
              <th className="hidden px-4 py-3 font-medium xl:table-cell sm:px-5">
                {t("medicines.colSupplier")}
              </th>
              <th className="px-4 py-3 text-end font-medium sm:px-5">
                <span className="sr-only">{t("medicines.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {medicines.map((m) => {
              const low = isLowStock(m.quantity);
              const expired = new Date(m.expiryDate).getTime() < now;
              return (
                <tr key={m.id} className="hover:bg-surface-2/50">
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-medium text-fg">{m.name}</p>
                    <p className="tnum mt-0.5 text-xs text-fg-muted md:hidden">
                      {m.barcode}
                    </p>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <span className="inline-block rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
                      {m.category}
                    </span>
                  </td>
                  <td className="tnum hidden px-4 py-3 text-fg-muted md:table-cell sm:px-5">
                    {m.barcode}
                  </td>
                  <td className="tnum hidden px-4 py-3 text-end text-fg-faint sm:table-cell sm:px-5">
                    {formatCurrency(m.purchasePrice, lang)}
                  </td>
                  <td className="tnum px-4 py-3 text-end font-medium text-fg sm:px-5">
                    {formatCurrency(m.sellingPrice, lang)}
                  </td>
                  <td className="px-4 py-3 text-end sm:px-5">
                    <span
                      className={`tnum inline-block rounded-md px-2 py-1 text-xs font-medium ${
                        low
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                          : "bg-surface-2 text-fg-muted"
                      }`}
                    >
                      {m.quantity}
                    </span>
                  </td>
                  <td
                    className={`tnum hidden px-4 py-3 lg:table-cell sm:px-5 ${
                      expired
                        ? "font-medium text-rose-600 dark:text-rose-400"
                        : "text-fg-muted"
                    }`}
                  >
                    {formatDate(m.expiryDate, lang)}
                  </td>
                  <td className="hidden px-4 py-3 text-fg-muted xl:table-cell sm:px-5">
                    {m.supplier?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit(m)}
                        aria-label={t("medicines.editAria", { name: m.name })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-faint hover:bg-accent-soft hover:text-accent"
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        onClick={() => setToDelete(m)}
                        aria-label={t("medicines.deleteAria", { name: m.name })}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-faint hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) onDelete(toDelete.id);
          setToDelete(null);
        }}
        title={t("medicines.delete")}
        message={t("medicines.deleteMsg", { name: toDelete?.name ?? "" })}
        confirmLabel={t("common.delete")}
      />
    </>
  );
}