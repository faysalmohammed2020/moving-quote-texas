// app/uploads/[...slug]/route.ts
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadsRoot = path.join(process.cwd(), "public", "uploads"); // ✅ public/uploads

function guessContentType(ext: string) {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await ctx.params; // ✅ await params first
    const rel = slug.join("/");

    if (rel.includes("..")) {
      return NextResponse.json({ error: "Bad path" }, { status: 400 });
    }

    const filePath = path.join(uploadsRoot, rel);
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": guessContentType(ext),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
