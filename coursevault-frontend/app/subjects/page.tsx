import Sidebar from '../components/SideBar';
import SubjectCard from '../components/SubjectCard';

export default function SubjectsPage() {
  const subjects = [
    { name: 'Computer Science', slug: 'csc' },
    { name: 'Mathematics', slug: 'mat' },
    { name: 'Physics', slug: 'phy' },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Subjects</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <SubjectCard key={sub.slug} name={sub.name} slug={sub.slug} />
          ))}
        </div>
      </main>
    </div>
  );
}
