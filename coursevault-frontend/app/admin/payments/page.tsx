"use client";
import { useState, useMemo } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { ArrowUpDown } from "lucide-react";

interface Payment {
  id: number;
  user: string;
  plan: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  date: string;
}

const rawPayments: Payment[] = [
  { id: 1, user: "John Doe", plan: "Monthly", amount: 500, status: "Paid", date: "2025-11-01 10:30" },
  { id: 2, user: "Sarah Cole", plan: "Monthly", amount: 500, status: "Pending", date: "2025-11-02 14:12" },
  { id: 3, user: "Mariam Umar", plan: "Monthly", amount: 500, status: "Failed", date: "2025-11-03 09:55" },
  { id: 4, user: "David Lee", plan: "Monthly", amount: 500, status: "Paid", date: "2025-11-05 17:20" },
  { id: 5, user: "King Danny", plan: "Monthly", amount: 500, status: "Paid", date: "2025-11-06 08:45" },
];

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Payment | null; direction: "asc" | "desc" | null }>({ key: null, direction: null });
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const filtered = useMemo(() => {
    return rawPayments.filter((p) =>
      p.user.toLowerCase().includes(search.toLowerCase()) ||
      p.plan.toLowerCase().includes(search.toLowerCase()) ||
      p.status.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered;

    const key = sortConfig.key; // TypeScript knows key is not null
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

  const toggleSort = (key: keyof Payment) => {
    setSortConfig((prev) => {
      if (prev.key === key) return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      return { key, direction: "asc" };
    });
  };

  const totalPages = Math.ceil(sorted.length / rowsPerPage);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Payments & Subscriptions</h1>

        <input
          type="text"
          placeholder="Search payments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 p-2 w-full border rounded-lg"
        />

        <div className="overflow-x-auto bg-white shadow rounded-2xl">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {["user", "plan", "amount", "status", "date"].map((col) => (
                  <th key={col} className="p-3 cursor-pointer" onClick={() => toggleSort(col as keyof Payment)}>
                    <div className="flex items-center gap-2">{col.charAt(0).toUpperCase() + col.slice(1)} <ArrowUpDown size={14} /></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.user}</td>
                  <td className="p-3">{p.plan}</td>
                  <td className="p-3">₦{p.amount}</td>
                  <td className={`p-3 font-semibold ${p.status === "Paid" ? "text-green-600" : p.status === "Pending" ? "text-yellow-600" : "text-red-600"}`}>
                    {p.status}
                  </td>
                  <td className="p-3">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center mt-4 gap-3">
          <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="px-4 py-2 bg-gray-200 rounded-xl">Prev</button>
          <span className="text-lg">{page} / {totalPages}</span>
          <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="px-4 py-2 bg-gray-200 rounded-xl">Next</button>
        </div>
      </main>
    </div>
  );
}
