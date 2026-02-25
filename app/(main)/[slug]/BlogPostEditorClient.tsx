"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import BlogPostForm from "@/components/BlogPostForm";

export default function BlogPostEditorClient({
  mode,
  post,
}: {
  mode: "title" | "content";
  post: any;
  slug: string;
  canonical: string;
}) {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editBlogData, setEditBlogData] = useState<any>(null);

  const openEdit = () => {
    if (!isAuthed) return signIn();
    if (!post?.id) return;

    setEditBlogData({
      id: post.id,
      post_title: post.post_title || "",
      post_content:
        typeof post.post_content === "object" && post.post_content?.text
          ? post.post_content.text
          : String(post.post_content ?? ""),
      category: post.category ?? "",
      tags: post.tags ?? "",
      post_status: post.post_status ?? "draft",
    });
    setIsFormVisible(true);
  };

  const handleCloseModal = () => {
    setIsFormVisible(false);
    setEditBlogData(null);
  };

  const handleUpdateBlog = async (payload: any) => {
    try {
      const res = await fetch("/api/blogpost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update");
      }

      // simplest: reload after update (keeps perfect SSR/SEO)
      window.location.reload();
    } catch (e: any) {
      alert(e?.message || "Update failed");
    }
  };

  // button position: same as তোমার পুরানো UI
  const btnClass =
    mode === "title"
      ? "absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition rounded-full bg-cyan-600 text-white p-2 shadow-lg hover:bg-cyan-700"
      : "absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition rounded-full bg-cyan-600 text-white p-2 shadow-lg hover:bg-cyan-700 z-10";

  return (
    <>
      {isAuthed && (
        <button type="button" onClick={openEdit} title="Edit" className={btnClass}>
          ✎
        </button>
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
              <h2 className="text-2xl font-bold">Edit Blog</h2>
              <button onClick={handleCloseModal} className="text-gray-500 font-bold text-xl">
                &times;
              </button>
            </div>

            <BlogPostForm
              initialData={editBlogData}
              onClose={handleCloseModal}
              onUpdate={handleUpdateBlog}
            />
          </div>
        </div>
      )}
    </>
  );
}
