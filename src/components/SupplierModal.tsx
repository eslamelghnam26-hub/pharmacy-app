"use client";

import { useState } from "react";
import { Modal, Button, Field, inputClass } from "@/components/ui";
import type { SupplierDto } from "@/lib/types";
import { useApp } from "@/components/providers";

const EMPTY = { name: "", phone: "", email: "" };
type FormState = typeof EMPTY;

export default function SupplierModal({
  open,
  onClose,
  supplier,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  supplier: SupplierDto | null;
  onSaved: () => void;
}) {
  const { t } = useApp();
  const [form, setForm] = useState<FormState>(() =>
    supplier ? { ...supplier } : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError(t("suppliers.errName"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        supplier ? `/api/suppliers/${supplier.id}` : "/api/suppliers",
        {
          method: supplier ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim(),
          }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
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
      title={supplier ? t("suppliers.edit") : t("suppliers.add")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={submit}
            disabled={saving}
            type="submit"
            form="supplier-form"
          >
            {saving
              ? t("common.saving")
              : supplier
                ? t("suppliers.saveChanges")
                : t("suppliers.add")}
          </Button>
        </>
      }
    >
      <form id="supplier-form" onSubmit={submit} className="space-y-4">
        <Field label={t("suppliers.name")}>
          <input
            className={inputClass}
            value={form.name}
            onChange={set("name")}
            placeholder="MediSource Distributors"
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("suppliers.phone")}>
            <input
              className={inputClass}
              value={form.phone}
              onChange={set("phone")}
              placeholder="(555) 011-2490"
            />
          </Field>
          <Field label={t("suppliers.email")}>
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="orders@medisource.com"
            />
          </Field>
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}