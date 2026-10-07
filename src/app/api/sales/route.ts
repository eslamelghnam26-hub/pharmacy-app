import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sales = await prisma.sale.findMany({
    include: {
      items: {
        include: { medicine: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(sales);
}

type CartItem = { medicineId: number; quantity: number };

class SaleError extends Error {
  code: string;
  meta: Record<string, string | number>;

  constructor(code: string, message: string, meta: Record<string, string | number> = {}) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const items: CartItem[] = body.items ?? [];

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Cart is empty.", errorCode: "EMPTY_CART" },
      { status: 400 },
    );
  }

  if (!items.every((i) => Number.isInteger(i.quantity) && i.quantity > 0)) {
    return NextResponse.json(
      {
        error: "Line quantities must be whole numbers above zero.",
        errorCode: "INVALID_QTY",
      },
      { status: 400 },
    );
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      let total = 0;
      const saleItems = [];

      for (const item of items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId },
        });

        if (!medicine) {
          throw new SaleError("NOT_FOUND", `Medicine #${item.medicineId} not found.`);
        }
        if (medicine.quantity < item.quantity) {
          throw new SaleError(
            "INSUFFICIENT_STOCK",
            `Only ${medicine.quantity} in stock for ${medicine.name}.`,
            { available: medicine.quantity, name: medicine.name },
          );
        }

        await tx.medicine.update({
          where: { id: medicine.id },
          data: { quantity: medicine.quantity - item.quantity },
        });

        total += medicine.sellingPrice * item.quantity;
        saleItems.push({
          medicineId: medicine.id,
          quantity: item.quantity,
          unitPrice: medicine.sellingPrice,
        });
      }

      return tx.sale.create({
        data: { total, items: { create: saleItems } },
        include: {
          items: {
            include: { medicine: { select: { id: true, name: true } } },
          },
        },
      });
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof SaleError) {
      return NextResponse.json(
        { error: error.message, errorCode: error.code, ...error.meta },
        { status: 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Could not complete the sale.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}