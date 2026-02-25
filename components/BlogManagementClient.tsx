"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
  useTransition,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client"; // ✅ NEW

/** Lazy-loaded components (for faster initial load) */
const BlogPostForm = dynamic(() => import("@/components/BlogPostForm"), {
  suspense: true,
});

/** Types */
interface Blog {
  id: number;
  post_title: string;
  post_content: string;
  post_category: string;
  post_tags: string;
  createdAt: string | Date | null;
  imageUrl?: string | null;
  excerpt?: string;
  readTime?: number;
  _searchTitle?: string;

  // ✅ DB field
  post_status?: "publish" | "draft" | "unpublish" | string;

  // ✅ UI derived
  isPublished?: boolean;

  // ✅ NEW: author info from API
  author?: {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
  } | null;
}

interface BlogMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BlogResponse {
  data: unknown[];
  items?: unknown[];
  meta?: BlogMeta;
}

/** ✅ normalize any kind of relative image path safely for next/image */
const normalizeImageUrl = (src?: string | null) => {
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

/** ✅ pull first image from html content */
const extractFirstImage = (html: string) => {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] || null;
};

/** ✅ strip html -> first non-empty line (excerpt) */
const getFirstLine = (html: string) => {
  const text = html.replace(/<[^>]*>/g, " ");
  const line =
    text
      .split("\n")
      .map((s) => s.trim())
      .find(Boolean) || "";
  return line;
};

const SkeletonCard: React.FC = React.memo(() => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
    <div className="w-full h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-20 bg-gray-200 rounded" />
      <div className="h-6 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 rounded" />
      <div className="h-3 w-2/3 bg-gray-200 rounded" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

/** ✅ Admin card view */
const AdminBlogCard: React.FC<{
  post: Blog;
  onEdit: (b: Blog) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number, nextPublished: boolean) => void;
}> = React.memo(({ post, onEdit, onDelete, onTogglePublish }) => {
  const safeImg = normalizeImageUrl(post.imageUrl);

  const postDate = useMemo(
    () =>
      post.createdAt
        ? new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—",
    [post.createdAt]
  );

  const status = String(post.post_status ?? "unpublish").toLowerCase().trim();
  const published = status === "publish";

  const badgeText =
    status === "publish" ? "Published" : status === "draft" ? "Draft" : "Unpublished";

  const authorName = post.author?.name || post.author?.email || "—"; // ✅ NEW

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
      {/* NOTE: this link might not match your public slug routing, but kept as-is */}
      <Link href={`/blog/${post.id}`} className="group">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={safeImg}
            alt={post.post_title}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <span className="text-xs font-semibold uppercase text-indigo-600 tracking-widest mb-2">
          {post.post_category && post.post_category.trim()
            ? post.post_category.trim()
            : "Uncategorized"}
        </span>

        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
          {post.post_title}
        </h2>

        <p className="text-gray-600 line-clamp-3 flex-1">{post.excerpt || "—"}</p>

        {/* ✅ NEW: Author */}
        <p className="mt-2 text-xs text-gray-500">
          Author: <span className="font-medium text-gray-700">{authorName}</span>
        </p>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>{postDate}</span>
          <span>{post.readTime || 1} min read</span>
        </div>

        {/* ✅ Status badge */}
        <div className="mt-3">
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
              published ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
            }`}
          >
            {badgeText}
          </span>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            onClick={() => onEdit(post)}
            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Edit
          </button>

          {/* ✅ Toggle publish <-> unpublish */}
          <button
            onClick={() => onTogglePublish(post.id, !published)}
            className={`px-3 py-2 text-sm text-white rounded-lg ${
              published ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {published ? "Unpublish" : "Publish"}
          </button>

          <button
            onClick={() => onDelete(post.id)}
            className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});
AdminBlogCard.displayName = "AdminBlogCard";

// ✅ AbortError checker
function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

