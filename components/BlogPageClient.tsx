"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useCallback,
  useRef,
} from "react";
import Link from "next/link";
import Image from "next/image";

interface Blog {
  id: number;
  post_title: string;
  post_category: string;
  post_tags: string;
  createdAt: string;
  imageUrl: string;
  excerpt: string;

  // ✅ from API
  post_status?: "publish" | "draft" | "unpublish" | string;

  // ✅ NEW: author info from API
  author?: {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
  } | null;
}

interface BlogResponse {
  data: Blog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** ✅ slugify helper */
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

/** ✅ normalize any kind of relative image path safely for next/image */
const normalizeImageUrl = (src?: string) => {
  const fallback = "/placeholder-blog.svg";
  if (!src) return fallback;

  let s = String(src).trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  s = s.replace(/^(\.\.\/)+/g, "/");
  s = s.replace(/^(\.\/)+/g, "/");
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/^\/public\//, "/");
  if (s === "/" || s.length < 2) return fallback;

  return s;
};

const BlogCardSkeleton: React.FC = React.memo(() => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 animate-pulse h-full flex flex-col">
    <div className="relative w-full h-48 bg-gray-200" />
    <div className="p-6 flex flex-col flex-grow gap-3">
      <div className="h-3 w-20 bg-gray-200 rounded-full" />
      <div className="h-6 w-3/4 bg-gray-200 rounded-md" />
      <div className="space-y-2 mt-2">
        <div className="h-3 w-full bg-gray-200 rounded-md" />
        <div className="h-3 w-5/6 bg-gray-200 rounded-md" />
        <div className="h-3 w-2/3 bg-gray-200 rounded-md" />
      </div>
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="h-3 w-24 bg-gray-200 rounded-full" />
        <div className="h-3 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
));
BlogCardSkeleton.displayName = "BlogCardSkeleton";

