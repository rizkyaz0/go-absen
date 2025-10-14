"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  Bell,
  BarChart3,
  FileText,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileDashboardNavProps {
  className?: string;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    current: true,
  },
  {
    name: "Kehadiran",
    href: "/attendance",
    icon: Clock,
    current: false,
  },
  {
    name: "Laporan",
    href: "/reports",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Karyawan",
    href: "/employees",
    icon: Users,
    current: false,
  },
  {
    name: "Cuti",
    href: "/leave",
    icon: Calendar,
    current: false,
  },
  {
    name: "Dokumen",
    href: "/documents",
    icon: FileText,
    current: false,
  },
];

export function MobileDashboardNav({ className }: MobileDashboardNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("lg:hidden", className)}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 left-4 z-50 lg:hidden"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">Go-Absen</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Mobile
              </Badge>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={item.current ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      item.current && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Bell className="mr-3 h-4 w-4" />
                Notifikasi
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="mr-3 h-4 w-4" />
                Pengaturan
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}