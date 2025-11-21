"use client";
import Link from "next/link";

export default function Breadcrumbs({ crumbs }: { crumbs: { label:string, href?:string }[] }) {
  return (
    <nav className="text-sm text-gray-500 mb-4">
      {crumbs.map((c, i) => (
        <span key={i}>
          {c.href ? <Link href={c.href} className="hover:underline">{c.label}</Link> : <span>{c.label}</span>}
          {i < crumbs.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}
