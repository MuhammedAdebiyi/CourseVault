"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ShareRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    // Redirect to the proper public folder URL
    if (slug) {
      router.replace(`/folders/public/${slug}`);
    }
  }, [slug, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading shared folder...</p>
      </div>
    </div>
  );
}