import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      medicines: {
        select: { id: true, name: true, quantity: true, sellingPrice: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(suppliers);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const supplier = await prisma.supplier.create({
    data: { name: body.name, phone: body.phone ?? "", email: body.email ?? "" },
  });
  return NextResponse.json(supplier, { status: 201 });
}