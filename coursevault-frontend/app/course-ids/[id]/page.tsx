"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "../../components/SideBar";
import { FileEarmarkText, Upload } from "react-bootstrap-icons";

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.id;

  // Example state for the course
  const [course, setCourse] = useState({
    id: courseId,
    name: "CSC 101 - 100LV",
    public: false,
    pdfs: [
      { id: 1, name: "Lecture 1.pdf" },
      { id: 2, name: "Lecture 2.pdf" },
    ],
  });

  const [newPdfName, setNewPdfName] = useState("");

  const handleUpload = () => {
    if (!newPdfName) return;
    const newPdf = { id: Date.now(), name: newPdfName };
    setCourse({ ...course, pdfs: [...course.pdfs, newPdf] });
    setNewPdfName("");
  };

  const togglePublic = () => {
    setCourse({ ...course, public: !course.public });
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <button
            className="px-4 py-2 bg-black text-white rounded"
            onClick={togglePublic}
          >
            {course.public ? "Make Private" : "Make Public"}
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Upload New PDF</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="PDF Name"
              value={newPdfName}
              onChange={(e) => setNewPdfName(e.target.value)}
              className="border border-black rounded px-3 py-2 flex-1"
            />
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-black text-white rounded flex items-center gap-1"
            >
              <Upload /> Upload
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">PDFs</h2>
          {course.pdfs.length === 0 ? (
            <p>No PDFs uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {course.pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="border border-black rounded p-4 flex items-center gap-2 hover:shadow-md cursor-pointer"
                >
                  <FileEarmarkText size={24} />
                  <span>{pdf.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
