import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  try {
    const medicine = await prisma.medicine.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        category: body.category,
        barcode: body.barcode,
        purchasePrice: body.purchasePrice,
        sellingPrice: body.sellingPrice,
        quantity: body.quantity,
        expiryDate: new Date(body.expiryDate),
        supplierId: body.supplierId ?? null,
      },
      include: { supplier: true },
    });
    return NextResponse.json(medicine);
  } catch {
    return NextResponse.json(
      { error: "Could not update medicine." },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.medicine.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}