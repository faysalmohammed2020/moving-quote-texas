// app/blog/page.tsx
import type { Metadata } from "next";
import BlogPageClient from "@/components/BlogPageClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Moving Tips & Guides | Moving Quote Texas Blog",
  description:
    "Read moving tips, checklists, and guides from Moving Quote Texas. Learn about packing, apartment moves, long-distance planning, storage, and cost-saving advice.",
  alternates: { canonical: "https://movingquotetexas.com/blog" },
  openGraph: {
    title: "Moving Tips & Guides | Moving Quote Texas Blog",
    description:
      "Moving tips, checklists, and guides—packing, apartment moves, long-distance planning, and more.",
    url: "https://movingquotetexas.com/blog",
    siteName: "Moving Quote Texas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moving Tips & Guides | Moving Quote Texas Blog",
    description:
      "Moving tips, checklists, and guides—packing, apartment moves, long-distance planning, and more.",
  },
};

export default async function BlogPage() {
  const postsPerPage = 6;

  const base = (process.env.NEXT_PUBLIC_BASE_URL || "https://movingquotetexas.com").replace(
    /\/$/,
    ""
  );

  // Always load page 1 on server
  const res = await fetch(`${base}/api/blogpost?page=1&limit=${postsPerPage}`, {
    cache: "no-store",
  });

  const json = await res.json();

  return (
    <main className="bg-gray-50">
      <BlogPageClient
        initialBlogs={json?.data || []}
        initialMeta={json?.meta || { page: 1, limit: postsPerPage, total: 0, totalPages: 1 }}
        postsPerPage={postsPerPage}
      />
    </main>
  );
}
