"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X, Menu, Home, Users, Calendar, BarChart3, Settings, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useUIStore } from "@/lib/stores/ui-store"

interface MobileNavProps {
  className?: string
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and statistics",
  },
  {
    title: "Absensi",
    href: "/admin/dashboard/absensi",
    icon: Calendar,
    description: "Attendance management",
    badge: "New",
  },
  {
    title: "Karyawan",
    href: "/admin/dashboard/karyawan",
    icon: Users,
    description: "Employee management",
  },
  {
    title: "Laporan",
    href: "/admin/dashboard/laporan",
    icon: BarChart3,
    description: "Reports and analytics",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System settings",
  },
]

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore()

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", className)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">GA</span>
              </div>
              <span className="font-bold text-lg">Go Absen</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="px-6 py-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-6">
            <nav className="space-y-2 py-4">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs opacity-70">{item.description}</p>
                    </div>
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-6">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => {
                logout()
                setMobileMenuOpen(false)
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Bottom Navigation for mobile
interface MobileBottomNavProps {
  className?: string
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname()

  const bottomNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Absensi",
      href: "/admin/dashboard/absensi",
      icon: Calendar,
    },
    {
      title: "Karyawan",
      href: "/admin/dashboard/karyawan",
      icon: Users,
    },
    {
      title: "Laporan",
      href: "/admin/dashboard/laporan",
      icon: BarChart3,
    },
  ]

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden", className)}>
      <div className="grid grid-cols-4 h-16">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="truncate">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Mobile-specific components
interface MobileCardProps {
  children: React.ReactNode
  className?: string
  padding?: "sm" | "md" | "lg"
}

const paddingClasses = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
}

export function MobileCard({ children, className, padding = "md" }: MobileCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border shadow-sm",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

interface MobileListProps {
  children: React.ReactNode
  className?: string
}

export function MobileList({ children, className }: MobileListProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  )
}

interface MobileListItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
}

export function MobileListItem({ children, className, onClick, href }: MobileListItemProps) {
  const Component = href ? Link : "div"
  const props = href ? { href } : { onClick }

  return (
    <Component
      className={cn(
        "flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}