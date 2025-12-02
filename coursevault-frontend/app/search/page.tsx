"use client";

import SearchBar from "@/app/components/SearchBar";
import { FiSearch, FiFileText, FiTag, FiZap } from "react-icons/fi";

export default function SearchPage() {
  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Your Files</h1>
          <p className="text-gray-600">Find files by name, tags, or search inside PDF content</p>
        </div>
        
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Search Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* File Search Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiFileText className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">File Search</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Search files by name, tags, and upload date
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Quick tag filters</li>
                  <li>• Filter by date range</li>
                  <li>• View file metadata</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Content Search Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiSearch className="text-green-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Content Search</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Search inside PDF documents for specific text
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Full-text search</li>
                  <li>• Context preview</li>
                  <li>• Match highlighting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Search Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <FiZap className="text-purple-600 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Tips</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="font-medium mb-1">File Search:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Type at least 2 characters</li>
                    <li>• Use tags to filter quickly</li>
                    <li>• Combine text + tags for better results</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">Content Search:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Type at least 3 characters</li>
                    <li>• Search for specific phrases</li>
                    <li>• View context around matches</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}