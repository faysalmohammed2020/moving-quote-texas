import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    (process.env.NEXT_PUBLIC_BASE_URL || "https://movingquotetexas.com").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/_next/static/", "/_next/image/"],
        disallow: [
          "/admin/",
          "/dashboard/",
          "/auth/",
          "/login/",
          "/register/",
          "/api/",
          "/private/",
        ],
      },
    ],
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: siteUrl,
  };
}
