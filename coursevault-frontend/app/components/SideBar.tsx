import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-6">CourseVault</h2>
      <nav className="flex flex-col space-y-3">
        <Link href="/dashboard" className="text-black hover:text-gray-700">
          Dashboard
        </Link>
        <Link href="/courses" className="text-black hover:text-gray-700">
          Courses
        </Link>
        <Link href="/profile" className="text-black hover:text-gray-700">
          Profile
        </Link>
      </nav>
    </aside>
  );
}
