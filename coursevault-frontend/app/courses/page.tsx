"use client";

import Link from "next/link";
import Sidebar from "../components/SideBar";
import { Folder } from "react-bootstrap-icons";

const courses = [
  { name: "CSC 101", slug: "csc-101" },
  { name: "MAT 100", slug: "mat-100" },
  { name: "PHY 101", slug: "phy-101" },
];

export default function CoursesPage() {
  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Courses</h1>
          
        </div>

        {/* Courses grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="flex items-center gap-4 border rounded-lg p-4 shadow hover:shadow-lg transition bg-gray-50 hover:bg-gray-100"
            >
              <Folder size={32} className="text-black" />
              <div>
                <h3 className="text-lg font-semibold">{course.name}</h3>
                <p className="text-gray-600 text-sm">
                  Click to view course materials
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
