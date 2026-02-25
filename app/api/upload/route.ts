// app/api/upload/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadsRoot = path.join(process.cwd(), "public", "uploads"); // ✅ public/uploads

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const allowed = ["image/jpeg","image/png","image/webp","image/gif","image/avif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
    }

    const buf = new Uint8Array(await file.arrayBuffer());
    if (buf.byteLength > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;

    await fs.mkdir(uploadsRoot, { recursive: true });
    const dest = path.join(uploadsRoot, name);
    await fs.writeFile(dest, buf);

    // return the URL we also serve via the route below
    const url = `/uploads/${name}`;

    // helpful logs
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "http";
    console.log("[upload] wrote:", dest, "url:", `${proto}://${host}${url}`);

    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    console.error("[upload] error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
