import Link from 'next/link';

type Props = {
  name: string;
  slug: string;
};

export default function SubjectCard({ name, slug }: Props) {
  return (
    <Link href={`/subjects/${slug}`}>
      <div className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer">
        <h3 className="text-lg font-semibold">{name}</h3>
      </div>
    </Link>
  );
}
