"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";

interface Column {
  label: string;
  key: string;
}

interface Row {
  [key: string]: string | number;
}

interface InteractiveTableProps {
  title: string;
  columns: Column[];
  data: Row[];
}

export default function InteractiveTable({ title, columns, data }: InteractiveTableProps) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" | null }>({
    key: null,
    direction: null,
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  const filtered = useMemo(() => {
    return data.filter(
      (row) =>
        columns.some((col) =>
          String(row[col.key]).toLowerCase().includes(search.toLowerCase())
        )
    );
  }, [search, data, columns]);

  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;
    const key = sortConfig.key;
    return [...filtered].sort((a, b) => {
      if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortConfig]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page]);

  const toggleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const totalPages = Math.ceil(sorted.length / rowsPerPage);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      {/* Search */}
      <input
        type="text"
        placeholder={`Search ${title.toLowerCase()}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded-xl mb-6"
      />

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-2xl">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 cursor-pointer"
                  onClick={() => toggleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label} <ArrowUpDown size={14} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-3">
                    {row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-4 gap-3">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          className="px-4 py-2 bg-gray-200 rounded-xl"
        >
          Prev
        </button>
        <span className="text-lg">{page} / {totalPages}</span>
        <button
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          className="px-4 py-2 bg-gray-200 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
}
