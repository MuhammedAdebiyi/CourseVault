"use client";
import React from "react";

interface Props {
  title: string;
  description?: string;
  onClose?: () => void;
}

export default function SuccessDialog({ title, description, onClose }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-2 text-green-600">{title}</h2>
        {description && <p className="text-gray-700 mb-4">{description}</p>}
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
