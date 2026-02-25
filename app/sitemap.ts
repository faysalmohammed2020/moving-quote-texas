import type { MetadataRoute } from "next";

type Blog = { slug: string; createdAt?: string };
type BlogResponse = {
  data: Blog[];
  meta?: { totalPages?: number };
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

  const staticRoutes = [
    "/",
    "/about-us/testimonial",
    "/blog",
    "/contact",
    "/review",
    "/services/auto-transport",
    "/services/home-changes",
    "/services/long-distance-moving",
    "/services/storage-solutions",
  ];

  const posts = await fetchAllBlogPosts(siteUrl);

  const now = new Date();

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),

    ...posts.map((p) => ({
      url: `${siteUrl}/${encodeURIComponent(p.slug)}`, // ✅ slug route
      lastModified: new Date(p.createdAt || now.toISOString()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

async function fetchAllBlogPosts(siteUrl: string): Promise<Blog[]> {
  const limit = 2000;
  let page = 1;
  const all: Blog[] = [];

  while (true) {
    const res = await fetch(`${siteUrl}/api/blogpost?page=${page}&limit=${limit}`, {
      cache: "no-store",
    });

    if (!res.ok) break;

    const json = (await res.json()) as BlogResponse;

    all.push(...(json?.data ?? []));

    const totalPages = json?.meta?.totalPages ?? 1;
    if (page >= totalPages) break;

    page++;
  }

  return all;
}
