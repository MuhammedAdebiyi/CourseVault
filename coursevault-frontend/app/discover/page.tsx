"use client";

import React, { useEffect, useState } from "react";
import { FiTrendingUp, FiCompass, FiUsers } from "react-icons/fi";
import api from "@/app/utils/api";
import PublicFolderCard from "../components/PublicFolderCard";

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

interface Profile {
  username: string;
  display_name: string;
  username_slug: string;
  public_folders_count: number;
  avatar?: string;
}

export default function DiscoverPage() {
  const [trendingFolders, setTrendingFolders] = useState<PublicFolder[]>([]);
  const [allFolders, setAllFolders] = useState<PublicFolder[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<"trending" | "all" | "creators">("trending");
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [trendingRes, allRes, profilesRes] = await Promise.all([
        api.get("/folders/discover/trending/"),
        api.get("/folders/discover/folders/"),
        api.get("/folders/discover/profiles/"),
      ]);

      setTrendingFolders(trendingRes.data);
      setAllFolders(allRes.data);
      setProfiles(profilesRes.data);
    } catch (error) {
      console.error("Failed to load discover content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Discover
        </h1>
        <p className="text-gray-600 text-lg">
          Explore and add public folders from the community
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("trending")}
          className={`
            px-6 py-3 font-medium transition relative
            ${
              activeTab === "trending"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <FiTrendingUp size={18} />
            Trending
          </div>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`
            px-6 py-3 font-medium transition relative
            ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <FiCompass size={18} />
            All Folders
          </div>
        </button>

        <button
          onClick={() => setActiveTab("creators")}
          className={`
            px-6 py-3 font-medium transition relative
            ${
              activeTab === "creators"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          <div className="flex items-center gap-2">
            <FiUsers size={18} />
            Creators
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === "trending" && (
        <div>
          {trendingFolders.length === 0 ? (
            <div className="text-center py-16">
              <FiTrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No trending folders yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingFolders.map((folder) => (
                <PublicFolderCard
                  key={folder.id}
                  folder={folder}
                  onAddToLibrary={fetchContent}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "all" && (
        <div>
          {allFolders.length === 0 ? (
            <div className="text-center py-16">
              <FiCompass size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No public folders available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFolders.map((folder) => (
                <PublicFolderCard
                  key={folder.id}
                  folder={folder}
                  onAddToLibrary={fetchContent}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "creators" && (
        <div>
          {profiles.length === 0 ? (
            <div className="text-center py-16">
              <FiUsers size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No creators found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <a
                  key={profile.username_slug}
                  href={`/profile/${profile.username_slug}`}
                  className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all p-6"
                >
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">
                    {profile.display_name}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    @{profile.username}
                  </p>

                  {/* Stats */}
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      <span className="font-semibold text-blue-600">
                        {profile.public_folders_count}
                      </span>{" "}
                      public folders
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}