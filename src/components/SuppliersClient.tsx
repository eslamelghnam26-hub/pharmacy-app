"use client";

import { useState } from "react";
import type { MedicineDto, SupplierDto } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
  PageHeader,
  Button,
  EmptyState,
  ConfirmDialog,
} from "@/components/ui";
import SupplierModal from "@/components/SupplierModal";
import { useApp } from "@/components/providers";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  PhoneIcon,
  MailIcon,
  UserIcon,
  PillIcon,
} from "@/components/icons";

type SupplierWithMeds = SupplierDto & {
  medicines: Pick<MedicineDto, "id" | "name" | "quantity" | "sellingPrice">[];
};

export default function SuppliersClient({
  initialSuppliers,
}: {
  initialSuppliers: SupplierWithMeds[];
}) {
  const { lang, t } = useApp();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierDto | null>(null);
  const [modalKey, setModalKey] = useState(0);
  const [toDelete, setToDelete] = useState<SupplierWithMeds | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/suppliers");
      if (!res.ok) throw new Error("Failed to load suppliers");
      setSuppliers(await res.json());
      setError(null);
    } catch {
      setError(t("common.loadError", { what: t("suppliers.title") }));
    }
  }

  function openAdd() {
    setEditing(null);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  function openEdit(s: SupplierDto) {
    setEditing(s);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setToDelete(null);
    await fetch(`/api/suppliers/${toDelete.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader
        title={t("suppliers.title")}
        subtitle={t("suppliers.subtitle")}
        action={
          <Button onClick={openAdd}>
            <PlusIcon width={16} height={16} />
            {t("suppliers.add")}
          </Button>
        }
      />

      {error ? (
        <div className="rounded-xl border border-line bg-surface">
          <EmptyState
            title={t("common.loadError", { what: t("suppliers.title") })}
            message={error}
          />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface">
          <EmptyState
            icon={<UserIcon width={40} height={40} />}
            title={t("suppliers.empty")}
            message={t("suppliers.emptyMsg")}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-semibold text-fg">
                    {s.name}
                  </h2>
                  <div className="mt-2 flex flex-col gap-1 text-sm text-fg-muted">
                    {s.phone && (
                      <span className="flex items-center gap-2">
                        <PhoneIcon
                          width={14}
                          height={14}
                          className="text-fg-faint"
                        />
                        <span className="tnum">{s.phone}</span>
                      </span>
                    )}
                    {s.email && (
                      <span className="flex items-center gap-2 truncate">
                        <MailIcon
                          width={14}
                          height={14}
                          className="text-fg-faint"
                        />
                        <span className="truncate">{s.email}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    aria-label={t("medicines.editAria", { name: s.name })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-faint hover:bg-accent-soft hover:text-accent"
                  >
                    <EditIcon width={16} height={16} />
                  </button>
                  <button
                    onClick={() => setToDelete(s)}
                    aria-label={t("medicines.deleteAria", { name: s.name })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-faint hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15"
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 px-5 py-4">
                {s.medicines.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-fg-faint">
                    <PillIcon width={14} height={14} />
                    {t("suppliers.noLink")}
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-xs font-medium text-fg-muted">
                      {t(
                        s.medicines.length === 1
                          ? "suppliers.medOne"
                          : "suppliers.medOther",
                        { n: s.medicines.length },
                      )}
                    </p>
                    <ul className="max-h-48 divide-y divide-line/60 overflow-y-auto">
                      {s.medicines.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-2 py-1.5 text-sm"
                        >
                          <span className="truncate text-fg">{m.name}</span>
                          <span className="tnum shrink-0 text-xs text-fg-muted">
                            {formatCurrency(m.sellingPrice, lang)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <SupplierModal
        key={modalKey}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        supplier={editing}
        onSaved={load}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={t("suppliers.delete")}
        message={t("suppliers.deleteMsg", { name: toDelete?.name ?? "" })}
        confirmLabel={t("common.delete")}
      />
    </div>
  );
}