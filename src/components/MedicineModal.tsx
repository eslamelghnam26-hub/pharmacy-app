"use client";

import { useState } from "react";
import { Modal, Button, Field, inputClass } from "@/components/ui";
import type { MedicineDto, MedicineInput, SupplierDto } from "@/lib/types";
import { useApp } from "@/components/providers";

const EMPTY = {
  name: "",
  category: "",
  barcode: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  expiryDate: "",
  supplierId: "",
};

const CATEGORIES = [
  "Pain Relief",
  "Antibiotics",
  "Allergy",
  "Gastro",
  "Diabetes",
  "Cardiology",
  "Respiratory",
  "Vitamins",
  "Skincare",
  "First Aid",
];

type FormState = typeof EMPTY;

export default function MedicineModal({
  open,
  onClose,
  medicine,
  suppliers,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  medicine: MedicineDto | null;
  suppliers: SupplierDto[];
  onSaved: () => void;
}) {
  const { t } = useApp();
  const [form, setForm] = useState<FormState>(() =>
    medicine
      ? {
          name: medicine.name,
          category: medicine.category,
          barcode: medicine.barcode,
          purchasePrice: String(medicine.purchasePrice),
          sellingPrice: String(medicine.sellingPrice),
          quantity: String(medicine.quantity),
          expiryDate: new Date(medicine.expiryDate).toISOString().slice(0, 10),
          supplierId: medicine.supplierId ? String(medicine.supplierId) : "",
        }
      : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: MedicineInput = {
      name: form.name.trim(),
      category: form.category.trim(),
      barcode: form.barcode.trim(),
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      quantity: Number(form.quantity),
      expiryDate: form.expiryDate,
      supplierId: form.supplierId ? Number(form.supplierId) : null,
    };

    if (!payload.name || !payload.category || !payload.barcode) {
      setError(t("medicines.errRequired"));
      return;
    }
    if (
      !payload.expiryDate ||
      Number.isNaN(payload.purchasePrice) ||
      Number.isNaN(payload.sellingPrice)
    ) {
      setError(t("medicines.errPrices"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        medicine ? `/api/medicines/${medicine.id}` : "/api/medicines",
        {
          method: medicine ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.errorCode === "DUPLICATE_BARCODE") {
          throw new Error(t("medicines.errDuplicate"));
        }
        throw new Error(data.error ?? t("common.error"));
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={medicine ? t("medicines.edit") : t("medicines.add")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            type="submit"
            form="medicine-form"
          >
            {saving
              ? t("common.saving")
              : medicine
                ? t("medicines.saveChanges")
                : t("medicines.add")}
          </Button>
        </>
      }
    >
      <form id="medicine-form" onSubmit={submit} className="space-y-4">
        <Field label={t("medicines.name")}>
          <input
            className={inputClass}
            value={form.name}
            onChange={set("name")}
            placeholder="Paracetamol 500mg"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t("medicines.category")}>
            <input
              className={inputClass}
              value={form.category}
              onChange={set("category")}
              list="category-options"
              placeholder="Pain Relief"
            />
            <datalist id="category-options">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label={t("medicines.barcode")}>
            <input
              className={inputClass}
              value={form.barcode}
              onChange={set("barcode")}
              placeholder="8901234567890"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t("medicines.purchasePrice")}>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.purchasePrice}
              onChange={set("purchasePrice")}
              placeholder="2.50"
            />
          </Field>
          <Field label={t("medicines.sellingPrice")}>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.sellingPrice}
              onChange={set("sellingPrice")}
              placeholder="5.00"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t("medicines.quantity")}>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={set("quantity")}
              placeholder="0"
            />
          </Field>
          <Field label={t("medicines.expiryDate")}>
            <input
              className={inputClass}
              type="date"
              value={form.expiryDate}
              onChange={set("expiryDate")}
            />
          </Field>
        </div>

        <Field label={t("medicines.supplier")}>
          <select
            className={inputClass}
            value={form.supplierId}
            onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
          >
            <option value="">{t("medicines.noSupplier")}</option>
            {suppliers.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}