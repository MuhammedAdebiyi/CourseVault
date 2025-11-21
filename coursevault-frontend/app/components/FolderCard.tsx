"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BiFolder } from "react-icons/bi";

export default function FolderCard({ folder }: { folder: any }) {
  return (
    <motion.div layout whileHover={{ scale: 1.02 }} className="p-4 bg-white rounded-xl shadow hover:shadow-lg">
      <Link href={`/folders/${folder.id}`} className="flex items-center gap-3">
        <div className="p-3 bg-yellow-100 rounded-lg">
          <BiFolder size={24} className="text-yellow-600" />
        </div>
        <div className="flex-1">
          <div className="font-semibold">{folder.name}</div>
          <div className="text-sm text-gray-500">{folder.files_count ?? 0} files • updated {new Date(folder.last_updated ?? Date.now()).toLocaleDateString()}</div>
        </div>
      </Link>
    </motion.div>
  );
}
