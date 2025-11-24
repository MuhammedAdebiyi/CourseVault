"use client";

import Sidebar from "../components/SideBar";

export default function ProfilePage() {
  const user = { name: "John Doe", email: "you@example.com" };

  return (
    <div className="flex bg-white min-h-screen">
     <Sidebar foldersCount={1} activePage="folders" />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <div className="mb-6">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>

        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
          Edit Profile
        </button>
      </main>
    </div>
  );
}
