import { prisma } from "@/lib/prisma";
import PosClient from "@/components/PosClient";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const medicines = await prisma.medicine.findMany({
    include: { supplier: true },
    orderBy: { name: "asc" },
  });

  return (
    <PosClient
      initialMedicines={medicines
        .filter((m) => m.quantity > 0)
        .map((m) => ({ ...m, expiryDate: m.expiryDate.toISOString() }))}
    />
  );
}