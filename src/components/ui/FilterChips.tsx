'use client';

interface FilterChipsProps {
  options: { value: string; label: string }[];
  selected: string;
  onChange: (value: string) => void;
}

export default function FilterChips({ options, selected, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0 ${
            selected === opt.value
              ? 'bg-maroon-600 text-white shadow-sm'
              : 'bg-surface-alt text-text-muted border border-border-light hover:border-maroon-200 hover:text-maroon-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
