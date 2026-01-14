import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import BlogPostEditorClient from "./BlogPostEditorClient";

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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug || "").trim();
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

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug || "").trim();

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

  // 2) Fetch recent posts SERVER-side too (for complete HTML)
  let recent: any[] = [];
  try {
    const recentRes = await fetch(`${SITE_URL}/api/blogpost?limit=6&page=1`, {
      cache: "no-store",
    });
    if (recentRes.ok) {
      const json = await recentRes.json();
      recent = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
      recent = post?.id ? recent.filter((p) => p.id !== post.id).slice(0, 6) : recent.slice(0, 6);
    }
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen bg-white relative">
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

        {/* CENTER BLOG (SERVER HTML => Google sees it) */}
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

              {/* ✅ Edit button/modal will be injected by client component */}
              <BlogPostEditorClient
                mode="title"
                post={post}
                slug={slug}
                canonical={canonical}
              />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>
                {createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>

              {category && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold text-xs uppercase">
                    {category}
                  </span>
                </>
              )}
            </div>

            {/* Content */}
            <div className="relative group">
              {/* ✅ Edit button/modal injected by client */}
              <BlogPostEditorClient
                mode="content"
                post={post}
                slug={slug}
                canonical={canonical}
              />

              <div
                className="
                  blog-content mt-2 max-w-none text-slate-800 leading-relaxed
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
              <meta itemProp="author" content="Moving Quote Texas" />
            </div>
          </div>
        </article>

        {/* RIGHT RECENT BLOGS (SERVER rendered) */}
        <aside className="order-3 lg:order-3 lg:col-span-2 xl:col-span-3 2xl:col-span-2 mt-2 lg:mt-0 min-w-0">
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="p-5 sm:p-6 border border-slate-100 rounded-xl bg-white shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">New Blogs</h3>

              {recent.length === 0 ? (
                <p className="text-sm text-slate-500">No recent posts found.</p>
              ) : (
                <div className="space-y-4">
                  {recent.map((p) => {
                    const pSlug = slugify(String(p?.post_title || ""));
                    const pDesc = stripHtml(String(p?.excerpt || p?.post_content || "")).slice(0, 90);
                    const pDate = p?.createdAt ? new Date(p.createdAt) : null;

                    return (
                      <Link
                        key={p.id}
                        href={`/${encodeURIComponent(pSlug)}`}
                        className="block group"
                      >
                        <div className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 group-hover:text-cyan-700 line-clamp-2">
                              {String(p?.post_title || "")}
                            </p>
                            {pDate && (
                              <p className="text-xs text-slate-500 mt-1">
                                {pDate.toLocaleDateString()}
                              </p>
                            )}
                            {pDesc && (
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                {pDesc}...
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 text-center">
                <Link
                  href="/blog"
                  className="text-cyan-600 text-sm font-semibold hover:text-cyan-700 transition"
                >
                  View all →
                </Link>
              </div>
            </div>
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
