//app/(main)/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import BlogPostEditorClient from "./BlogPostEditorClient";
import MovingCalculator from "@/components/MovingCostCalculator";
import Image from "next/image"; // ✅ ADD (for author image)

const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://movingquotetexas.com/";
const SITE_URL = SITE_URL_RAW.replace(/\/$/, "");

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/* =========================
   ✅ FAQ + JSON-LD helpers
   (Only added, nothing removed)
========================= */

type FAQItem = { question: string; answer: string };

function decodeEntities(str: string) {
  return (str || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(s: string) {
  return decodeEntities(stripHtml(s)).replace(/\s+/g, " ").trim();
}

// ✅ small helper: answer chunk sanitize
function takeAnswerChunk(block: string) {
  const m =
    block.match(/<p[^>]*>([\s\S]*?)<\/p>/i) ||
    block.match(/<div[^>]*>([\s\S]*?)<\/div>/i) ||
    block.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i) ||
    block.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
  return m ? cleanText(m[1]).slice(0, 2500) : cleanText(block).slice(0, 2500);
}

/**
 * ✅ Strong FAQ extractor (fix)
 * Supports patterns:
 * - Yoast FAQ block (schema-faq-section / schema-faq-question / schema-faq-answer)
 * - RankMath FAQ (rank-math-list-item / rank-math-question / rank-math-answer)
 * - <dl><dt>Question</dt><dd>Answer</dd></dl>
 * - <h2>FAQ</h2> then repeated <h3>/<h4>Question</h3> Answer...
 * - accordion wrappers (class contains faq/accordion/collapse)
 * - Q:/A: inline patterns (Q: ... A: ...)
 */
function extractFaqFromHtml(html: string): FAQItem[] {
  const src = html || "";
  const out: FAQItem[] = [];

  // debug counts (server log এ বোঝার জন্য)
  const debug = {
    yoast: 0,
    rankmath: 0,
    dl: 0,
    faqHeading: 0,
    accordion: 0,
    qaInlineHtml: 0, // old style with breaks/tags
    qaInlineText: 0, // ✅ NEW: same-line Q/A splitter
  };

  // ✅ Yoast FAQ block
  {
    const sections = [
      ...src.matchAll(
        /<section[^>]*class="[^"]*schema-faq-section[^"]*"[^>]*>[\s\S]*?<\/section>/gi
      ),
    ];
    for (const s of sections) {
      const block = s[0];

      const qMatch =
        block.match(
          /<[^>]*class="[^"]*schema-faq-question[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i
        ) || block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);

      const aMatch =
        block.match(
          /<div[^>]*class="[^"]*schema-faq-answer[^"]*"[^>]*>([\s\S]*?)<\/div>/i
        ) ||
        block.match(/<p[^>]*>([\s\S]*?)<\/p>/i) ||
        block.match(/<div[^>]*>([\s\S]*?)<\/div>/i);

      const q = qMatch ? cleanText(qMatch[1]) : "";
      const a = aMatch ? cleanText(aMatch[1]) : "";
      if (q && a) {
        out.push({ question: q, answer: a });
        debug.yoast++;
      }
    }
  }

  // ✅ RankMath FAQ
  {
    const items = [
      ...src.matchAll(
        /<div[^>]*class="[^"]*rank-math-list-item[^"]*"[^>]*>[\s\S]*?<\/div>/gi
      ),
    ];
    for (const it of items) {
      const block = it[0];

      const qMatch =
        block.match(
          /<[^>]*class="[^"]*rank-math-question[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i
        ) || block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);

      const aMatch =
        block.match(
          /<div[^>]*class="[^"]*rank-math-answer[^"]*"[^>]*>([\s\S]*?)<\/div>/i
        ) ||
        block.match(/<p[^>]*>([\s\S]*?)<\/p>/i) ||
        block.match(/<div[^>]*>([\s\S]*?)<\/div>/i);

      const q = qMatch ? cleanText(qMatch[1]) : "";
      const a = aMatch ? cleanText(aMatch[1]) : "";
      if (q && a) {
        out.push({ question: q, answer: a });
        debug.rankmath++;
      }
    }
  }

  // ✅ <dl><dt><dd>
  {
    const dlMatches = src.match(/<dl[\s\S]*?<\/dl>/gi) || [];
    for (const dl of dlMatches) {
      const dt = [...dl.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>/gi)].map((m) =>
        cleanText(m[1])
      );
      const dd = [...dl.matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/gi)].map((m) =>
        cleanText(m[1])
      );
      const n = Math.min(dt.length, dd.length);
      for (let i = 0; i < n; i++) {
        const q = dt[i];
        const a = dd[i];
        if (q && a) {
          out.push({ question: q, answer: a });
          debug.dl++;
        }
      }
    }
  }

  // ✅ <h2>FAQ</h2> block + <h3>/<h4> questions
  {
    const faqBlockMatch = src.match(
      /<h2[^>]*>\s*(faqs?|frequently asked questions)\s*<\/h2>([\s\S]*?)(?=<h2[^>]*>|$)/i
    );

    if (faqBlockMatch?.[2]) {
      const block = faqBlockMatch[2];

      const qMatches = [
        ...block.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi),
        ...block.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi),
      ];

      for (const qm of qMatches) {
        const q = cleanText(qm[1]);
        if (!q) continue;

        const startIdx = (qm.index ?? 0) + qm[0].length;
        const rest = block.slice(startIdx);

        const nextIndex = (() => {
          const i3 = rest.search(/<h3[^>]*>/i);
          const i4 = rest.search(/<h4[^>]*>/i);
          if (i3 === -1) return i4;
          if (i4 === -1) return i3;
          return Math.min(i3, i4);
        })();

        const ansChunk = nextIndex >= 0 ? rest.slice(0, nextIndex) : rest;
        const a = cleanText(ansChunk).slice(0, 2500);

        if (q && a) {
          out.push({ question: q, answer: a });
          debug.faqHeading++;
        }
      }
    }
  }

  // ✅ Accordion wrappers
  {
    const wrappers = [
      ...src.matchAll(
        /<div[^>]*class="[^"]*(faq|accordion|collapse)[^"]*"[^>]*>[\s\S]*?<\/div>/gi
      ),
    ];

    for (const w of wrappers) {
      const block = w[0];

      const qMatches = [
        ...block.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi),
        ...block.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi),
        ...block.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi),
        ...block.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/gi),
      ];

      for (const qm of qMatches) {
        const q = cleanText(qm[1]);
        if (!q || q.length < 8) continue;

        const startIdx = (qm.index ?? 0) + qm[0].length;
        const rest = block.slice(startIdx);

        const nextIndex = (() => {
          const indices = [
            rest.search(/<h3[^>]*>/i),
            rest.search(/<h4[^>]*>/i),
            rest.search(/<button[^>]*>/i),
            rest.search(/<strong[^>]*>/i),
          ].filter((x) => x >= 0);
          return indices.length ? Math.min(...indices) : -1;
        })();

        const ansChunk = nextIndex >= 0 ? rest.slice(0, nextIndex) : rest;
        const a = cleanText(ansChunk).slice(0, 2500);

        if (q && a && a.length >= 8) {
          out.push({ question: q, answer: a });
          debug.accordion++;
        }
      }
    }
  }

  // ✅ Old inline Q/A (works when there are <br> / </p> separators)
  {
    const qaPairs = [
      ...src.matchAll(
        /(?:<strong[^>]*>)?\s*Q\s*[:\-]\s*(?:<\/strong>)?\s*([\s\S]*?)\s*(?:<br\s*\/?>|\<\/p\>|\<\/div\>|\n)+\s*(?:<strong[^>]*>)?\s*A\s*[:\-]\s*(?:<\/strong>)?\s*([\s\S]*?)(?=(?:<strong[^>]*>)?\s*Q\s*[:\-]|$)/gi
      ),
    ];

    for (const m of qaPairs) {
      const q = cleanText(m[1]);
      const a = cleanText(m[2]);
      if (q && a) {
        out.push({ question: q, answer: a });
        debug.qaInlineHtml++;
      }
    }
  }

  // ✅✅ NEW: Same-line / same-paragraph Q: ... A: ... Q: ... A: ...
  {
    const text = decodeEntities(
      src
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
    )
      .replace(/\s+/g, " ")
      .trim();

    const matches = [
      ...text.matchAll(
        /(?:^|\s)Q\s*[:\-]\s*(.+?)\s*A\s*[:\-]\s*(.+?)(?=\s*Q\s*[:\-]|$)/gi
      ),
    ];

    for (const m of matches) {
      const q = (m[1] || "").trim();
      const a = (m[2] || "").trim();
      if (q && a) {
        out.push({ question: q, answer: a });
        debug.qaInlineText++;
      }
    }
  }

  // ✅ Deduplicate + filter
  const seen = new Set<string>();
  const unique = out
    .map((x) => ({ question: x.question.trim(), answer: x.answer.trim() }))
    .filter((x) => x.question.length >= 8 && x.answer.length >= 8)
    .filter((x) => {
      const key = `${x.question.toLowerCase()}||${x.answer.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);

  console.log("[FAQ-EXTRACTOR][debug]", debug);

  return unique;
}

function buildFaqJsonLd(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

function buildArticleJsonLd(opts: {
  headline: string;
  url: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  description?: string;
}) {
  const { headline, url, datePublished, dateModified, authorName, description } =
    opts;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    mainEntityOfPage: url,
    url,
    datePublished,
    dateModified,
    author: { "@type": "Organization", name: authorName },
    publisher: { "@type": "Organization", name: authorName },
    ...(description ? { description } : {}),
  };
}

/** ✅ FIX: params is Promise, so await it */
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await props.params;
  const slug = decodeURIComponent(rawSlug || "").trim();

  const canonical = `${SITE_URL}/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(
      `${SITE_URL}/api/blogpost?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return { title: "Moving Quote Texas Blogs", alternates: { canonical } };
    }

    const data = await res.json();
    const title = String(data?.post_title || "Moving Quote Texas Blogs");
    const desc =
      stripHtml(String(data?.post_content ?? "")).slice(0, 160) ||
      "Read this article on Moving Quote Texas Blog.";

    return {
      title,
      description: desc,
      alternates: { canonical },
      openGraph: { type: "article", title, description: desc, url: canonical },
      twitter: { card: "summary", title, description: desc },
    };
  } catch {
    return { title: "Moving Quote Texas Blogs", alternates: { canonical } };
  }
}

/** ✅ FIX: params is Promise, so await it */
export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await props.params;
  const slug = decodeURIComponent(rawSlug || "").trim();

  // 1) Fetch the post on SERVER
  const res = await fetch(
    `${SITE_URL}/api/blogpost?slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );
  if (!res.ok) notFound();

  const post = await res.json();

  const html = String(post?.post_content ?? "");
  // ✅ Soft 404 guard: thin/empty হলে real 404
  if (!post?.id || !post?.post_title || html.length < 800) notFound();

  const title = String(post.post_title || "");
  const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
  const category = String(post.category || "");
  const canonical = `${SITE_URL}/${encodeURIComponent(slug)}`;

  // ✅ NEW: author fields from API (if present)
  const authorName =
    post?.author?.name || post?.author?.email || "Moving Quote Texas";
  const authorImage = typeof post?.author?.image === "string" ? post.author.image : "";

  // 2) Fetch recent posts SERVER-side too (for complete HTML)
  let recent: any[] = [];
  try {
    const recentRes = await fetch(`${SITE_URL}/api/blogpost?limit=6&page=1`, {
      cache: "no-store",
    });
    if (recentRes.ok) {
      const json = await recentRes.json();
      recent = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : [];
      recent = post?.id
        ? recent.filter((p) => p.id !== post.id).slice(0, 6)
        : recent.slice(0, 6);
    }
  } catch {
    // ignore
  }

  /* =========================
     ✅ AUTO FAQ SCHEMA + CONSOLE
  ========================= */

  const faqs = extractFaqFromHtml(html);
  const hasFaqSchema = faqs.length >= 2;

  // ✅ SERVER console (terminal / Vercel logs)
  console.log("[FAQ-SCHEMA][server]", {
    slug,
    extractedCount: faqs.length,
    hasFaqSchema,
    questions: faqs.map((f) => f.question).slice(0, 10),
  });

  const desc =
    stripHtml(html).slice(0, 160) || "Read this article on Moving Quote Texas.";

  const articleJsonLd = buildArticleJsonLd({
    headline: title,
    url: canonical,
    datePublished: createdAt.toISOString(),
    dateModified: createdAt.toISOString(),
    authorName, // ✅ use real author if available
    description: desc,
  });

  const faqJsonLd = hasFaqSchema ? buildFaqJsonLd(faqs) : null;

  return (
    <div className="min-h-screen bg-white relative">
      {/* ✅ JSON-LD (Article) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* ✅ JSON-LD (FAQ) only if found */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* ✅ BROWSER console (Chrome DevTools -> Console) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            console.log("[FAQ-SCHEMA][browser] slug:", ${JSON.stringify(slug)});
            console.log("[FAQ-SCHEMA][browser] extractedCount:", ${faqs.length});
            console.log("[FAQ-SCHEMA][browser] hasFaqSchema:", ${hasFaqSchema});
            console.log("[FAQ-SCHEMA][browser] questions:", ${JSON.stringify(
              faqs.map((f) => f.question).slice(0, 10)
            )});
          `,
        }}
      />

      {/* Header */}
      <header className="py-6 border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-slate-500 text-sm">
              <li>
                <Link href="/" className="hover:text-cyan-600">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blog" className="hover:text-cyan-600">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-800 font-medium">
                {title}
              </li>
            </ol>
          </nav>
        </div>
      </header>

      {/* 3 COLUMN LAYOUT (SERVER rendered) */}
      <main
        className="
          mx-auto w-full
          max-w-none
          px-3 sm:px-6 lg:px-8 2xl:px-10
          pt-8 md:pt-10 pb-20 md:pb-24
          grid grid-cols-1 lg:grid-cols-12
          gap-6 lg:gap-8 2xl:gap-10
        "
      >
        {/* LEFT ADS */}
        <aside className="order-2 lg:order-1 lg:col-span-2 hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <div className="border border-slate-200 rounded-xl bg-slate-50 h-[700px] flex items-center justify-center text-slate-400 text-sm">
              Google Ads Area
            </div>
            <div className="border border-slate-200 rounded-xl bg-slate-50 h-[280px] flex items-center justify-center text-slate-400 text-sm">
              Ads / Banner
            </div>
          </div>
        </aside>

        {/* CENTER BLOG */}
        <article
          className="order-1 lg:order-2 lg:col-span-8 xl:col-span-7 2xl:col-span-8 min-w-0"
          itemScope
          itemType="https://schema.org/Article"
        >
          <div className="max-w-none space-y-8 bg-white lg:border lg:border-slate-100 lg:rounded-2xl lg:p-8 xl:p-10 2xl:p-12 lg:shadow-sm">
            {/* Title */}
            <div className="relative group">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-snug"
                itemProp="headline"
              >
                {title}
              </h1>

              <BlogPostEditorClient
                mode="title"
                post={post}
                slug={slug}
                canonical={canonical}
              />
            </div>




            {/* Content */}
            <div className="relative group">
              <BlogPostEditorClient
                mode="content"
                post={post}
                slug={slug}
                canonical={canonical}
              />
{/* ✅ AUTHOR ROW (improved layout) */}
<div className="mt-10 flex items-center gap-4">
  {/* Avatar */}
  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-200 border border-slate-200">
    {authorImage ? (
      <Image
        src={authorImage}
        alt={authorName}
        fill
        sizes="48px"
        className="object-cover"
      />
    ) : null}
  </div>

  {/* Name + meta */}
  <div className="leading-tight">
    {/* Author Name */}
    <p className="text-[16px] font-extrabold tracking-wide text-slate-900 uppercase">
      {authorName}
    </p>

    {/* Category + Date (same line) */}
    <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500">
      {category && (
        <>
          <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold text-xs uppercase">
            {category}
          </span>
          <span className="text-slate-300">•</span>
        </>
      )}

      <span>
        Last Updated:{" "}
        {createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  </div>
</div>
              <div
                className="
                  blog-content mt-10 max-w-none text-slate-800 leading-relaxed
                  text-[16px] sm:text-[17px] md:text-[18px] 2xl:text-[19px]
                  overflow-x-auto
                "
                dangerouslySetInnerHTML={{ __html: html }}
                itemProp="articleBody"
              />
            </div>

            {/* hidden SEO meta */}
            <div className="sr-only">
              <time dateTime={createdAt.toISOString()} itemProp="datePublished">
                {createdAt.toISOString()}
              </time>
              <meta itemProp="dateModified" content={createdAt.toISOString()} />

              {/* ✅ author name for SEO meta */}
              <meta itemProp="author" content={authorName} />
            </div>
          </div>
        </article>

        {/* RIGHT RECENT BLOGS */}
        <aside className="order-3 lg:order-3 lg:col-span-2 xl:col-span-3 2xl:col-span-2 mt-2 lg:mt-0 min-w-0">
          <div className="fixed pr-5">
            <MovingCalculator />
          </div>
        </aside>

        {/* MOBILE ADS */}
        <div className="order-4 lg:hidden">
          <div className="mt-6 space-y-4">
            <div className="border border-slate-200 rounded-xl bg-slate-50 h-[220px] flex items-center justify-center text-slate-400 text-sm">
              Google Ads Area (Mobile)
            </div>
            <div className="border border-slate-200 rounded-xl bg-slate-50 h-[160px] flex items-center justify-center text-slate-400 text-sm">
              Banner Ads (Mobile)
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}