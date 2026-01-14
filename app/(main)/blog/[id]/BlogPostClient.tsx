"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import BlogPostForm from "@/components/BlogPostForm";

/** Types */
interface Blog {
  post_content: string;
  createdAt: string | number | Date;
  id: number;
  post_title: string;
  category?: string;
  tags?: string[] | string;
  post_status?: "draft" | "publish" | "private" | string;
  imageUrl?: string;
  excerpt?: string;
  readTime?: number;
  slug?: string;
}

/* ---------- helpers ---------- */
const SITE_URL_RAW =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.example.com";
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

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

function normalizeSlugParam(slug: string) {
  return String(slug || "").trim();
}

function toBlog(data: any): Blog {
  return {
    id: data.id,
    post_title: data.post_title,
    post_content:
      typeof data.post_content === "object" && data.post_content?.text
        ? data.post_content.text
        : String(data.post_content ?? ""),
    createdAt: data.createdAt,
    category: data.category ?? "",
    tags: data.tags ?? [],
    post_status: data.post_status ?? "draft",
    imageUrl: data.imageUrl,
    excerpt: data.excerpt,
    readTime: data.readTime,
    slug: data.slug,
  };
}

/** ✅ UPDATED: server-rendered initialPost support */
export default function BlogPostClient({
  slug,
  initialPost,
}: {
  slug: string;
  initialPost?: any;
}) {
  const router = useRouter();

  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const normalizedSlug = useMemo(() => normalizeSlugParam(slug), [slug]);

  // ✅ IMPORTANT: initialPost থাকলে, প্রথম render এই post ready থাকবে (SEO)
const [post, setPost] = useState<Blog | null>(() =>
  initialPost?.id ? toBlog(initialPost) : null
);

// ✅ initialPost থাকলে loading false
const [loading, setLoading] = useState<boolean>(!initialPost?.id);


  // ✅ recent posts state
  const [recentPosts, setRecentPosts] = useState<Blog[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // === unified modal state ===
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editBlogData, setEditBlogData] = useState<{
    id?: number;
    post_title: string;
    post_content: string;
    category?: string;
    tags?: string[] | string;
    post_status?: "draft" | "publish" | "private" | string;
  } | null>(null);

  
  useEffect(() => {
   
    if (!normalizedSlug) return;

   if (initialPost?.id) {
    setLoading(false);
    return;
  }
    const controller = new AbortController();

    // const refresh = async () => {
    //   try {
    //     const res = await fetch(
    //       `/api/blogpost?slug=${encodeURIComponent(normalizedSlug)}`,
    //       { signal: controller.signal }
    //     );

    //     if (!res.ok) return;
    //     const data = await res.json();
    //     if (!data?.id) return;

    //     const transformed = toBlog(data);
    //     setPost(transformed);

    //     // canonical slug correction
    //     const trueSlug =
    //       typeof data.slug === "string" && data.slug.trim()
    //         ? String(data.slug).trim()
    //         : "";

    //     if (trueSlug && trueSlug !== normalizedSlug) {
    //       router.replace(`/${encodeURIComponent(trueSlug)}`, { scroll: false });
    //     }
    //   } catch (e) {
    //     if (!isAbortError(e)) console.error(e);
    //   }
    // };

    // background refresh only if you want:
    // refresh();

    return () => controller.abort();
  }, [normalizedSlug, router, initialPost?.id]);

  /** ✅ Fetch recent/new blog posts for right sidebar */
  useEffect(() => {
    const controller = new AbortController();

    const fetchRecent = async () => {
      setRecentLoading(true);
      try {
        const res = await fetch(`/api/blogpost?limit=6&page=1`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch recent posts");

        const json = await res.json();
        const list: Blog[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : [];

        const filtered = post?.id
          ? list.filter((p) => p.id !== post.id).slice(0, 6)
          : list.slice(0, 6);

        setRecentPosts(filtered);
      } catch (e) {
        if (!isAbortError(e)) console.error(e);
      } finally {
        setRecentLoading(false);
      }
    };

    fetchRecent();
    return () => controller.abort();
  }, [post?.id]);

  /** ✅ Open Edit */
  const openEdit = (_focus?: "title" | "content") => {
    void _focus;
    if (!isAuthed) return signIn();
    if (!post) return;

    setEditBlogData({
      id: post.id,
      post_title: post.post_title || "",
      post_content: post.post_content || "",
      category: post.category || "",
      tags: post.tags ?? "",
      post_status: post.post_status ?? "draft",
    });
    setIsFormVisible(true);
  };

  /** Close modal */
  const handleCloseModal = () => {
    setIsFormVisible(false);
    setEditBlogData(null);
  };

  /** Update (PUT) */
  const handleUpdateBlog = async (payload: {
    id?: number;
    post_title: string;
    post_content: string;
    category?: string;
    tags?: string[] | string;
    post_status?: "draft" | "publish" | "private" | string;
  }) => {
    try {
      const res = await fetch("/api/blogpost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payload.id ?? post?.id,
          post_title: payload.post_title,
          post_content: payload.post_content,
          category: payload.category ?? "",
          tags: payload.tags,
          post_status: payload.post_status ?? "draft",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update");
      }

      const updated: Blog = await res.json();
      setPost((prev) => (prev ? { ...prev, ...updated } : updated));
      handleCloseModal();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update failed";
      alert(msg);
      console.error(e);
    }
  };

  /* ---------- SEO ---------- */
  const title = post?.post_title ?? "Untitled Post";
  const description =
    stripHtml(post?.post_content ?? "").slice(0, 160) ||
    "Read this article on Moving Quote Texas Blog.";

  const canonical = `${SITE_URL}/${encodeURIComponent(normalizedSlug)}`;

  const isPublished =
    String(post?.post_status ?? "draft").toLowerCase() === "publish" ||
    String(post?.post_status ?? "draft").toLowerCase() === "published";

  const keywords =
    (Array.isArray(post?.tags)
      ? post?.tags
      : String(post?.tags || "").split(","))
      .map((t) => String(t).trim())
      .filter(Boolean)
      .join(", ") || undefined;

  const dateISO = post?.createdAt
    ? new Date(post.createdAt).toISOString()
    : new Date().toISOString();

  const jsonLd = post && {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: dateISO,
    dateModified: dateISO,
    author: [{ "@type": "Organization", name: "Moving Quote Texas" }],
    publisher: {
      "@type": "Organization",
      name: "Moving Quote Texas",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: canonical,
    articleSection: post?.category || undefined,
    keywords,
  };

  /** ✅ Skeleton loader — এখন সাধারণত দেখাবে না, কারণ initialPost আছে */
  if (loading) {
    // (তোমার আগের skeleton unchanged)
    return (
      <>
        <Head>
          <title>Loading… | Moving Quote Texas Blog</title>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href={canonical} />
        </Head>
        {/* ...same skeleton UI... */}
        <div className="min-h-screen bg-white" />
      </>
    );
  }
  if (!post) {
    return (
      <>
        <Head>
          <title>Not Found | Moving Quote Texas Blog</title>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href={canonical} />
        </Head>
        <div className="min-h-screen grid place-items-center bg-slate-50">
          <div className="text-center p-10 bg-white rounded-xl shadow-2xl">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-cyan-100 shadow-inner flex items-center justify-center">
              <span className="text-4xl">🤷‍♂️</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Content Missing
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              The requested article could not be located.
            </p>
            <Link
              href="/blog"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-700 transition"
            >
              <span className="text-xl">←</span> Return to Blog Home
            </Link>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Head>
        <title>{`${title}`}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <link rel="canonical" href={canonical} />
        <meta
          name="robots"
          content={
            isPublished
              ? "index,follow"
              : "noindex,nofollow,noimageindex,nocache"
          }
        />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Moving Quote Texas Blog" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${title}`} />
        <meta name="twitter:description" content={description} />
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </Head>

      {/* ====== UI (same as your original) ====== */}
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

        {/* 3 COLUMN LAYOUT */}
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
                  {post.post_title}
                </h1>

                {isAuthed && (
                  <button
                    type="button"
                    onClick={() => openEdit("title")}
                    title="Edit title"
                    className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus:opacity-100
                               transition rounded-full bg-cyan-600 text-white p-2 shadow-lg hover:bg-cyan-700"
                  >
                    ✎
                  </button>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>

                {post.category && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold text-xs uppercase">
                      {post.category}
                    </span>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="relative group">
                {isAuthed && (
                  <button
                    type="button"
                    onClick={() => openEdit("content")}
                    title="Edit content"
                    className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus:opacity-100
                               transition rounded-full bg-cyan-600 text-white p-2 shadow-lg hover:bg-cyan-700 z-10"
                  >
                    ✎
                  </button>
                )}

                <div
                  className="
                    blog-content mt-2 max-w-none text-slate-800 leading-relaxed
                    text-[16px] sm:text-[17px] md:text-[18px] 2xl:text-[19px]
                    overflow-x-auto
                  "
                  dangerouslySetInnerHTML={{ __html: post.post_content }}
                  itemProp="articleBody"
                />
              </div>

              {/* hidden SEO meta */}
              <div className="sr-only">
                <time dateTime={dateISO} itemProp="datePublished">
                  {dateISO}
                </time>
                <meta itemProp="dateModified" content={dateISO} />
                <meta itemProp="author" content="Moving Quote Texas" />
                {keywords && <meta itemProp="keywords" content={keywords} />}
              </div>
            </div>
          </article>

          {/* RIGHT RECENT BLOGS */}
          <aside className="order-3 lg:order-3 lg:col-span-2 xl:col-span-3 2xl:col-span-2 mt-2 lg:mt-0 min-w-0">
            <div className="lg:sticky lg:top-6 space-y-6">
              <div className="p-5 sm:p-6 border border-slate-100 rounded-xl bg-white shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  New Blogs
                </h3>

                {recentLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-20 bg-slate-100 rounded-lg" />
                    <div className="h-20 bg-slate-100 rounded-lg" />
                    <div className="h-20 bg-slate-100 rounded-lg" />
                  </div>
                ) : recentPosts.length === 0 ? (
                  <p className="text-sm text-slate-500">No recent posts found.</p>
                ) : (
                  <div className="space-y-4">
                    {recentPosts.map((p) => {
                      const pSlug = slugify(p.post_title || "");
                      const pDesc = stripHtml(p.excerpt || p.post_content || "").slice(0, 90);

                      return (
                        <Link
                          key={p.id}
                          href={`/${encodeURIComponent(pSlug)}`}
                          className="block group"
                        >
                          <div className="flex gap-3 p-3 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 group-hover:text-cyan-700 line-clamp-2">
                                {p.post_title}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </p>
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

      {/* Edit Modal unchanged */}
      {isFormVisible && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl p-8 w-11/12 max-w-4xl shadow-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-2">
              <h2 className="text-2xl font-bold">Edit Blog</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <BlogPostForm
              initialData={editBlogData!}
              onClose={handleCloseModal}
              onUpdate={handleUpdateBlog}
            />
          </div>
        </div>
      )}
    </>
  );
}
