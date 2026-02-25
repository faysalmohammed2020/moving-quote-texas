"use client";
import React, { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";
import { useSession } from "@/lib/auth-client"; // ✅ NEW

interface BlogPostFormProps {
  initialData?: {
    id?: number;
    post_title: string;
    post_content: string;
    post_category?: string;
    post_tags?: string;

    // ✅ DB field (now String? in your new schema)
    post_author?: string | null;

    // ✅ optional (if API returns author object)
    author?: {
      id: string;
      name: string | null;
      email: string | null;
      image?: string | null;
    } | null;
  } | null;
  onClose: () => void;
  onUpdate: (updatedBlog: unknown) => void;

  // ✅ NEW: display only (passed from parent)
  authorName?: string;
}

interface FormData {
  id?: number;
  title: string;
  content: string;
  category: string;
  tags?: string;

  // ✅ now String id
  authorId: string;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialData,
  onClose,
  onUpdate,
  authorName,
}) => {
  const { data: session } = useSession(); // ✅ NEW
  const sessionUser = (session as any)?.user;

  const [formData, setFormData] = useState<FormData>({
    id: initialData?.id || undefined,
    title: initialData?.post_title || "",
    content: initialData?.post_content || "",
    category: initialData?.post_category || "",
    tags: initialData?.post_tags || "",

    // ✅ NEW: authorId from initial or session
    authorId:
      (initialData?.post_author as string | null) ??
      (sessionUser?.id as string | undefined) ??
      "",
  });

  useEffect(() => {
    // ✅ keep existing behavior: when initialData changes, set formData
    if (initialData) {
      setFormData({
        id: initialData.id || undefined,
        title: initialData.post_title || "",
        content: initialData.post_content || "",
        category: initialData.post_category || "",
        tags: initialData.post_tags || "",

        // ✅ take from DB field if present, else from session
        authorId:
          (initialData.post_author as string | null) ??
          (sessionUser?.id as string | undefined) ??
          "",
      });
      return;
    }

    // ✅ create mode: ensure authorId always set from session if available
    setFormData((prev) => ({
      ...prev,
      authorId: (sessionUser?.id as string | undefined) ?? prev.authorId ?? "",
    }));
  }, [initialData, sessionUser?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // ✅ authorId is not editable now (readOnly), but keep safe handling
    if (name === "authorId") {
      setFormData((prev) => ({
        ...prev,
        authorId: String(value || "").trim(),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formToSubmit: Record<string, unknown> = {
      id: formData.id,
      post_title: formData.title,
      post_content: formData.content,
      category: formData.category,
      tags: formData.tags || "",
    };

    // ✅ NEW: always attach author id (String) if possible
    const authorId =
      String(formData.authorId || "").trim() ||
      String(sessionUser?.id || "").trim();

    if (authorId) {
      formToSubmit.post_author = authorId;
    } else {
      formToSubmit.post_author = null;
    }

    try {
      const response = await fetch("/api/blogpost", {
        method: formData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSubmit),
      });

      const result = await response.json().catch(() => null);

      if (response.ok) {
        alert(formData.id ? "Blog updated successfully!" : "Blog post created!");
        onUpdate(result);
        onClose();
      } else {
        alert((result as any)?.error || "Failed to save blog post. Please try again.");
      }
    } catch (error: unknown) {
      console.error(error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // ✅ display name for UI
  const authorDisplay =
    authorName ||
    initialData?.author?.name ||
    initialData?.author?.email ||
    sessionUser?.name ||
    sessionUser?.email ||
    "Unknown";

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <label htmlFor="title" className="block text-lg font-medium mb-2">
          Blog Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter blog title"
          required
        />
      </div>

      {/* ✅ UPDATED POST AUTHOR (shows name, sends id hidden) */}
      <div>
        <label htmlFor="authorId" className="block text-lg font-medium mb-2">
          Post Author
        </label>

        {/* ✅ visible (name/email) */}
        <input
          type="text"
          value={authorDisplay}
          readOnly
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
          placeholder="Author"
        />

        {/* ✅ hidden id (string) */}
        <input
          type="hidden"
          id="authorId"
          name="authorId"
          value={formData.authorId}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-lg font-medium mb-2">
          Category
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter blog category"
          required
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-lg font-medium mb-2">
          Tags (Optional)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter tags separated by commas"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-lg font-medium mb-2">
          Blog Content
        </label>
        <RichTextEditor
          value={formData.content}
          onChange={(content) =>
            setFormData((prev) => ({
              ...prev,
              content,
            }))
          }
        />
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {formData.id ? "Update Blog" : "Publish Blog"}
        </button>
      </div>
    </form>
  );
};

export default BlogPostForm;