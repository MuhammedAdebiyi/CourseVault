"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import Sidebar from "@/app/components/SideBar";
import api from "@/app/utils/api";
import { FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX } from "react-icons/fi";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.patch("/auth/me/", { name });
      await refreshUser();
      setSuccess("Profile updated successfully!");
      setEditing(false);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEditing(false);
    setError("");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar foldersCount={0} activePage="profile" />
      
      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Avatar Section */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
              <div className="flex items-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="ml-6 text-white">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-blue-100 mt-1">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6 space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2" />
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">{user.name}</p>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-2" />
                  Email Address
                </label>
                <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  {user.email}
                  {user.email_verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
                  )}
                </p>
              </div>

              {/* Subscription Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-2" />
                  Subscription Status
                </label>
                <p className={`text-lg px-4 py-3 rounded-lg ${
                  user.is_premium 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {user.is_premium ? "✓ Active Premium" : "✗ Free Account"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      <FiSave />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                    >
                      <FiX />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <FiEdit2 />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                Change Password
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                Manage Subscription
              </button>
              <button className="w-full text-left px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}