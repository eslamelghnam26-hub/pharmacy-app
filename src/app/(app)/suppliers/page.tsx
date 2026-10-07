import { prisma } from "@/lib/prisma";
import SuppliersClient from "@/components/SuppliersClient";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      medicines: {
        select: { id: true, name: true, quantity: true, sellingPrice: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return <SuppliersClient initialSuppliers={suppliers} />;
}