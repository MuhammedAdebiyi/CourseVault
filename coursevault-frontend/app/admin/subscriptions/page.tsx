"use client";
import Sidebar from "../../components/admin/Sidebar";
import InteractiveTable from "../../components/admin/InteractiveTable";

const subsData = [
  { user: "John Doe", plan: "Monthly", status: "Active" },
  { user: "Sarah Cole", plan: "Monthly", status: "Expired" },
  { user: "David Lee", plan: "Monthly", status: "Active" },
  { user: "Tosin Ayo", plan: "Yearly", status: "Pending" },
];

const columns = [
  { label: "User", key: "user" },
  { label: "Plan", key: "plan" },
  { label: "Status", key: "status" },
];

export default function SubscriptionsPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <InteractiveTable
          title="Subscriptions"
          columns={columns}
          data={subsData}
        />
      </main>
    </div>
  );
}
