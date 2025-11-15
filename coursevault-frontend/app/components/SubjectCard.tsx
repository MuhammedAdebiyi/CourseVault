import Link from 'next/link';

interface SubjectCardProps {
  name: string;
  slug: string;
}

export default function SubjectCard({ name, slug }: SubjectCardProps) {
  return (
    <Link
      href={`/subjects/${slug}`}
      className="block bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow"
    >
      <h3 className="text-xl font-semibold">{name}</h3>
    </Link>
  );
}
