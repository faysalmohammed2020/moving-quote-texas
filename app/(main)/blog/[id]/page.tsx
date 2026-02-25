// app/blog/[id]/page.tsx
import { redirect } from "next/navigation";

export default function LegacyBlogIdPage({
  searchParams,
}: {
  searchParams?: { slug?: string };
}) {
  const slug = (searchParams?.slug || "").trim();
  if (slug) redirect(`/${encodeURIComponent(slug)}`);
  redirect("/blog");
}
