import ProfileClient from "./profile-client";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-sm text-gray-500">
          Update your personal information.
        </p>
      </div>

      <ProfileClient />
    </div>
  );
}