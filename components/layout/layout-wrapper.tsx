"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { Header } from "./header"
import { Footer } from "./footer"
import { Navigation, MobileNavigation } from "./navigation"
import { Sidebar } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

interface LayoutWrapperProps {
  children: React.ReactNode
  className?: string
  showSidebar?: boolean
  showFooter?: boolean
  variant?: "default" | "admin"
}

export function LayoutWrapper({
  children,
  className,
  showSidebar = false,
  showFooter = true,
  variant = "default",
}: LayoutWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()

  // Determine if we should show sidebar based on path
  const shouldShowSidebar = showSidebar || pathname.startsWith("/admin")

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMenuOpen={isMobileMenuOpen}
      />
      
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        variant={variant}
      />

      <div className="flex">
        {shouldShowSidebar && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}
        
        <main className={cn(
          "flex-1 min-h-[calc(100vh-4rem)]",
          shouldShowSidebar && "md:ml-64",
          className
        )}>
          {children}
        </main>
      </div>

      {showFooter && <Footer />}
      <Toaster />
    </div>
  )
}

// Admin Layout with Sidebar
export function AdminLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <LayoutWrapper
      showSidebar={true}
      variant="admin"
      className={className}
    >
      {children}
    </LayoutWrapper>
  )
}

// Public Layout without Sidebar
export function PublicLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <LayoutWrapper
      showSidebar={false}
      variant="default"
      className={className}
    >
      {children}
    </LayoutWrapper>
  )
}