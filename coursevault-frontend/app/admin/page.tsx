"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUsers,
  FiFolder,
  FiFile,
  FiTrash2,
  FiActivity,
  FiTrendingUp,
  FiSearch,
  FiSettings,
} from "react-icons/fi";
import api from "@/app/utils/api";
import { useAuth } from "@/src/context/AuthContext";

interface AdminStats {
  total_users: number;
  total_folders: number;
  total_files: number;
  total_storage: number;
  active_users_today: number;
  new_users_this_week: number;
}

interface User {
  id: number;
  email: string;
  name: string;
  is_premium: boolean;
  email_verified: boolean;
  date_joined: string;
  last_login: string;
  is_staff: boolean;
}

interface Folder {
  id: number;
  title: string;
  owner_name: string;
  files_count: number;
  is_public: boolean;
  created_at: string;
  
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loadingUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "folders" | "files" | "trash">("overview");
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    // Check if user is admin
    if (!loadingUser && user && !user.is_staff) {
      router.push("/dashboard");
      return;
    }

    if (user && user.is_staff) {
      fetchAdminData();
    }
  }, [user, loadingUser, router]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, foldersRes] = await Promise.all([
        api.get("/admin/stats/"),
        api.get("/admin/users/"),
        api.get("/admin/folders/"),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setFolders(foldersRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/admin/users/${userId}/`);
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user");
    }
  };

  const handleTogglePremium = async (userId: number, isPremium: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/`, { is_premium: !isPremium });
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_premium: !isPremium } : u)));
      alert(`Premium ${!isPremium ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.error("Failed to update premium:", error);
      alert("Failed to update premium status");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loadingUser || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.is_staff) {
    return null;
  }

  return (
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, folders, and system settings</p>
        </div>

        {/* Stats Cards */}
        {activeTab === "overview" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.total_users}</p>
                </div>
                <FiUsers className="text-blue-500" size={32} />
              </div>
              <p className="text-sm text-green-600 mt-2">
                +{stats.new_users_this_week} this week
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Folders</p>
                  <p className="text-3xl font-bold mt-1">{stats.total_folders}</p>
                </div>
                <FiFolder className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Files</p>
                  <p className="text-3xl font-bold mt-1">{stats.total_files}</p>
                </div>
                <FiFile className="text-purple-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Storage Used</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatBytes(stats.total_storage)}
                  </p>
                </div>
                <FiActivity className="text-orange-500" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: FiTrendingUp },
            { id: "users", label: "Users", icon: FiUsers },
            { id: "folders", label: "Folders", icon: FiFolder },
            { id: "files", label: "Files", icon: FiFile },
            { id: "trash", label: "Trash", icon: FiTrash2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                px-4 py-3 font-medium transition flex items-center gap-2 whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Users</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Login
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users
                      .filter(
                        (u) =>
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              {user.is_premium && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 w-fit">
                                  Premium
                                </span>
                              )}
                              {user.email_verified ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 w-fit">
                                  Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 w-fit">
                                  Unverified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatDate(user.date_joined)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {user.last_login ? formatDate(user.last_login) : "Never"}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleTogglePremium(user.id, user.is_premium)}
                                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                              >
                                {user.is_premium ? "Remove Premium" : "Make Premium"}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Folders Tab */}
          {activeTab === "folders" && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">All Folders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Folder
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Owner
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Files
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {folders.map((folder) => (
                      <tr key={folder.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">{folder.title}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {folder.owner_name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {folder.files_count}
                        </td>
                        <td className="px-4 py-4">
                          {folder.is_public ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Public
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              Private
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDate(folder.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">System Overview</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Recent Activity</h3>
                  <p className="text-sm text-blue-700">
                    {stats?.active_users_today} active users today
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Growth</h3>
                  <p className="text-sm text-green-700">
                    {stats?.new_users_this_week} new users this week
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Files and Trash tabs - Add later */}
          {(activeTab === "files" || activeTab === "trash") && (
            <div className="p-6 text-center text-gray-500">
              <p>Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}