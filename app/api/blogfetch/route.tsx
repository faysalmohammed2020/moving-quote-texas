// app/api/blogpost/route.ts
import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import sanitizeHtml from "sanitize-html";
import { load, CheerioAPI, Element } from "cheerio";
import type { Prisma } from "@prisma/client"; // ✅ added type import

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- helper: wrap orphan cells/rows into proper tables ---
function normalizeTables(rawHtml: string) {
  const $: CheerioAPI = load(rawHtml, { decodeEntities: false });

  $("td, th").each((_, el) => {
    const $el = $(el);
    if ($el.closest("tr").length === 0) {
      const $tr = $("<tr></tr>");
      $el.replaceWith($tr.append($el));
    }
  });

  const orphanTrs = $("tr").filter((_, el) => $(el).closest("table").length === 0);

  orphanTrs.each((_, el) => {
    const $tr = $(el);

    if ($tr.parent().is("tbody") && $tr.closest("table").length) return;

    const group: Element[] = [];

    let start = $tr;
    while (start.prev().is("tr") && start.prev().closest("table").length === 0) {
      start = start.prev();
    }

    let cur = start;
    while (cur.is("tr") && cur.closest("table").length === 0) {
      group.push(cur.get(0));
      const next = cur.next();
      if (!next.is("tr") || next.closest("table").length !== 0) break;
      cur = next;
    }

    const $table = $("<table></table>");
    const $tbody = $("<tbody></tbody>");
    $table.append($tbody);

    (group.length ? $(group[0]) : $tr).before($table);
    group.forEach((node) => $tbody.append($(node)));
  });

  return $.html();
}

// --- sanitizer: keep tables + images safely ---
function sanitizeKeepTablesAndImages(html: string) {
  const clean = sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img", "figure", "figcaption",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption"
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "class", "style"],
      "*": ["colspan", "rowspan", "class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    allowProtocolRelative: true,
    transformTags: {
      img: (_tagName, attribs) => {
        const src = attribs.src || "";
        const unsafe = /^\s*javascript:/i.test(src);
        return {
          tagName: "img",
          attribs: unsafe ? {} : attribs,
        };
      },
    },
  });

  return clean;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const authorId = searchParams.get("authorId");

    const filters: Prisma.BlogPostWhereInput = {}; // ✅ any removed
    if (category) filters.category = category;
    if (authorId) filters.post_author = parseInt(authorId, 10);

    const blogPosts = await prisma.blogPost.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        post_title: true,
        post_content: true,
        category: true,
        tags: true,
        post_status: true,
        createdAt: true,
      },
    });

    const normalized = blogPosts.map((p) => {
      const raw = String(p.post_content ?? "");
      const withTables = normalizeTables(raw);
      const safe = sanitizeKeepTablesAndImages(withTables);
      return { ...p, post_content: safe };
    });

    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts." }, { status: 500 });
  }
}
