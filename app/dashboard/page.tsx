"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CalendarDays, 
  Users, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Plus,
  FileText,
  BarChart3,
  Activity,
  Settings,
  Bell
} from "lucide-react";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// Import existing components
import { StatsCard, AttendanceStatsCard, EmployeeStatsCard, LateStatsCard } from "@/components/patterns/StatsCard";
import { DashboardGrid, KpiRow, WidgetCard, ActivityTimeline, QuickActions, ResponsiveDashboard } from "@/components/patterns/DashboardGrid";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { DashboardSkeleton } from "@/components/loading/Skeletons";
import { useApi } from "@/lib/hooks/useApi";
import { useUIStore } from "@/lib/store/uiStore";
import { usePerformance } from "@/hooks/use-performance";
import AbsenceButton from "@/components/AbsenceButton";
import CutiModal from "@/components/CutiModal";
import { MobileDashboardNav } from "@/components/mobile/mobile-dashboard-nav";
import { OptimizedChart } from "@/components/charts/optimized-chart";
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText } from "@/components/responsive/responsive-container";
import { getCurrentUserCached, getAttendanceStatsCached, getUserLeaveStatsCached } from "@/lib/actions";

export default function KaryawanDashboard() {
  const [user, setUser] = useState({ id: null, name: "" });
  const { setPageTitle, setPageDescription } = useUIStore();
  const { shouldReduceAnimations, isMobile, isTablet } = usePerformance();

  // API hooks for data fetching
  const { data: dashboardStats, loading: statsLoading } = useApi(
    "dashboard-stats",
    () => getDashboardStats(),
    { immediate: true }
  );

  const { data: recentActivities, loading: activitiesLoading } = useApi(
    "recent-activities",
    () => getRecentActivities(),
    { immediate: true }
  );

  const { data: chartData, loading: chartLoading } = useApi(
    "attendance-chart",
    () => getAttendanceChartData(),
    { immediate: true }
  );

  useEffect(() => {
    async function fetchUser() {
      try {
        const result = await getCurrentUserCached();
        if ('error' in result) {
          console.error(result.error);
          return;
        }
        setUser(result);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    setPageTitle("Dashboard");
    setPageDescription("Overview of your attendance and work statistics");
  }, [setPageTitle, setPageDescription]);

  if (!user.id) return <DashboardSkeleton />;

  const quickActions = [
    {
      id: "check-in",
      label: "Check In",
      icon: <CheckCircle className="h-6 w-6" />,
      onClick: () => console.log("Check in"),
    },
    {
      id: "check-out",
      label: "Check Out",
      icon: <XCircle className="h-6 w-6" />,
      onClick: () => console.log("Check out"),
    },
    {
      id: "request-leave",
      label: "Request Leave",
      icon: <FileText className="h-6 w-6" />,
      onClick: () => console.log("Request leave"),
    },
    {
      id: "view-reports",
      label: "View Reports",
      icon: <BarChart3 className="h-6 w-6" />,
      onClick: () => console.log("View reports"),
    },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Mobile Navigation */}
        <MobileDashboardNav />
        
        <ResponsiveContainer variant="default" mobileFirst>
          {/* Header */}
          <motion.header
            initial={shouldReduceAnimations() ? false : { y: -20, opacity: 0 }}
            animate={shouldReduceAnimations() ? false : { y: 0, opacity: 1 }}
            transition={shouldReduceAnimations() ? {} : { duration: 0.5 }}
            className="text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <ResponsiveText size="2xl" className="font-bold text-foreground">
                  Selamat Datang, {user.name} 👋
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-muted-foreground">
                  Dashboard Karyawan
                </ResponsiveText>
              </div>
            </div>
            <ResponsiveText size="xs" className="text-muted-foreground">
              Overview kehadiran dan produktivitas
            </ResponsiveText>
          </motion.header>

          {/* Quick Actions - Mobile Optimized */}
          <motion.div
            initial={shouldReduceAnimations() ? false : { opacity: 0, y: 20 }}
            animate={shouldReduceAnimations() ? false : { opacity: 1, y: 0 }}
            transition={shouldReduceAnimations() ? {} : { delay: 0.2, duration: 0.5 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Akses cepat ke fitur utama</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-auto p-3 md:p-4 flex flex-col items-center gap-2 hover:bg-accent"
                      onClick={action.onClick}
                    >
                      <div className="text-primary">{action.icon}</div>
                      <span className="text-xs md:text-sm font-medium">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* KPI Row - Mobile Optimized */}
          <motion.div
            initial={shouldReduceAnimations() ? false : { opacity: 0, y: 20 }}
            animate={shouldReduceAnimations() ? false : { opacity: 1, y: 0 }}
            transition={shouldReduceAnimations() ? {} : { delay: 0.3, duration: 0.5 }}
          >
            <ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 4, wide: 4 }}>
              <AttendanceStatsCard
                present={dashboardStats?.presentToday || 0}
                total={dashboardStats?.totalEmployees || 0}
                loading={statsLoading}
                className="col-span-1"
              />
              <StatsCard
                title="Jam Kerja Hari Ini"
                value={dashboardStats?.averageCheckIn || "08:15"}
                description="Rata-rata check-in"
                icon={Clock}
                loading={statsLoading}
                className="col-span-1"
              />
              <LateStatsCard
                count={dashboardStats?.lateToday || 0}
                total={dashboardStats?.totalEmployees || 0}
                loading={statsLoading}
                className="col-span-1"
              />
              <StatsCard
                title="Produktivitas"
                value={`${dashboardStats?.onTimePercentage || 89.7}%`}
                description="Tepat waktu bulan ini"
                icon={TrendingUp}
                trend={{
                  value: 5.2,
                  label: "vs bulan lalu",
                  type: "positive",
                }}
                loading={statsLoading}
                variant="success"
                className="col-span-1"
              />
            </ResponsiveGrid>
          </motion.div>

          {/* Main Content Grid - Mobile First */}
          <motion.div
            initial={shouldReduceAnimations() ? false : { opacity: 0, y: 20 }}
            animate={shouldReduceAnimations() ? false : { opacity: 1, y: 0 }}
            transition={shouldReduceAnimations() ? {} : { delay: 0.4, duration: 0.5 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Attendance Actions - Priority on Mobile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Aksi Kehadiran
                </CardTitle>
                <CardDescription>Kelola kehadiran Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AbsenceButton />
                  <Separator />
                  <CutiModal />
                </div>
              </CardContent>
            </Card>

            {/* Main Grid - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Charts and Data */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {/* Attendance Chart */}
                <OptimizedChart
                  title="Grafik Kehadiran"
                  description="Trend kehadiran 7 hari terakhir"
                  type="area"
                  data={chartData?.datasets?.[0]?.data?.map((value, index) => ({
                    name: chartData?.labels?.[index] || `Day ${index + 1}`,
                    value: value,
                  })) || []}
                  height={300}
                  loading={chartLoading}
                  className="w-full"
                />

                {/* Attendance Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Kehadiran Hari Ini</CardTitle>
                    <CardDescription>Daftar kehadiran karyawan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="present" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="present" className="text-xs">Hadir</TabsTrigger>
                        <TabsTrigger value="late" className="text-xs">Terlambat</TabsTrigger>
                        <TabsTrigger value="absent" className="text-xs">Tidak Hadir</TabsTrigger>
                      </TabsList>
                      <TabsContent value="present" className="space-y-2 mt-4">
                        <ScrollArea className="h-64">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-green-100 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">Employee {i + 1}</p>
                                  <p className="text-xs text-muted-foreground">08:15</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">On Time</Badge>
                            </div>
                          ))}
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="late" className="space-y-2 mt-4">
                        <ScrollArea className="h-64">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-yellow-100 text-yellow-600">
                                    <AlertCircle className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">Employee {i + 10}</p>
                                  <p className="text-xs text-muted-foreground">08:45</p>
                                </div>
                              </div>
                              <Badge variant="destructive" className="text-xs">30 min late</Badge>
                            </div>
                          ))}
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="absent" className="space-y-2 mt-4">
                        <ScrollArea className="h-64">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg mb-2">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-red-100 text-red-600">
                                    <XCircle className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-sm">Employee {i + 20}</p>
                                  <p className="text-xs text-muted-foreground">No check-in</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">Absent</Badge>
                            </div>
                          ))}
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Activities and Info */}
              <div className="space-y-4 md:space-y-6">
                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bell className="h-5 w-5" />
                      Aktivitas Terbaru
                    </CardTitle>
                    <CardDescription>Update terbaru dari sistem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <ActivityTimeline
                        activities={recentActivities || []}
                        loading={activitiesLoading}
                      />
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="h-5 w-5" />
                      Status Sistem
                    </CardTitle>
                    <CardDescription>Informasi sistem saat ini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Server Status</span>
                        <Badge variant="default">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Database</span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Last Sync</span>
                        <span className="text-xs text-muted-foreground">2 min ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </ResponsiveContainer>
      </div>
    </ErrorBoundary>
  );
}

// Mock API functions - TODO: implement backend integration
async function getDashboardStats() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    totalEmployees: 156,
    presentToday: 142,
    absentToday: 14,
    lateToday: 8,
    onTimePercentage: 89.7,
    averageCheckIn: "08:15",
    averageCheckOut: "17:30",
  };
}

async function getRecentActivities() {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    {
      id: "1",
      title: "Check-in berhasil",
      description: "Anda telah check-in pada 08:15",
      timestamp: "2 jam yang lalu",
      type: "success" as const,
    },
    {
      id: "2",
      title: "Pengajuan cuti",
      description: "Pengajuan cuti tanggal 25 Januari telah disetujui",
      timestamp: "1 hari yang lalu",
      type: "info" as const,
    },
    {
      id: "3",
      title: "Reminder check-out",
      description: "Jangan lupa check-out pada jam 17:00",
      timestamp: "3 jam yang lalu",
      type: "warning" as const,
    },
  ];
}

async function getAttendanceChartData() {
  await new Promise(resolve => setTimeout(resolve, 600));
  return {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    datasets: [
      {
        label: "Hadir",
        data: [95, 92, 88, 94, 96, 45, 30],
      },
      {
        label: "Tidak Hadir",
        data: [5, 8, 12, 6, 4, 55, 70],
      },
    ],
  };
}
