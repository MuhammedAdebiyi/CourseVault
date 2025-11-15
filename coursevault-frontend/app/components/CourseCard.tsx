import Link from 'next/link';

type Props = {
  name: string;
  id: string;
};

export default function CourseCard({ name, id }: Props) {
  return (
    <Link href={`/courses/${id}`}>
      <div className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer">
        <h3 className="text-lg font-semibold">{name}</h3>
      </div>
    </Link>
  );
}
