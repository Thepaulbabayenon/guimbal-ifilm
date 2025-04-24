import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SortButtonProps {
  active: boolean;
  order: 'asc' | 'desc' | null;
  onClick: () => void;
  label: string;
}

export function SortButton({ active, order, onClick, label }: SortButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md flex items-center transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      {active && (
        <span className="ml-2">
          {order === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        </span>
      )}
    </button>
  );
}

export default SortButton;