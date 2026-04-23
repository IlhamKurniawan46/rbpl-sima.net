import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ElementType;
}

export default function EmptyState({
  title = 'Tidak Ada Data',
  message = 'Belum ada data untuk ditampilkan.',
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-alt flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-300" />
      </div>
      <h3 className="text-sm font-semibold text-text-heading mb-1">{title}</h3>
      <p className="text-xs text-text-muted text-center max-w-[240px]">{message}</p>
    </div>
  );
}
