"use client";

import { useState } from "react";
import Sidebar from "../../components/SideBar";

export default function CreateCoursePage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [level, setLevel] = useState("100L");
  const [isPublic, setIsPublic] = useState(true);

  const handleCreateCourse = () => {
    // Replace with API call later
    alert(
      `Course Created:\nName: ${name}\nSlug: ${slug}\nLevel: ${level}\nPublic: ${isPublic}`
    );
  };

  return (
    <div className="flex min-h-screen bg-white text-black">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Create New Course</h1>

        <div className="flex flex-col gap-4 max-w-md">
          <input
            type="text"
            placeholder="Course Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-black rounded p-2"
          />
          <input
            type="text"
            placeholder="Course Slug (e.g., csc-101)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border border-black rounded p-2"
          />
          <input
            type="text"
            placeholder="Level (e.g., 100L)"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="border border-black rounded p-2"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label>Public</label>
          </div>

          <button
            onClick={handleCreateCourse}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Create Course
          </button>
        </div>
      </main>
    </div>
  );
}
