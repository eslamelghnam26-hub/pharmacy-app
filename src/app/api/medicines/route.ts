import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim().toLowerCase();

  const medicines = await prisma.medicine.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { category: { contains: search } },
            { barcode: { contains: search } },
          ],
        }
      : undefined,
    include: { supplier: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(medicines);
}

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const medicine = await prisma.medicine.create({
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
    return NextResponse.json(medicine, { status: 201 });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    const isDuplicate =
      code === "P2002" ||
      (error instanceof Error && error.message.includes("Unique constraint"));
    if (isDuplicate) {
      return NextResponse.json(
        {
          error: "A medicine with this barcode already exists.",
          errorCode: "DUPLICATE_BARCODE",
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Could not add medicine." }, { status: 400 });
  }
}