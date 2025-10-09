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
  },
  {
    href: '/admin/dashboard/karyawan',
    icon: Users,
    label: 'Data Karyawan',
  },
  {
    href: '/admin/dashboard/absensi',
    icon: Calendar,
    label: 'Absensi',
  },
  {
    href: '/admin/dashboard/laporan',
    icon: Clock,
    label: 'Laporan', 
  },
  {
  href: '/admin/dashboard/izin',
    icon: Activity,
    label: 'izin',
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
                        "w-full justify-start transition-all",
                        isSidebarOpen ? "px-3" : "px-2"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {isSidebarOpen && <span className="ml-2">{item.label}</span>}
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
            <h1 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => item.href === pathname)?.label || 'Admin Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Selamat datang, Admin
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
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
