"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Me = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  role: "USER" | "ADMIN";
};

export default function ProfileClient() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    image: "",
    currentPassword: "",
    newPassword: "",
  });

  async function loadMe() {
    setLoading(true);
    const res = await fetch("/api/me", { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data?.error ?? "Failed to load profile");
      setLoading(false);
      return;
    }

    setMe(data.user);
    setForm({
      name: data.user?.name ?? "",
      phone: data.user?.phone ?? "",
      image: data.user?.image ?? "",
      currentPassword: "",
      newPassword: "",
    });

    setLoading(false);
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Upload failed");
        return;
      }

      setForm((f) => ({ ...f, image: data.url }));
      toast.success("Image uploaded");
    } finally {
      setUploading(false);
    }
  }

 async function onSave(e: React.FormEvent) {
  e.preventDefault();
  setSaving(true);

  const payload: any = {
    name: form.name || null,
    phone: form.phone || null,
    image: form.image || null,
  };

  if (form.newPassword.trim()) {
    payload.currentPassword = form.currentPassword;
    payload.newPassword = form.newPassword;
  }

  const res = await fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // ✅ Safe parse
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    toast.error(data?.error ?? "Failed to update profile");
    setSaving(false);
    return;
  }

  toast.success("Profile updated successfully");
  setMe(data.user);
  setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
  setSaving(false);
}

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (!me) return <div className="text-sm text-red-600">No profile found.</div>;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Signed in as</div>
          <div className="font-medium">{me.email}</div>
          <div className="text-xs text-gray-500 mt-1">Role: {me.role}</div>
        </div>

        {form.image ? (
          <img
            src={form.image}
            alt="Profile"
            className="h-12 w-12 rounded-full object-cover border"
          />
        ) : (
          <div className="h-12 w-12 rounded-full border bg-gray-50 flex items-center justify-center text-xs text-gray-500">
            N/A
          </div>
        )}
      </div>

      <form onSubmit={onSave} className="space-y-3">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            type="text"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Phone</label>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            type="text"
          />
        </div>

        {/* ✅ Upload profile picture */}
        <div>
          <label className="text-sm font-medium">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1 w-full rounded-xl border px-3 py-2"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              uploadImage(file);
            }}
          />
          <p className="mt-1 text-xs text-gray-500">
            Max 2MB. Allowed: jpg, png, webp, gif, avif.
          </p>

          {form.image && (
            <div className="mt-3">
              <img
                src={form.image}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover border"
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <h3 className="text-sm font-semibold mb-2">Change Password</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Current Password</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, currentPassword: e.target.value }))
                }
                type="password"
                placeholder="Required if setting new password"
              />
            </div>

            <div>
              <label className="text-sm font-medium">New Password</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.newPassword}
                onChange={(e) =>
                  setForm((f) => ({ ...f, newPassword: e.target.value }))
                }
                type="password"
                minLength={8}
                placeholder="Minimum 8 characters"
              />
            </div>
          </div>
        </div>

        <button
          disabled={saving || uploading}
          className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}