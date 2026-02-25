/* eslint-disable no-console */
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const BASE_URL = "https://movingquotetexas.com";

// ✅ Only this JSON will be used
const BLOGDATA_PATH = path.join(process.cwd(), "BlogPost.json");

// JSON helper
const jsonOrNull = (v: unknown) => {
  if (v === undefined || v === null) return Prisma.DbNull;
  return v as any;
};

// Date helper
const parseDate = (d: any): Date | null => {
  if (!d) return null;
  const s = String(d).trim();
  const isoish = s.includes(" ") && !s.includes("T") ? s.replace(" ", "T") : s;
  const dt = new Date(isoish);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const normalizeImageUrl = (url: any): string | null => {
  if (!url) return null;
  const u = String(url).trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  const cleaned = u.replace(/^(\.\.\/)+/, "/"); // ../../uploads/... -> /uploads/...
  const base = BASE_URL.replace(/\/$/, "");
  const p = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return `${base}${p}`;
};

function readBlogData(): any[] {
  if (!fs.existsSync(BLOGDATA_PATH)) {
    throw new Error(`BlogPost.json not found at: ${BLOGDATA_PATH}`);
  }
  const raw = fs.readFileSync(BLOGDATA_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [parsed];
}

/**
 * ✅ Create/Upsert Admin and return admin user (for author assignment)
 */
async function seedAdmin() {
  const email = "admin@example.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      name: "Admin User",
      passwordHash: hashedPassword,
    },
    create: {
      email,
      role: "ADMIN",
      passwordHash: hashedPassword,
      name: "Admin User",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log(`✅ Admin user ready: ${admin.email} (${admin.id})`);
  return admin;
}

/**
 * ✅ Seed posts and force author = admin.id (new schema: post_author is String?)
 */
async function seedBlogPostsFromBlogData(adminId: string) {
  const blogdata = readBlogData();

  console.log(`🌱 Seeding BlogPost from BlogPost.json… Total: ${blogdata.length}`);

  let created = 0;
  let updated = 0;

  for (const p of blogdata as any[]) {
    const category =
      p.category
        ? typeof p.category === "string"
          ? p.category
          : p.category?.name ?? p.category?.label ?? p.category?.value ?? null
        : null;

    const content =
      typeof p.post_content === "string" ? p.post_content : jsonOrNull(p.post_content);

    // ✅ Optional: if your json has an image field you want to normalize, you can store it
    // const img = normalizeImageUrl(p.image || p.imageUrl || p.thumbnail);

    const data: any = {
      // ✅ NEW: force ALL posts to admin as author (String cuid)
      post_author: adminId,

      tags: p.tags ? String(p.tags) : null,
      name: p.name ? String(p.name) : null,
      category,

      post_date: parseDate(p.post_date),
      post_date_gmt: parseDate(p.post_date_gmt),

      post_content: content,
      post_title: String(p.post_title ?? ""),

      post_excerpt: p.post_excerpt ? String(p.post_excerpt) : null,
      post_status: p.post_status ? String(p.post_status) : null,
      comment_status: p.comment_status ? String(p.comment_status) : null,
      ping_status: p.ping_status ? String(p.ping_status) : null,
      post_password: p.post_password ? String(p.post_password) : null,

      post_name: String(p.post_name ?? p.post_title ?? ""),

      to_ping: p.to_ping ? String(p.to_ping) : null,
      pinged: p.pinged ? String(p.pinged) : null,

      post_modified: parseDate(p.post_modified),
      post_modified_gmt: parseDate(p.post_modified_gmt),

      post_content_filtered: p.post_content_filtered ? String(p.post_content_filtered) : null,
      post_parent: p.post_parent ? Number(p.post_parent) : null,
      guid: p.guid ? String(p.guid) : null,
      menu_order: p.menu_order ? Number(p.menu_order) : null,
      post_type: p.post_type ? String(p.post_type) : null,
      post_mime_type: p.post_mime_type ? String(p.post_mime_type) : null,
      comment_count: p.comment_count ? Number(p.comment_count) : null,
    };

    const ors = [
      data.guid ? { guid: data.guid } : undefined,
      data.post_name ? { post_name: data.post_name } : undefined,
    ].filter(Boolean) as any[];

    const existing = ors.length
      ? await prisma.blogPost.findFirst({ where: { OR: ors } })
      : null;

    if (existing) {
      await prisma.blogPost.update({
        where: { id: existing.id },
        data,
      });
      updated++;
      console.log(`📝 Updated: ${data.post_title}`);
    } else {
      await prisma.blogPost.create({ data });
      created++;
      console.log(`✅ Created: ${data.post_title}`);
    }
  }

  console.log(`🎉 BlogPost done. Created: ${created}, Updated: ${updated}`);
}

async function main() {
  const admin = await seedAdmin();
  await seedBlogPostsFromBlogData(admin.id);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });