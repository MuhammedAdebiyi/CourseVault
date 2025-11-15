"use client";
import { useEffect, useState } from "react";
import api from "../utils/api";
import { Folder } from "react-bootstrap-icons";
import Sidebar from "../components/SideBar";
import Link from "next/link";

interface Course {
  id: number;
  title: string;
  slug: string;
  is_public: boolean;
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await api.get("courses/");
        setCourses(res.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.slug}`}>
              <div className="border p-4 rounded hover:shadow cursor-pointer flex items-center gap-3">
                <Folder className="text-black" size={24} />
                <span>{course.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
