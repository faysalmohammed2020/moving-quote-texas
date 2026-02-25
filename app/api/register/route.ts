// app/api/register/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email & password required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // ⚠️ তোমার Prisma মডেলে যদি `passwordHash @map("password")` থাকে, data: { passwordHash } সঠিক
    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash, // maps to "password" column if @map("password")
        role: "USER",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error("REGISTER_ERROR:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
