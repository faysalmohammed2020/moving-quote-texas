import { requireAdmin } from "@/lib/guards";
import UsersClient from "./users-client";

export default async function AdminUsersPage() {
  await requireAdmin();
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-gray-500">Create users and manage roles.</p>
      </div>
      <UsersClient />
    </div>
  );
}