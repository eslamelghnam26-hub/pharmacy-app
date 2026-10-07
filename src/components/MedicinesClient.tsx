"use client";

import { useState } from "react";
import type { MedicineDto, SupplierDto } from "@/lib/types";
import MedicineModal from "@/components/MedicineModal";
import { MedicineList } from "@/components/MedicineList";
import { PageHeader, Button, EmptyState } from "@/components/ui";
import { useApp } from "@/components/providers";
import { PlusIcon, SearchIcon, PillIcon } from "@/components/icons";

export default function MedicinesClient({
  initialMedicines,
  initialSuppliers,
}: {
  initialMedicines: MedicineDto[];
  initialSuppliers: SupplierDto[];
}) {
  const { t } = useApp();
  const [medicines, setMedicines] = useState(initialMedicines);
  const [suppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MedicineDto | null>(null);
  const [modalKey, setModalKey] = useState(0);

  async function load(query = "") {
    const url = query
      ? `/api/medicines?search=${encodeURIComponent(query)}`
      : "/api/medicines";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load medicines");
      setMedicines(await res.json());
      setError(null);
    } catch {
      setError(t("common.loadError", { what: t("medicines.title") }));
    }
  }

  function openAdd() {
    setEditing(null);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  function openEdit(medicine: MedicineDto) {
    setEditing(medicine);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }

  async function onDelete(id: number) {
    await fetch(`/api/medicines/${id}`, { method: "DELETE" });
    load(search);
  }

  return (
    <div>
      <PageHeader
        title={t("medicines.title")}
        subtitle={t("medicines.subtitle")}
        action={
          <Button onClick={openAdd}>
            <PlusIcon width={16} height={16} />
            {t("medicines.add")}
          </Button>
        }
      />

      <div className="relative mb-4">
        <SearchIcon
          width={18}
          height={18}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-fg-faint"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            load(e.target.value);
          }}
          placeholder={t("medicines.search")}
          className="h-10 w-full rounded-lg border border-line-strong bg-surface ps-10 pe-3 text-sm text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {error ? (
          <EmptyState title={t("common.loadError", { what: t("medicines.title") })} message={error} />
        ) : medicines.length === 0 ? (
          <EmptyState
            icon={<PillIcon width={40} height={40} />}
            title={search ? t("medicines.noMatches") : t("medicines.empty")}
            message={search ? t("medicines.noMatchesMsg") : t("medicines.emptyMsg")}
          />
        ) : (
          <MedicineList
            medicines={medicines}
            onEdit={openEdit}
            onDelete={onDelete}
          />
        )}
      </div>

      <MedicineModal
        key={modalKey}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        medicine={editing}
        suppliers={suppliers}
        onSaved={() => load(search)}
      />
    </div>
  );
}