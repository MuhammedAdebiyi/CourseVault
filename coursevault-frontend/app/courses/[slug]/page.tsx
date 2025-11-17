"use client";

import { useEffect, useState } from "react";

interface PDF {
  id: number;
  title: string;
  download_url: string;
}

export default function CoursePage({ params }: { params: { slug: string } }) {
  const [pdfs, setPDFs] = useState<PDF[]>([]);

  useEffect(() => {
    const fetchPDFs = async () => {
      const token = localStorage.getItem("accessToken"); // store JWT after login
      const res = await fetch(`http://127.0.0.1:8000/api/pdfs/?course__slug=${params.slug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPDFs(data);
      } else {
        console.error("Failed to fetch PDFs");
      }
    };

    fetchPDFs();
  }, [params.slug]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{params.slug}</h1>
      <div className="grid gap-4">
        {pdfs.map((pdf) => (
          <div key={pdf.id} className="p-4 border rounded shadow hover:shadow-lg">
            <h2 className="font-semibold">{pdf.title}</h2>
            <a
              href={pdf.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-blue-600 hover:underline"
            >
              Download PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
