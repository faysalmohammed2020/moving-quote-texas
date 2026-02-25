import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guards";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

/* -----------------------
   Validation Schema
------------------------*/
const UpdateMeSchema = z.object({
  name: z.string().min(1).nullable().optional(),
  phone: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

/* -----------------------
   GET - Current User
------------------------*/
export async function GET() {
  const gate = await requireAuth();
  if (!gate.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: gate.session!.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ user });
}

/* -----------------------
   PATCH - Update Profile
------------------------*/
export async function PATCH(req: Request) {
  try {
    const gate = await requireAuth();
    if (!gate.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const parsed = UpdateMeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, image, currentPassword, newPassword } = parsed.data;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (image !== undefined) data.image = image;

    /* -----------------------
       Password Change Logic
    ------------------------*/
    if (newPassword) {
      const me = await db.user.findUnique({
        where: { id: gate.session!.user.id },
        select: { passwordHash: true },
      });

      // if user has password already
      if (me?.passwordHash) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: "Current password is required" },
            { status: 400 }
          );
        }

        const ok = await bcrypt.compare(
          currentPassword,
          me.passwordHash
        );

        if (!ok) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 400 }
          );
        }
      }

      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await db.user.update({
      where: { id: gate.session!.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        image: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updated }, { status: 200 });

  } catch (err) {
    console.error("PATCH /api/me error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}