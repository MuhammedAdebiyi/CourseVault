"use client";
import Sidebar from "../../components/admin/Sidebar";
import InteractiveTable from "../../components/admin/InteractiveTable";

const filesData = [
  { name: "BIO101.pdf", size: "4MB", uploaded: "2025-01-03" },
  { name: "MTH201.pdf", size: "3.2MB", uploaded: "2025-01-13" },
  { name: "GST103.pdf", size: "2MB", uploaded: "2025-01-18" },
  { name: "CSC110.pdf", size: "1.5MB", uploaded: "2025-01-21" },
];

const columns = [
  { label: "File Name", key: "name" },
  { label: "Size", key: "size" },
  { label: "Uploaded", key: "uploaded" },
];

export default function FilesPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6">
        <InteractiveTable
          title="Files"
          columns={columns}
          data={filesData}
        />
      </main>
    </div>
  );
}
