// app/admin/dashboard/blog-management/page.tsx
import BlogManagementClient from "@/components/BlogManagementClient";

export const dynamic = "force-dynamic"; // admin always fresh

async function getBlogs(page: number, limit: number, q: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  if (q) qs.set("q", q);

  const res = await fetch(`${base}/api/blogpost?${qs.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      data: [],
      meta: { page, limit, total: 0, totalPages: 1 },
    };
  }

  return res.json();
}

export default async function BlogManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ITEMS_PER_PAGE = 9;

  // ✅ Next 15+ : searchParams must be awaited
  const sp = await searchParams;

  const page = Number(sp?.page ?? 1) || 1;
  const q = typeof sp?.q === "string" ? sp.q : "";

  const json = await getBlogs(page, ITEMS_PER_PAGE, q);

  return (
    <BlogManagementClient
      initialBlogs={json?.data || json?.items || []}
      initialMeta={
        json?.meta || {
          page,
          limit: ITEMS_PER_PAGE,
          total: (json?.data || []).length,
          totalPages: 1,
        }
      }
      itemsPerPage={ITEMS_PER_PAGE}
      initialSearch={q}   // ✅ (optional) client-এ initial search দেখানোর জন্য
    />
  );
}
