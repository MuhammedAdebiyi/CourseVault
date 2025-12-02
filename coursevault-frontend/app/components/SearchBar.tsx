"use client";

import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX, FiFile, FiTag, FiCalendar, FiFileText } from "react-icons/fi";
import api from "@/app/utils/api";
import Link from "next/link";

interface SearchResult {
  id: number;
  title: string;
  folder: number;
  tags: string[];
  uploaded_at: string;
  file_size: number;
}

interface ContentSearchResult {
  pdf_id: number;
  title: string;
  folder_id: number;
  matches: Array<{
    context: string;
    position: number;
  }>;
  match_count: number;
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fileResults, setFileResults] = useState<SearchResult[]>([]);
  const [contentResults, setContentResults] = useState<ContentSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<"files" | "content">("files");
  const [totalCount, setTotalCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const commonTags = ["lecture", "assignment", "exam", "notes", "important", "reference"];

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2 || selectedTags.length > 0) {
        performSearch();
      } else {
        setFileResults([]);
        setContentResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedTags, searchType]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const performSearch = async () => {
    setLoading(true);
    try {
      if (searchType === "content" && query.length >= 3) {
        // Search inside PDF content
        const response = await api.get(`/folders/search-pdf-content/?q=${query}`);
        setContentResults(response.data.results || []);
        setTotalCount(response.data.count || 0);
        setFileResults([]);
      } else {
        // Search by filename and tags
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));

        const response = await api.get(`/folders/search-files/?${params.toString()}`);
        setFileResults(response.data.results || []);
        setTotalCount(response.data.count || 0);
        setContentResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setFileResults([]);
      setContentResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSelectedTags([]);
    setFileResults([]);
    setContentResults([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder={searchType === "content" ? "Search inside PDFs..." : "Search files, tags..."}
          className="w-full md:w-96 px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full md:w-[600px] bg-white border border-gray-200 rounded-lg shadow-xl max-h-[500px] overflow-hidden z-50">
          
          {/* Search Type Toggle */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={() => setSearchType("files")}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition flex items-center justify-center gap-2 ${
                  searchType === "files"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiFile size={16} />
                Search Files
              </button>
              <button
                onClick={() => setSearchType("content")}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition flex items-center justify-center gap-2 ${
                  searchType === "content"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiFileText size={16} />
                Search Content
              </button>
            </div>
          </div>

          {/* Quick Tag Filters (only for file search) */}
          {searchType === "files" && (
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                <FiTag size={14} />
                Quick Filters
              </p>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-xs rounded-full transition ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="overflow-y-auto max-h-[350px]">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            ) : searchType === "content" ? (
              // Content search results
              contentResults.length > 0 ? (
                <>
                  <div className="p-2 bg-gray-50 border-b">
                    <p className="text-xs text-gray-600">
                      {totalCount} {totalCount === 1 ? 'match' : 'matches'} found
                    </p>
                  </div>
                  {contentResults.map(result => (
                    <Link
                      key={result.pdf_id}
                      href={`/folders/${result.folder_id}?file=${result.pdf_id}`}
                      onClick={() => setIsOpen(false)}
                      className="block p-4 hover:bg-gray-50 border-b border-gray-100 transition"
                    >
                      <div className="flex items-start gap-3">
                        <FiFileText className="text-blue-500 mt-1" size={20} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 mb-1">{result.title}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            {result.match_count} {result.match_count === 1 ? 'match' : 'matches'} found
                          </p>
                          {result.matches.slice(0, 2).map((match, idx) => (
                            <div key={idx} className="text-xs text-gray-600 bg-yellow-50 p-2 rounded mb-1">
                              ...{match.context}...
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              ) : query.length >= 3 ? (
                <div className="p-8 text-center">
                  <FiFileText className="mx-auto text-gray-300 mb-2" size={40} />
                  <p className="text-gray-500">No matches found</p>
                  <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FiFileText className="mx-auto text-gray-300 mb-2" size={40} />
                  <p className="text-gray-500">Type at least 3 characters</p>
                  <p className="text-sm text-gray-400 mt-1">Search inside PDF content</p>
                </div>
              )
            ) : (
              // File search results
              fileResults.length > 0 ? (
                <>
                  <div className="p-2 bg-gray-50 border-b">
                    <p className="text-xs text-gray-600">
                      {totalCount} {totalCount === 1 ? 'result' : 'results'} found
                    </p>
                  </div>
                  {fileResults.map(file => (
                    <Link
                      key={file.id}
                      href={`/folders/${file.folder}?file=${file.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block p-4 hover:bg-gray-50 border-b border-gray-100 transition"
                    >
                      <div className="flex items-start gap-3">
                        <FiFile className="text-blue-500 mt-1" size={20} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <FiCalendar size={12} />
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </span>
                            {file.file_size > 0 && (
                              <span className="text-xs text-gray-500">
                                {formatFileSize(file.file_size)}
                              </span>
                            )}
                          </div>
                          {file.tags && file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {file.tags.map((tag, idx) => (
                                <span
                                  key={`${tag}-${idx}`}
                                  className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              ) : query.length >= 2 || selectedTags.length > 0 ? (
                <div className="p-8 text-center">
                  <FiSearch className="mx-auto text-gray-300 mb-2" size={40} />
                  <p className="text-gray-500">No files found</p>
                  <p className="text-sm text-gray-400 mt-1">Try different keywords or tags</p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FiSearch className="mx-auto text-gray-300 mb-2" size={40} />
                  <p className="text-gray-500">Start typing to search...</p>
                  <p className="text-sm text-gray-400 mt-1">Search by filename, tags, or date</p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}