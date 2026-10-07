import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const supplier = await prisma.supplier.update({
    where: { id: Number(id) },
    data: { name: body.name, phone: body.phone ?? "", email: body.email ?? "" },
  });
  return NextResponse.json(supplier);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  await prisma.supplier.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}