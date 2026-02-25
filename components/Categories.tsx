"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { placeData } from "@/app/data/placeData";

type BlogPost = {
  id: number;
  post_title: string;
  post_category?: string;
  category?: string | { id?: number; name?: string };
  post_status?: string;
  createdAt?: string;
};

const normalize = (v: unknown) =>
  String(v ?? "")
    .toLowerCase()
    .trim();

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

// ✅ category name extractor (all possible API shapes)
const getPostCategoryName = (post: BlogPost) => {
  if (typeof post.post_category === "string" && post.post_category.trim()) {
    return post.post_category;
  }
  if (typeof post.category === "string" && post.category.trim()) {
    return post.category;
  }
  if (post.category && typeof post.category === "object") {
    return post.category.name ?? "";
  }
  return "";
};

const getPostCategoryId = (post: BlogPost) => {
  if (post.category && typeof post.category === "object") {
    return post.category.id;
  }
  return undefined;
};

// ✅ ONLY publish checker
const isPublished = (status: unknown) =>
  String(status ?? "")
    .toLowerCase()
    .trim() === "publish";

// ✅ AbortError guard (no any)
const isAbortError = (err: unknown) => {
  if (err instanceof DOMException) return err.name === "AbortError";
  if (typeof err === "object" && err !== null && "name" in err) {
    const name = (err as { name?: unknown }).name;
    return name === "AbortError";
  }
  return false;
};

const Categories = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/blogpost?limit=500&page=1", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load posts");

        const json = await res.json();

        const list: BlogPost[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : [];

        // ✅ FILTER: only published posts will be stored in state
        const publishedOnly = list.filter((p) => isPublished(p.post_status));

        setPosts(publishedOnly);
      } catch (e: unknown) {
        if (!isAbortError(e)) console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    return () => controller.abort();
  }, []);

  // ✅ group posts by normalized category for fast matching
  const grouped = useMemo(() => {
    const map: Record<string, BlogPost[]> = {};
    for (const p of posts) {
      const catName = normalize(getPostCategoryName(p));
      if (!catName) continue;
      if (!map[catName]) map[catName] = [];
      map[catName].push(p);
    }
    return map;
  }, [posts]);

  return (
    <div className="container mx-auto mt-12 px-6 md:px-14 lg:px-28">
      <h2 className="text-4xl font-bold text-center text-blue-900 mb-8">
        State Categories
      </h2>

      {loading ? (
        <div className="text-center text-gray-500 py-10">
          Loading categories...
        </div>
      ) : (
        <Accordion
          type="single"
          collapsible
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          {placeData.map((item) => {
            const placeNameNorm = normalize(item.name);

            // ✅ exact match first
            let postsInCategory = grouped[placeNameNorm] || [];

            // ✅ fallback fuzzy match (if exact empty)
            if (postsInCategory.length === 0) {
              const fuzzyKey = Object.keys(grouped).find(
                (k) => k.includes(placeNameNorm) || placeNameNorm.includes(k)
              );
              if (fuzzyKey) postsInCategory = grouped[fuzzyKey] || [];
            }

            // ✅ fallback by id
            if (postsInCategory.length === 0) {
              postsInCategory = posts.filter(
                (p) => getPostCategoryId(p) === item.id
              );
            }

            return (
              <AccordionItem
                key={item.id}
                value={`item-${item.id}`}
                className="border-b border-gray-300 pb-2"
              >
                <AccordionTrigger className="flex justify-between items-center text-blue-900 text-lg font-semibold">
                  {item.name}
                </AccordionTrigger>

                <AccordionContent className="text-md text-gray-700 mt-2">
                  <ul className="list-none space-y-2">
                    {postsInCategory.map((post) => {
                      const s = slugify(post.post_title || "");
                      return (
                        <li
                          key={post.id}
                          className="text-slate-800 hover:text-blue-600 hover:font-bold hover:underline"
                        >
                          <Link href={`/${encodeURIComponent(s)}`}>
                            {post.post_title}
                          </Link>
                        </li>
                      );
                    })}

                    {postsInCategory.length === 0 && (
                      <li className="text-gray-500">
                        No posts available for this category.
                      </li>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default Categories;
