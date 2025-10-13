"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

interface NavItem {
  title: string
  href: string
  description?: string
  badge?: string
  children?: NavItem[]
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description: "Overview of your attendance and statistics",
  },
  {
    title: "Absensi",
    href: "/admin/dashboard/absensi",
    description: "Manage employee attendance records",
  },
  {
    title: "Karyawan",
    href: "/admin/dashboard/karyawan",
    description: "Employee management and profiles",
  },
  {
    title: "Laporan",
    href: "/admin/dashboard/laporan",
    description: "Generate and view attendance reports",
  },
]

const adminNavItems: NavItem[] = [
  {
    title: "Admin Panel",
    href: "/admin",
    description: "Administrative controls and settings",
    children: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        description: "Admin dashboard overview",
      },
      {
        title: "User Management",
        href: "/admin/users",
        description: "Manage system users",
      },
      {
        title: "Settings",
        href: "/admin/settings",
        description: "System configuration",
      },
    ],
  },
]

interface NavigationProps {
  className?: string
  variant?: "default" | "admin"
}

export function Navigation({ className, variant = "default" }: NavigationProps) {
  const pathname = usePathname()
  const navItems = variant === "admin" ? adminNavItems : mainNavItems

  return (
    <NavigationMenu className={cn("hidden md:flex", className)}>
      <NavigationMenuList>
        {navItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.children ? (
              <>
                <NavigationMenuTrigger className="h-9">
                  {item.title}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {item.children.map((child) => (
                      <li key={child.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={child.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              pathname === child.href && "bg-accent text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">
                              {child.title}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {child.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
                    pathname === item.href && "bg-accent text-accent-foreground"
                  )}
                >
                  {item.title}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

// Mobile Navigation Component
interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  variant?: "default" | "admin"
}

export function MobileNavigation({ 
  isOpen, 
  onClose, 
  className, 
  variant = "default" 
}: MobileNavigationProps) {
  const pathname = usePathname()
  const navItems = variant === "admin" ? adminNavItems : mainNavItems

  if (!isOpen) return null

  return (
    <div className={cn("md:hidden", className)}>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-0 top-0 z-50 h-full w-64 bg-background border-r">
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <span className="font-semibold">Navigation</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.title}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href && "bg-accent text-accent-foreground"
                )}
              >
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
              {item.children && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.title}
                      href={child.href}
                      onClick={onClose}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === child.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}