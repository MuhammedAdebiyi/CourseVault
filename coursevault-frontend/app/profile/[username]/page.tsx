"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiFolder, FiUser, FiMail, FiCalendar } from "react-icons/fi";
import Link from "next/link";
import api from "@/app/utils/api";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import PublicFolderCard from "@/app/components/PublicFolderCard";

interface PublicFolder {
  id: number;
  title: string;
  slug: string;
  owner_name: string;
  file_count: number;
  library_count: number;
  is_in_library: boolean;
  updated_at: string;
}

interface UserProfile {
  username: string;
  display_name: string;
  bio: string;
  avatar?: string;
  username_slug: string;
  public_folders_count: number;
  public_folders: PublicFolder[];
  created_at: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/folders/profile/${username}/`);
      setProfile(response.data);
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      setError(error.response?.status === 404 ? "Profile not found" : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (loading) return <LoadingSpinner />;

  if (error || !profile) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto text-center py-16">
          <FiUser className="mx-auto text-gray-300 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Profile Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            This user profile doesn't exist or is private.
          </p>
          <Link
            href="/discover"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Explore Other Creators
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.display_name}
              </h1>
              <p className="text-gray-600 mb-4">@{profile.username}</p>

              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiFolder size={16} />
                  <span>
                    <span className="font-semibold text-blue-600">
                      {profile.public_folders_count}
                    </span>{" "}
                    public folders
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FiCalendar size={16} />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Folders */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Public Folders</h2>
            <span className="text-sm text-gray-600">
              {profile.public_folders.length} folders
            </span>
          </div>

          {profile.public_folders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FiFolder className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Public Folders Yet
              </h3>
              <p className="text-gray-600">
                {profile.display_name} hasn't shared any public folders yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.public_folders.map((folder) => (
                <PublicFolderCard
                  key={folder.id}
                  folder={folder}
                  onAddToLibrary={fetchProfile}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}