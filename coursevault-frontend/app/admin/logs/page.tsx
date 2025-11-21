"use client";
import { useState, useMemo } from "react";
import Sidebar from "../../components/admin/Sidebar";
import { ArrowUpDown } from "lucide-react";

// Dummy Activity Logs
const activityLogs = [
  { id: 1, user: "John Doe", action: "Uploaded file BIO101.pdf", date: "2025-11-01 10:30" },
  { id: 2, user: "Sarah Cole", action: "Created folder 'Math Notes'", date: "2025-11-02 12:15" },
  { id: 3, user: "Mariam Umar", action: "Deleted file GST103.pdf", date: "2025-11-03 09:50" },
  { id: 4, user: "David Lee", action: "Updated profile info", date: "2025-11-04 14:20" },
  { id: 5, user: "King Danny", action: "Subscribed to Monthly Plan", date: "2025-11-05 08:45" },
];

// Dummy Payments Logs
const paymentsLogs = [
  { id: 1, user: "John Doe", plan: "Monthly", amount: 500, status: "Paid", date: "2025-11-01 10:30" },
  { id: 2, user: "Sarah Cole", plan: "Monthly", amount: 500, status: "Pending", date: "2025-11-02 14:12" },
  { id: 3, user: "Mariam Umar", plan: "Monthly", amount: 500, status: "Failed", date: "2025-11-03 09:55" },
  { id: 4, user: "David Lee", plan: "Monthly", amount: 500, status: "Paid", date: "2025-11-05 17:20" },
];

export default function LogsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"activity" | "payments">("activity");

  const filteredActivity = useMemo(() => {
    return activityLogs.filter(
      (log) =>
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredPayments = useMemo(() => {
    return paymentsLogs.filter(
      (log) =>
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.plan.toLowerCase().includes(search.toLowerCase()) ||
        log.status.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Admin Logs Dashboard</h1>

        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded-lg ${tab === "activity" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setTab("activity")}
          >
            Activity Logs
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${tab === "payments" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setTab("payments")}
          >
            Payments Logs
          </button>
        </div>

        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 p-2 w-full border rounded-lg"
        />

        <div className="overflow-x-auto bg-white shadow rounded-2xl">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {tab === "activity" ? (
                  <>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Date</th>
                  </>
                ) : (
                  <>
                    <th className="p-3">User</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {tab === "activity"
                ? filteredActivity.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{log.user}</td>
                      <td className="p-3">{log.action}</td>
                      <td className="p-3">{log.date}</td>
                    </tr>
                  ))
                : filteredPayments.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{log.user}</td>
                      <td className="p-3">{log.plan}</td>
                      <td className="p-3">₦{log.amount}</td>
                      <td className={`p-3 font-semibold ${log.status === "Paid" ? "text-green-600" : log.status === "Pending" ? "text-yellow-600" : "text-red-600"}`}>
                        {log.status}
                      </td>
                      <td className="p-3">{log.date}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
