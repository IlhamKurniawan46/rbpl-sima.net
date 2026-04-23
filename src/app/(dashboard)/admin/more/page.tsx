'use client';

import TopBar from '@/components/layout/TopBar';
import ListCard from '@/components/ui/ListCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Wrench, Package, Wifi, Bell, LogOut, Settings } from 'lucide-react';

export default function AdminMorePage() {
  const { logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    { icon: Users, label: 'Kelola Teknisi', subtitle: 'Daftar dan penugasan teknisi', href: '/admin/technicians' },
    { icon: Package, label: 'Paket Internet', subtitle: 'Kelola paket layanan ISP', href: '/admin/packages' },
    { icon: Wifi, label: 'Pemasangan', subtitle: 'Status pemasangan pelanggan', href: '/admin/installations' },
    { icon: Bell, label: 'Notifikasi', subtitle: 'Pusat notifikasi', href: '/admin/notifications' },
  ];

  return (
    <>
      <TopBar title="Lainnya" showNotification={false} />
      <div className="p-4 space-y-2.5">
        {menuItems.map((item) => (
          <ListCard
            key={item.href}
            href={item.href}
            avatar={<div className="w-10 h-10 rounded-xl bg-maroon-50 text-maroon-600 flex items-center justify-center"><item.icon size={20} /></div>}
            title={item.label}
            subtitle={item.subtitle}
          />
        ))}
        <div className="pt-4">
          <ListCard
            onClick={() => { logout(); router.replace('/'); }}
            avatar={<div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><LogOut size={20} /></div>}
            title="Keluar"
            subtitle="Logout dari akun"
            showChevron={false}
          />
        </div>
      </div>
    </>
  );
}
