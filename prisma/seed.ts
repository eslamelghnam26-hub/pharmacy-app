import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  // Clean up existing data
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.supplier.deleteMany();

  // Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: { name: "MediSource Distributors", phone: "(555) 011-2490", email: "orders@medisource.com" },
    }),
    prisma.supplier.create({
      data: { name: "HealthBridge Pharma", phone: "(555) 284-7714", email: "sales@healthbridgepharma.com" },
    }),
    prisma.supplier.create({
      data: { name: "CurePoint Logistics", phone: "(555) 903-5582", email: "contact@curepointlogistics.com" },
    }),
    prisma.supplier.create({
      data: { name: "VitaPlus Supplies", phone: "(555) 466-1198", email: "support@vitaplussupplies.com" },
    }),
  ]);

  await prisma.medicine.createMany({
    data: [
      { name: "Paracetamol 500mg", category: "Pain Relief", barcode: "8901234567890", purchasePrice: 2.5, sellingPrice: 5.0, quantity: 150, expiryDate: daysFromNow(540), supplierId: suppliers[0].id },
      { name: "Ibuprofen 400mg", category: "Pain Relief", barcode: "8901234567891", purchasePrice: 4.0, sellingPrice: 7.5, quantity: 90, expiryDate: daysFromNow(620), supplierId: suppliers[0].id },
      { name: "Amoxicillin 500mg", category: "Antibiotics", barcode: "8901234567892", purchasePrice: 8.0, sellingPrice: 15.0, quantity: 45, expiryDate: daysFromNow(300), supplierId: suppliers[1].id },
      { name: "Azithromycin 250mg", category: "Antibiotics", barcode: "8901234567893", purchasePrice: 12.0, sellingPrice: 22.0, quantity: 30, expiryDate: daysFromNow(240), supplierId: suppliers[1].id },
      { name: "Cetirizine 10mg", category: "Allergy", barcode: "8901234567894", purchasePrice: 5.5, sellingPrice: 10.0, quantity: 120, expiryDate: daysFromNow(700), supplierId: suppliers[2].id },
      { name: "Loratadine 10mg", category: "Allergy", barcode: "8901234567895", purchasePrice: 4.5, sellingPrice: 9.0, quantity: 8, expiryDate: daysFromNow(650), supplierId: suppliers[2].id },
      { name: "Omeprazole 20mg", category: "Gastro", barcode: "8901234567896", purchasePrice: 7.0, sellingPrice: 13.0, quantity: 60, expiryDate: daysFromNow(400), supplierId: suppliers[3].id },
      { name: "Metformin 500mg", category: "Diabetes", barcode: "8901234567897", purchasePrice: 6.0, sellingPrice: 11.0, quantity: 75, expiryDate: daysFromNow(500), supplierId: suppliers[0].id },
      { name: "Atorvastatin 20mg", category: "Cardiology", barcode: "8901234567898", purchasePrice: 9.0, sellingPrice: 17.0, quantity: 40, expiryDate: daysFromNow(450), supplierId: suppliers[1].id },
      { name: "Losartan 50mg", category: "Cardiology", barcode: "8901234567899", purchasePrice: 7.5, sellingPrice: 14.0, quantity: 55, expiryDate: daysFromNow(380), supplierId: suppliers[2].id },
      { name: "Salbutamol Inhaler", category: "Respiratory", barcode: "8901234567900", purchasePrice: 25.0, sellingPrice: 45.0, quantity: 20, expiryDate: daysFromNow(200), supplierId: suppliers[3].id },
      { name: "Vitamin D3 1000IU", category: "Vitamins", barcode: "8901234567901", purchasePrice: 3.0, sellingPrice: 6.5, quantity: 200, expiryDate: daysFromNow(800), supplierId: suppliers[0].id },
      { name: "Calcium 500mg", category: "Vitamins", barcode: "8901234567902", purchasePrice: 4.0, sellingPrice: 8.0, quantity: 6, expiryDate: daysFromNow(730), supplierId: suppliers[2].id },
      { name: "Vitamin C 1000mg", category: "Vitamins", barcode: "8901234567903", purchasePrice: 5.0, sellingPrice: 9.5, quantity: 130, expiryDate: daysFromNow(900), supplierId: suppliers[1].id },
      { name: "Aspirin 81mg", category: "Pain Relief", barcode: "8901234567904", purchasePrice: 2.0, sellingPrice: 4.5, quantity: 180, expiryDate: daysFromNow(600), supplierId: suppliers[3].id },
    ],
  });

  // Previous sales (a few days back)
  const meds = await prisma.medicine.findMany();

  const byName = (name: string) => meds.find((m) => m.name === name)!;

  const daysBack = [1, 2, 3, 4, 6, 8, 10, 12];

  for (let i = 0; i < daysBack.length; i++) {
    const dayOffset = daysBack[i];
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - dayOffset);
    saleDate.setHours(10 + i, 15, 0, 0);

    const itemNames = [
      [byName("Paracetamol 500mg").id, 2],
      [byName("Cetirizine 10mg").id, 1],
      [byName("Vitamin D3 1000IU").id, 3],
    ];
    const items = itemNames.map(([id, qty]) => {
      const m = meds.find((med) => med.id === id)!;
      return { medicineId: m.id, quantity: qty, unitPrice: m.sellingPrice };
    });

    const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

    await prisma.sale.create({
      data: {
        total,
        createdAt: saleDate,
        items: { create: items },
      },
    });
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
