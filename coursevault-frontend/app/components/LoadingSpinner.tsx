"use client";
export default function LoadingSpinner() {
  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
        <div className="text-white">Loading...</div>
      </div>
    </div>
  );
}