const BlogManagementClient: React.FC<{
  initialBlogs: unknown[];
  initialMeta: NonNullable<BlogResponse["meta"]>;
  itemsPerPage: number; // 9
}> = ({ initialBlogs, initialMeta, itemsPerPage }) => {
  const { data: session } = useSession(); // ✅ NEW
  const sessionUser = (session as any)?.user;
  const sessionAuthorName = sessionUser?.name || sessionUser?.email || "Unknown"; // ✅ NEW

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  type StatusFilter = "all" | "publish" | "draft" | "unpublish";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [currentPage, setCurrentPage] = useState(initialMeta.page || 1);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages || 1);

  const [blogs, setBlogs] = useState<Blog[]>(() => {
    const list = initialBlogs || [];
    return list.map(mapApiToBlog);
  });

  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [reloadTick, setReloadTick] = useState(0);
  const forceReload = useCallback(() => setReloadTick((t) => t + 1), []);

  const didSkipInitial = useRef(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (!didSkipInitial.current && currentPage === initialMeta.page && !searchQuery) {
      didSkipInitial.current = true;
      return;
    }

    const controller = new AbortController();

    const fetchPageBlogs = async () => {
      setError(null);
      setPageLoading(true);

      try {
        const qs = new URLSearchParams();
        qs.set("mode", "dashboard"); // ✅ IMPORTANT: admin sees ALL statuses
        qs.set("page", String(currentPage));
        qs.set("limit", String(itemsPerPage));
        if (searchQuery.trim()) qs.set("q", searchQuery.trim());
        if (statusFilter !== "all") qs.set("status", statusFilter); // ✅ Send status filter to API

        const res = await fetch(`/api/blogpost?${qs.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch blogs");

        const json: unknown = await res.json();

        const list: unknown[] = Array.isArray(json)
          ? json
          : (json as BlogResponse).data || (json as BlogResponse).items || [];

        const mapped: Blog[] = list.map(mapApiToBlog);

        startTransition(() => {
          setBlogs(mapped);
          // ✅ Update totalPages from server response
          if (json && typeof json === "object" && "meta" in json) {
            const meta = (json as BlogResponse).meta;
            if (meta?.totalPages) {
              setTotalPages(meta.totalPages);
            }
          }
        });
      } catch (e: unknown) {
        if (!isAbortError(e)) {
          console.error(e);
          setError("Failed to fetch blogs. Please try again later.");
        }
      } finally {
        setPageLoading(false);
      }
    };

    fetchPageBlogs();
    return () => controller.abort();
  }, [currentPage, itemsPerPage, reloadTick, initialMeta.page, searchQuery, statusFilter]);

  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    publish: 0,
    draft: 0,
    unpublish: 0,
  });

  // ✅ Fetch status counts for all blogs
  const fetchStatusCounts = useCallback(async () => {
    try {
      const res = await fetch(`/api/blogpost?mode=dashboard&limit=1000`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json: BlogResponse = await res.json();
        const allBlogs = (json.data || []).map(mapApiToBlog);

        const counts = { all: allBlogs.length, publish: 0, draft: 0, unpublish: 0 };
        for (const b of allBlogs) {
          const s = String(b.post_status ?? "unpublish").toLowerCase().trim() as StatusFilter;
          if (s === "publish" || s === "draft" || s === "unpublish") counts[s]++;
        }
        setStatusCounts(counts);
      }
    } catch (e) {
      console.error("Failed to fetch status counts:", e);
    }
  }, []);

  // ✅ Fetch status counts on initial load
  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  const handleCreateNewClick = useCallback(() => {
    setEditBlogData(null);
    setIsFormVisible(true);
  }, []);

  const handleEditClick = useCallback(async (blog: Blog) => {
    if (!blog.post_content) {
      try {
        const res = await fetch(`/api/blogpost?mode=dashboard&id=${blog.id}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const full: unknown = await res.json();
          blog = mapApiToBlog(full);
        }
      } catch {}
    }
    setEditBlogData(blog);
    setIsFormVisible(true);
  }, []);

  const handleDeleteClick = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this blog post?")) return;

      setBlogs((prev) => prev.filter((b) => b.id !== id)); // optimistic

      try {
        const response = await fetch("/api/blogpost", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error("Failed to delete");

        alert("Blog post deleted successfully!");
        fetchStatusCounts(); // ✅ Update status counts
        forceReload();
      } catch {
        alert("Failed to delete blog post. Please try again.");
        fetchStatusCounts(); // ✅ Update status counts
        forceReload();
      }
    },
    [forceReload, fetchStatusCounts]
  );

  /** ✅ publish/unpublish -> SAVE to DB field post_status */
  const handleTogglePublish = useCallback(
    async (id: number, nextPublished: boolean) => {
      const nextStatus: Blog["post_status"] = nextPublished ? "publish" : "unpublish";

      // optimistic UI
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, post_status: nextStatus, isPublished: nextPublished } : b
        )
      );

      try {
        const res = await fetch("/api/blogpost", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, post_status: nextStatus }),
        });

        const payload = await res.json().catch(() => null);

        if (!res.ok) {
          console.error("PUT failed:", res.status, payload);
          throw new Error((payload as any)?.error || "Failed to update status");
        }

        // server/DB truth -> UI sync
        if (payload) {
          const mapped = mapApiToBlog(payload);
          setBlogs((prev) => prev.map((b) => (b.id === id ? mapped : b)));
        } else {
          forceReload();
        }
        fetchStatusCounts(); // ✅ Update status counts
      } catch {
        // rollback
        setBlogs((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  post_status: nextPublished ? "unpublish" : "publish",
                  isPublished: !nextPublished,
                }
              : b
          )
        );
        alert("DB update failed. Please try again.");
        fetchStatusCounts(); // ✅ Update status counts
      }
    },
    [forceReload, fetchStatusCounts]
  );

  const handleCloseModal = useCallback(() => {
    setIsFormVisible(false);
    setEditBlogData(null);
  }, []);

  const handleUpdateBlog = useCallback(() => {
    setIsFormVisible(false);
    setEditBlogData(null);

    if (currentPage !== 1) setCurrentPage(1);
    else {
      fetchStatusCounts(); // ✅ Update status counts
      forceReload();
    }
  }, [currentPage, forceReload, fetchStatusCounts]);

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
    return <p className="text-center text-red-500">Failed to fetch blogs. Please try again later.</p>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            {(["all", "publish", "draft", "unpublish"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg border transition ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {s === "all" ? "All" : s === "publish" ? "Published" : s === "draft" ? "Draft" : "Unpublished"}
                <span className="ml-2 text-xs opacity-80">
                  (
                  {s === "all"
                    ? statusCounts.all
                    : s === "publish"
                    ? statusCounts.publish
                    : s === "draft"
                    ? statusCounts.draft
                    : statusCounts.unpublish}
                  )
                </span>
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 border border-slate-400 p-2 rounded-lg"
          />
          <button
            onClick={handleCreateNewClick}
            className="text-lg font-bold bg-blue-500 px-4 py-2 text-white rounded-xl"
          >
            Create New +
          </button>
        </div>
      </div>

      <hr />

      {(pageLoading || isPending) && (
        <div className="w-full h-1 bg-gray-200 rounded my-4 overflow-hidden">
          <div className="h-full w-1/3 bg-indigo-500 animate-pulse" />
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pageLoading && blogs.length === 0 ? (
          Array.from({ length: itemsPerPage }).map((_, i) => <SkeletonCard key={i} />)
        ) : blogs.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">No posts found.</div>
        ) : (
          blogs.map((post: Blog) => (
            <AdminBlogCard
              key={post.id}
              post={post}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onTogglePublish={handleTogglePublish}
            />
          ))
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex justify-center mt-14">
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
              <div>
                <h2 className="text-2xl font-bold">{editBlogData ? "Edit Blog" : "Create New Blog"}</h2>

                {/* ✅ NEW: author display in modal */}
                <p className="text-sm text-gray-600 mt-1">
                  Author: <span className="font-semibold text-gray-900">{sessionAuthorName}</span>
                </p>
              </div>

              <button onClick={handleCloseModal} className="text-gray-500 font-bold text-xl">
                &times;
              </button>
            </div>

            <Suspense fallback={<div className="h-40 bg-gray-100 rounded-xl animate-pulse" />}>
              <BlogPostForm initialData={editBlogData} onClose={handleCloseModal} onUpdate={handleUpdateBlog} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagementClient;

/** ---------- helpers ---------- */
function mapApiToBlog(item: unknown): Blog {
  const obj = (item ?? {}) as Record<string, any>;

  const rawPostContent = obj.post_content;
  const rawContent =
    typeof rawPostContent === "object" &&
    rawPostContent !== null &&
    "text" in rawPostContent
      ? String((rawPostContent as { text?: unknown }).text ?? "")
      : String(rawPostContent ?? "");

  const title = String(obj.post_title || "");

  const apiImage =
    obj.imageUrl ||
    obj.image_url ||
    obj.thumbnail ||
    obj.thumbnailUrl ||
    obj.thumbnail_url ||
    obj.post_thumbnail ||
    obj.post_image ||
    obj.featured_image ||
    obj.featuredImage ||
    obj.cover_image ||
    obj.banner ||
    obj.image ||
    null;

  const contentImage = extractFirstImage(rawContent);
  const imageUrl = (apiImage as string | null) || contentImage || null;

  const firstLine = getFirstLine(rawContent);
  const excerpt = (obj.excerpt ? String(obj.excerpt) : firstLine).slice(0, 160);

  const wordCount = rawContent.split(/\s+/).filter(Boolean).length;
  const readTime = Number(obj.readTime) || Math.max(1, Math.ceil(wordCount / 200));

  const status = String(obj.post_status ?? "unpublish").toLowerCase().trim();
  const isPublished = status === "publish";

  return {
    id: Number(obj.id),
    post_title: title,
    post_content: rawContent,
    post_category: String(obj.post_category || obj.category || ""),
    post_tags: String(obj.post_tags || obj.tags || ""),
    createdAt: (obj.createdAt ?? obj.post_date ?? null) as string | Date | null,
    imageUrl,
    excerpt,
    readTime,
    _searchTitle: title.toLowerCase().trim(),
    post_status: status,
    isPublished,

    // ✅ NEW
    author: obj.author ?? null,
  };
}