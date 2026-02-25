"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
};

type ModalMode = "create" | "edit";
type RoleFilter = "ALL" | "USER" | "ADMIN";

export default function UsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL"); // ✅ new

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>("create");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    role: "USER" as "USER" | "ADMIN",
    password: "",
  });

  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return users.filter((u) => {
      // ✅ role filter
      const roleOk = roleFilter === "ALL" ? true : u.role === roleFilter;

      // ✅ text filter
      const textOk =
        !s ||
        u.email.toLowerCase().includes(s) ||
        (u.name ?? "").toLowerCase().includes(s) ||
        (u.phone ?? "").toLowerCase().includes(s);

      return roleOk && textOk;
    });
  }, [users, q, roleFilter]);

  function resetForm() {
    setForm({ email: "", name: "", phone: "", role: "USER", password: "" });
    setActiveId(null);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
    resetForm();
    setMode("create");
  }

  function openCreate() {
    setMode("create");
    resetForm();
    setOpen(true);
  }

  function openEdit(u: UserRow) {
    setMode("edit");
    setActiveId(u.id);
    setForm({
      email: u.email,
      name: u.name ?? "",
      phone: u.phone ?? "",
      role: u.role,
      password: "",
    });
    setOpen(true);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        name: form.name || undefined,
        phone: form.phone || undefined,
        role: form.role,
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data?.error ?? "Failed to create user");
      setSaving(false);
      return;
    }

    await load();
    setSaving(false);
    closeModal();
    toast.success("User created successfully");
  }

  async function updateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId) return;

    setSaving(true);

    const payload: any = {
      email: form.email,
      name: form.name || null,
      phone: form.phone || null,
      role: form.role,
    };
    if (form.password.trim()) payload.password = form.password;

    const res = await fetch(`/api/admin/users/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data?.error ?? "Failed to update user");
      setSaving(false);
      return;
    }

    await load();
    setSaving(false);
    closeModal();
    toast.success("User updated successfully");
  }

  async function deleteUser(u: UserRow) {
    const ok = confirm(
      `Delete user?\n\n${u.email}\n\nThis action cannot be undone.`
    );
    if (!ok) return;

    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data?.error ?? "Failed to delete user");
      return;
    }

    await load();
    toast.success("User deleted successfully");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Users</h2>
            <p className="text-sm text-gray-500">Total: {users.length}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* ✅ Role filter */}
            <select
              className="w-full sm:w-44 rounded-xl border px-3 py-2"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            >
              <option value="ALL">All Roles</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            {/* ✅ Search */}
            <input
              className="w-full sm:w-64 rounded-xl border px-3 py-2"
              placeholder="Search email/name/phone..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <button
              onClick={openCreate}
              className="rounded-xl bg-black px-4 py-2 text-white"
            >
              Add User
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-auto rounded-xl border">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Role</th>
                  <th className="px-3 py-2 text-left">Created</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-3 py-2">{u.name ?? "-"}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">{u.phone ?? "-"}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full border px-2 py-1">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="rounded-xl border px-3 py-1.5 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUser(u)}
                          className="rounded-xl border px-3 py-1.5 text-sm text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-gray-500"
                      colSpan={6}
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative w-full max-w-lg rounded-2xl border bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {mode === "create" ? "Create User" : "Edit User"}
                </h2>
                <p className="text-sm text-gray-500">
                  {mode === "create"
                    ? "Add a new user with role."
                    : "Update user details and role."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl border px-3 py-1.5 text-sm"
                disabled={saving}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={mode === "create" ? createUser : updateUser}
              className="space-y-3 mt-4"
            >
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  type="email"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  type="text"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  type="text"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value as any }))
                  }
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Password{" "}
                  {mode === "edit" && (
                    <span className="text-xs font-normal text-gray-500">
                      (leave blank to keep unchanged)
                    </span>
                  )}
                </label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  type="password"
                  minLength={mode === "create" ? 8 : undefined}
                  required={mode === "create"}
                />
                {mode === "create" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 8 characters.
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-xl border px-4 py-2"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : mode === "create"
                    ? "Create User"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}