"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { DataTable } from "@/components/data-table/data-table"
import { FormInput, FormSelect, FormCheckbox } from "@/components/forms/form-field"
import { ChartContainer, LineChart, BarChart, PieChart } from "@/components/charts/chart-container"
import { LazyLoad } from "@/components/performance/lazy-load"
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText } from "@/components/responsive/responsive-container"
import { MobileNav } from "@/components/mobile/mobile-nav"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useUIStore } from "@/lib/stores/ui-store"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { createSortableHeader } from "@/components/data-table/data-table"

// Mock data
const mockData = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "active", role: "admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "inactive", role: "user" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", status: "active", role: "user" },
]

const chartData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 200 },
  { name: "Apr", value: 278 },
  { name: "May", value: 189 },
  { name: "Jun", value: 239 },
]

const pieData = [
  { name: "Present", value: 45, color: "#22c55e" },
  { name: "Absent", value: 10, color: "#ef4444" },
  { name: "Late", value: 5, color: "#f59e0b" },
]

const columns = [
  createSortableHeader("Name", "name"),
  createSortableHeader("Email", "email"),
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => (
      <Badge variant={row.getValue("status") === "active" ? "default" : "secondary"}>
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
  },
]

export default function ExamplePage() {
  const { user, isAuthenticated } = useAuthStore()
  const { theme, addToast } = useUIStore()
  const { addNotification } = useNotificationStore()

  const handleAddToast = () => {
    addToast({
      title: "Success!",
      description: "This is a sample toast notification",
      type: "success",
    })
  }

  const handleAddNotification = () => {
    addNotification({
      title: "New Notification",
      message: "This is a sample notification",
      type: "info",
      priority: "medium",
      category: "system",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Go Absen - Example Page</h1>
            <Badge variant="outline">Enterprise Architecture</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button onClick={handleAddToast}>Add Toast</Button>
            <Button onClick={handleAddNotification} variant="outline">
              Add Notification
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <ResponsiveContainer maxWidth="2xl">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Go Absen Enterprise Architecture</CardTitle>
              <CardDescription>
                This page demonstrates all the implemented features and components.
                Current theme: <Badge variant="outline">{theme}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveText size={{ default: "lg", md: "xl" }} weight="semibold">
                {isAuthenticated ? `Welcome back, ${user?.name}!` : "Please log in to continue"}
              </ResponsiveText>
            </CardContent>
          </Card>
        </ResponsiveContainer>

        {/* Charts Section */}
        <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
          <ChartContainer
            title="Attendance Trend"
            description="Monthly attendance overview"
            onRefresh={() => console.log("Refreshing chart...")}
            onExport={() => console.log("Exporting chart...")}
          >
            <LineChart data={chartData} height={200} />
          </ChartContainer>

          <ChartContainer
            title="Department Distribution"
            description="Employee distribution by department"
          >
            <BarChart data={chartData} height={200} />
          </ChartContainer>

          <ChartContainer
            title="Attendance Status"
            description="Current attendance status breakdown"
          >
            <PieChart data={pieData} height={200} />
          </ChartContainer>
        </ResponsiveGrid>

        {/* Data Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>
              Advanced data table with sorting, filtering, and pagination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={mockData}
              searchKey="name"
              searchPlaceholder="Search employees..."
              enablePagination
              enableSorting
              enableColumnVisibility
              rowActions={[
                { label: "Edit", value: "edit" },
                { label: "Delete", value: "delete", variant: "destructive" },
              ]}
              onRowAction={(action, row) => {
                console.log(`${action} clicked for:`, row)
              }}
            />
          </CardContent>
        </Card>

        {/* Forms Section */}
        <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="lg">
          <Card>
            <CardHeader>
              <CardTitle>Form Examples</CardTitle>
              <CardDescription>
                Comprehensive form components with validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                label="Full Name"
                placeholder="Enter your full name"
                required
              />
              <FormInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                required
              />
              <FormSelect
                label="Department"
                placeholder="Select department"
                options={[
                  { value: "engineering", label: "Engineering" },
                  { value: "marketing", label: "Marketing" },
                  { value: "sales", label: "Sales" },
                ]}
              />
              <FormCheckbox
                label="I agree to the terms and conditions"
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Features</CardTitle>
              <CardDescription>
                Lazy loading and performance optimizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LazyLoad
                fallback={<div className="h-32 bg-muted animate-pulse rounded" />}
              >
                <div className="h-32 bg-primary/10 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Lazy loaded content</p>
                </div>
              </LazyLoad>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Features Grid */}
        <ResponsiveGrid cols={{ default: 1, sm: 2, md: 3, lg: 4 }} gap="md">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Theme System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive theme configuration with dark mode support
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Responsive Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mobile-first responsive components and layouts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">State Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Zustand stores for auth, UI, and notifications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lazy loading, caching, and optimization features
              </p>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Footer */}
        <Separator />
        <div className="text-center text-sm text-muted-foreground">
          <p>Go Absen Enterprise Architecture - Built with Next.js 15, React 19, and TypeScript</p>
          <p className="mt-2">
            Features: Theme System • Responsive Design • State Management • Performance Optimization • Testing
          </p>
        </div>
      </div>
    </div>
  )
}