const BlogCard: React.FC<{ post: Blog }> = React.memo(({ post }) => {
  const postDateText = useMemo(
    () =>
      new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [post.createdAt]
  );

  const safeImg = normalizeImageUrl(post.imageUrl);
  const postSlug = useMemo(() => slugify(post.post_title || ""), [post.post_title]);

  const href = `/${encodeURIComponent(postSlug)}`;

  // ✅ NEW: author UI helpers
  const authorName =
    post.author?.name || post.author?.email || "Unknown Author";

  const authorImg = normalizeImageUrl(post.author?.image || "");

  const authorInitials = useMemo(() => {
    const base = String(post.author?.name || post.author?.email || "U").trim();
    if (!base) return "U";
    const parts = base.split(/\s+/).filter(Boolean);
    const ini = (parts[0]?.[0] || "U") + (parts[1]?.[0] || "");
    return ini.toUpperCase().slice(0, 2);
  }, [post.author?.name, post.author?.email]);

  const showAuthorImage =
    !!post.author?.image && authorImg !== "/placeholder-blog.svg";

  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col border border-gray-100">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={safeImg}
            alt={post.post_title}
            fill
            loading="lazy"
            style={{ objectFit: "cover" }}
            className="group-hover:scale-105 transition-transform duration-500 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <span className="text-xs font-semibold uppercase text-indigo-600 tracking-widest mb-2">
            {post.post_category}
          </span>

          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-indigo-700 transition-colors">
            {post.post_title}
          </h2>

          <p className="text-gray-600 line-clamp-3 flex-grow">{post.excerpt}</p>

          {/* ✅ NEW: Author row (image + name) */}
          <div className="mt-4 flex items-center gap-3">
            
            <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-700 text-xs font-semibold shrink-0">
            
              {showAuthorImage ? (
                <img
                  src={authorImg}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                authorInitials
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {authorName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {post.author?.email ? post.author.email : "Author"}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <time dateTime={new Date(post.createdAt).toISOString()}>
              {postDateText}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
});
BlogCard.displayName = "BlogCard";

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

export default function BlogPageClient({
  initialBlogs,
  initialMeta,
  postsPerPage,
}: {
  initialBlogs: Blog[];
  initialMeta: BlogResponse["meta"];
  postsPerPage: number;
}) {
  const initialPage = initialMeta.page || 1;

  // ✅ No need to filter since API only returns published posts
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);

  const [currentPage, setCurrentPage] = useState(initialPage);

  // ✅ IMPORTANT: start with meta, but will be corrected below safely
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages || 1);

  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const didMountRef = useRef(false);
  const pageCacheRef = useRef<Map<number, Blog[]>>(new Map());

  // ✅ cache initial page (no filtering needed)
  useEffect(() => {
    pageCacheRef.current.set(initialPage, initialBlogs);
  }, [initialPage, initialBlogs]);

  /**
   * ✅ If a fetched page has 0 published posts, it should not create pagination.
   * We shrink totalPages to the last page that actually has published posts.
   * (Especially useful if API meta is stale/wrong)
   */
  const findLastNonEmptyPublishedPage = useCallback(
    async (apiTotalPages: number) => {
      let p = Math.max(1, apiTotalPages);

      while (p > 1) {
        const cached = pageCacheRef.current.get(p);
        if (cached && cached.length > 0) return p;
        if (cached && cached.length === 0) {
          p--;
          continue;
        }

        try {
          const res = await fetch(`/api/blogpost?page=${p}&limit=${postsPerPage}`, {
            cache: "no-store",
          });
          if (!res.ok) break;

          const json: BlogResponse = await res.json();
          const pageData = json.data || [];
          pageCacheRef.current.set(p, pageData);

          if (pageData.length > 0) return p;
        } catch {
          break;
        }

        p--;
      }

      return 1;
    },
    [postsPerPage]
  );

  const fetchPage = useCallback(
    async (page: number, controller: AbortController) => {
      setError(null);
      setPageLoading(true);

      try {
        const res = await fetch(`/api/blogpost?page=${page}&limit=${postsPerPage}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch blogs");

        const json: BlogResponse = await res.json();

        const pageData = json.data || [];
        pageCacheRef.current.set(page, pageData);

        // ✅ Fix totalPages based on API response
        const apiTotal = json.meta?.totalPages || 1;
        const trimmedLast = await findLastNonEmptyPublishedPage(apiTotal);

        startTransition(() => {
          setBlogs(pageData);
          setTotalPages(trimmedLast);
        });

        // ✅ If this page has no posts, jump back safely
        if (pageData.length === 0 && page > 1) {
          setCurrentPage((prev) => Math.min(prev - 1, trimmedLast));
        }

        // ✅ prefetch next page silently
        if (page < trimmedLast) {
          fetch(`/api/blogpost?page=${page + 1}&limit=${postsPerPage}`, {
            cache: "no-store",
          })
            .then((r) => r.json())
            .then((nextJson: BlogResponse) => {
              pageCacheRef.current.set(page + 1, nextJson.data || []);
            })
            .catch(() => {});
        }
      } catch (e: unknown) {
        if (!isAbortError(e)) {
          console.error(e);
          setError("Failed to load articles. Please check your connection.");
        }
      } finally {
        setPageLoading(false);
      }
    },
    [postsPerPage, startTransition, findLastNonEmptyPublishedPage]
  );

  // ✅ On mount: shrink totalPages based on real published pages (safety)
  useEffect(() => {
    (async () => {
      const trimmedLast = await findLastNonEmptyPublishedPage(initialMeta.totalPages || 1);
      setTotalPages(trimmedLast);
      setCurrentPage((p) => (p > trimmedLast ? trimmedLast : p));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMeta.totalPages]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const cached = pageCacheRef.current.get(currentPage);
    if (cached) {
      startTransition(() => setBlogs(cached));
      return;
    }

    const controller = new AbortController();
    fetchPage(currentPage, controller);
    return () => controller.abort();
  }, [currentPage, fetchPage, startTransition]);

  const paginate = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const maxVisiblePages = 3;
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= maxVisiblePages) return [1, 2, 3, "...", totalPages];
    if (currentPage > totalPages - maxVisiblePages)
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  if (error) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
          <p className="text-xl font-semibold text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight">
            Our Blogs
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with our latest industry deep-dives, expert opinions, and essential
            guides.
          </p>
        </div>

        {(pageLoading || isPending) && (
          <div className="w-full h-1 bg-gray-200 rounded mb-6 overflow-hidden">
            <div className="h-full w-1/3 bg-indigo-500 animate-pulse" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {blogs.length === 0 && pageLoading
            ? Array.from({ length: postsPerPage }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))
            : blogs.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-16">
            <nav className="flex space-x-1 p-2 bg-white rounded-xl shadow-lg border border-gray-200">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                ← Prev
              </button>

              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="px-4 py-2 text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => paginate(Number(page))}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Next →
              </button>
            </nav>
          </div>
        )}

        {/* ✅ SEO: crawlable pagination links (UI change হবে না) */}
        {totalPages > 1 && (
          <div className="sr-only" aria-hidden="true">
            <h2>Blog Pagination</h2>
            <ul>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <li key={p}>
                  <a href={`/blog?page=${p}`}>Blog page {p}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}