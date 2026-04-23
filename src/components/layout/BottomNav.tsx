'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Ticket,
  CreditCard,
  Menu,
  Wrench,
  Bell,
  UserCircle,
  Wifi,
  FileText,
} from 'lucide-react';
import type { UserRole } from '@/lib/types/database';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Pelanggan', href: '/admin/customers' },
    { icon: Ticket, label: 'Tiket', href: '/admin/tickets' },
    { icon: CreditCard, label: 'Tagihan', href: '/admin/payments' },
    { icon: Menu, label: 'Lainnya', href: '/admin/more' },
  ],
  technician: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/technician/dashboard' },
    { icon: Wrench, label: 'Tugas', href: '/technician/tasks' },
    { icon: Ticket, label: 'Tiket', href: '/technician/tickets' },
    { icon: Bell, label: 'Notifikasi', href: '/technician/notifications' },
    { icon: UserCircle, label: 'Profil', href: '/technician/profile' },
  ],
  customer: [
    { icon: LayoutDashboard, label: 'Beranda', href: '/customer/dashboard' },
    { icon: Wifi, label: 'Layanan', href: '/customer/services' },
    { icon: FileText, label: 'Laporan', href: '/customer/tickets' },
    { icon: CreditCard, label: 'Tagihan', href: '/customer/invoices' },
    { icon: UserCircle, label: 'Profil', href: '/customer/profile' },
  ],
};

interface BottomNavProps {
  role: UserRole;
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV_ITEMS[role];

  const isActive = (href: string) => {
    if (href === pathname) return true;
    // Match parent path (e.g., /admin/customers matches /admin/customers/[id])
    if (href !== `/${role}/dashboard` && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white z-50 safe-bottom"
      style={{ boxShadow: 'var(--shadow-nav)' }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors duration-200 ${
                active
                  ? 'text-maroon-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={item.label}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className={`text-[10px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
