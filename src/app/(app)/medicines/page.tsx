import { prisma } from "@/lib/prisma";
import MedicinesClient from "@/components/MedicinesClient";

export const dynamic = "force-dynamic";

export default async function MedicinesPage() {
  const [medicines, suppliers] = await Promise.all([
    prisma.medicine.findMany({
      include: { supplier: true },
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <MedicinesClient
      initialMedicines={medicines.map((m) => ({
        ...m,
        expiryDate: m.expiryDate.toISOString(),
      }))}
      initialSuppliers={suppliers}
    />
  );
}