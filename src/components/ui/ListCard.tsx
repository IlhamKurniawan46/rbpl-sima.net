'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface ListCardProps {
  href?: string;
  onClick?: () => void;
  avatar?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  showChevron?: boolean;
}

export default function ListCard({
  href,
  onClick,
  avatar,
  title,
  subtitle,
  trailing,
  showChevron = true,
}: ListCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl shadow-[var(--shadow-card)] border border-border-light hover:border-maroon-200 hover:shadow-[var(--shadow-elevated)] transition-all duration-200 text-left active:scale-[0.98]"
    >
      {avatar && (
        <div className="flex-shrink-0">{avatar}</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-heading truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {trailing && (
        <div className="flex-shrink-0">{trailing}</div>
      )}
      {showChevron && (
        <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
      )}
    </button>
  );
}
