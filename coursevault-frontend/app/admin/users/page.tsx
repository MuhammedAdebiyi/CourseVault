"use client";
import Sidebar from "../../components/admin/Sidebar";
import InteractiveTable from "../../components/admin/InteractiveTable";

const usersData = [
  { name: "John Doe", email: "john@example.com", status: "Active" },
  { name: "Sarah Cole", email: "sarah@example.com", status: "Pending" },
  { name: "David Lee", email: "david@example.com", status: "Inactive" },
  { name: "Mariam Umar", email: "mariam@example.com", status: "Active" },
  { name: "King Danny", email: "danny@example.com", status: "Active" },
];

const columns = [
  { label: "Name", key: "name" },
  { label: "Email", key: "email" },
  { label: "Status", key: "status" },
];

export default function UsersPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <InteractiveTable
          title="Users"
          columns={columns}
          data={usersData}
        />
      </main>
    </div>
  );
}
