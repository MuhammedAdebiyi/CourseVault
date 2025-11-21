"use client";
import Sidebar from "../../components/admin/Sidebar";
import InteractiveTable from "../../components/admin/InteractiveTable";

const foldersData = [
  { name: "JAMB Past Questions", items: 42, updated: "2025-01-02" },
  { name: "Engineering Docs", items: 19, updated: "2025-02-01" },
  { name: "Medical Notes", items: 33, updated: "2025-02-11" },
  { name: "Private Folder", items: 5, updated: "2025-01-29" },
];

const columns = [
  { label: "Folder Name", key: "name" },
  { label: "Items", key: "items" },
  { label: "Last Updated", key: "updated" },
];

export default function FoldersPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <InteractiveTable
          title="Folders"
          columns={columns}
          data={foldersData}
        />
      </main>
    </div>
  );
}
