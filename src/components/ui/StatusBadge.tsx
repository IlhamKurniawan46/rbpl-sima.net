interface StatusBadgeProps {
  label: string;
  colorClass: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ label, colorClass, size = 'sm' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full whitespace-nowrap ${sizeClass} ${colorClass}`}>
      {label}
    </span>
  );
}
