import Sidebar from '../../components/SideBar';
import CourseCard from '../../components/CourseCard';

type Props = { params: { slug: string } };

export default function SubjectCoursesPage({ params }: Props) {
  const { slug } = params;

  // Example courses, replace with API call later
  const courses = [
    { name: `${slug.toUpperCase()} 101`, id: '1' },
    { name: `${slug.toUpperCase()} 102`, id: '2' },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Courses for {slug.toUpperCase()}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} name={course.name} id={course.id} />
          ))}
        </div>
      </main>
    </div>
  );
}
