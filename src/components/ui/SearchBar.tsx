'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function SearchBar({ placeholder = 'Cari...', value: controlledValue, onChange }: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue ?? internalValue;

  const handleChange = (val: string) => {
    setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 text-sm bg-surface-alt border border-border-light rounded-xl outline-none focus:border-maroon-500 focus:ring-2 focus:ring-maroon-100 transition-colors"
      />
      {value && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          aria-label="Hapus pencarian"
        >
          <X size={14} className="text-gray-600" />
        </button>
      )}
    </div>
  );
}
