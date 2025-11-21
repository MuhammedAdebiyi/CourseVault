"use client";
import { useState, useEffect } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import LoadingSpinner from "../app/components/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Simulate loading (you can replace this with actual API fetching)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // 1s delay
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    router.push("/signup");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 bg-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Organize Your Course Materials
        </h1>
        <p className="text-lg text-gray-800 max-w-2xl mb-8">
          CourseVault is your secure PDF organizer for courses. Create courses, organize files into folders, and easily access all your study materials in one place.
        </p>
        <button 
          onClick={handleGetStarted}
          className="px-6 py-3 border border-black rounded font-medium hover:bg-black hover:text-white transition"
        >
          Get Started Free
        </button>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 px-6 py-16 max-w-6xl mx-auto text-black">
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition flex flex-col items-center">
          <i className="bi bi-folder2-open text-3xl mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Organize Courses</h3>
          <p className="text-center">
            Create courses and organize your study materials
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition flex flex-col items-center">
          <i className="bi bi-folder-symlink text-3xl mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Nested Folders</h3>
          <p className="text-center">
            Create hierarchical folder structures
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition flex flex-col items-center">
          <i className="bi bi-file-earmark-text text-3xl mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">View PDFs</h3>
          <p className="text-center">
            View and manage all your PDFs in one place
          </p>
        </div>
      </section>
    </main>
  );
}
