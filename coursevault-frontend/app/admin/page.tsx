"use client";
import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/NavBar";
import DashboardCard from "../components/admin/DashboardCard";

export default function AdminDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 bg-[var(--background)]">
          <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Dashboard Overview</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="Total Users" value={0} />
            <DashboardCard title="Total Uploads" value={0} />
            <DashboardCard title="Active Subscriptions" value={0} />
            <DashboardCard title="Revenue" value="$0" />
          </div>
        </main>
      </div>
    </div>
  );
}
