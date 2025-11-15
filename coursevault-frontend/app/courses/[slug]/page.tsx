"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../utils/api";

interface PDF {
  id: number;
  title: string;
  file: string;
}

export default function CoursePage() {
  const params = useParams();
  const [pdfs, setPdfs] = useState<PDF[]>([]);

  useEffect(() => {
    async function fetchPdfs() {
      try {
        const res = await api.get(`courses/?slug=${params.slug}`);
        const course = res.data[0];
        setPdfs(course.pdfs);
      } catch (error) {
        console.error(error);
      }
    }
    fetchPdfs();
  }, [params.slug]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{params.slug}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pdfs.map((pdf) => (
          <div key={pdf.id} className="border p-4 rounded">
            <a href={pdf.file} target="_blank" rel="noopener noreferrer">
              {pdf.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
