"use client";
import Sidebar from "../../components/admin/Sidebar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const dummyData = [
  { date: "2025-11-01", uploads: 5, users: 3 },
  { date: "2025-11-02", uploads: 8, users: 6 },
  { date: "2025-11-03", uploads: 3, users: 4 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-[var(--background)] min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Analytics</h1>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="uploads" stroke="#8884d8" />
              <Line type="monotone" dataKey="users" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}
