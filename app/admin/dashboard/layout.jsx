'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  Calendar,
  Clock,
  ChevronLeft,
  LogOut
} from "lucide-react";
import { cn } from '@/lib/utils';
import { LogoutModal } from '@/components/LogoutModal';
import { Toaster } from '@/components/ui/sonner';

const menuItems = [
  {
    href: '/admin/dashboard',
    icon: Activity,
    label: 'Dashboard',
    description: 'Overview sistem'
  },
  {
    href: '/admin/dashboard/karyawan',
    icon: Users,
    label: 'Data Karyawan',
    description: 'Kelola data karyawan'
  },
  {
    href: '/admin/dashboard/absensi',
    icon: Calendar,
    label: 'Absensi',
    description: 'Kelola absensi'
  },
  {
    href: '/admin/dashboard/izin',
    icon: Clock,
    label: 'Izin & Cuti',
    description: 'Kelola permintaan izin'
  },
  {
    href: '/admin/dashboard/hari-libur',
    icon: Calendar,
    label: 'Hari Libur',
    description: 'Tetapkan tanggal merah/harian libur'
  },
  {
    href: '/admin/dashboard/laporan',
    icon: Activity,
    label: 'Laporan',
    description: 'Analisis & laporan'
  },
];

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50/40">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-white border-r transition-all duration-300 ease-in-out flex flex-col h-full",
          isSidebarOpen ? "w-64" : "w-[70px]"
        )}
      >
        {/* Header Sidebar */}
        <div className="p-4 border-b flex items-center justify-between">
          {isSidebarOpen ? (
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded"></div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="h-8 w-8"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                !isSidebarOpen && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start transition-all group",
                        isSidebarOpen ? "px-3 h-auto py-3" : "px-2 h-10"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-blue-600" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      {isSidebarOpen && (
                        <div className="ml-2 text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      )}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.href === pathname)?.label || 'Admin Dashboard'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {menuItems.find(item => item.href === pathname)?.description || 'Sistem Manajemen Absensi'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Selamat datang, Admin</div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
