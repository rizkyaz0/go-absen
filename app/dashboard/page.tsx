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
  BarChart3
} from "lucide-react";

// Import new components
import { StatsCard, AttendanceStatsCard, EmployeeStatsCard, LateStatsCard } from "@/components/patterns/StatsCard";
import { DashboardGrid, KpiRow, WidgetCard, ActivityTimeline, QuickActions, ResponsiveDashboard } from "@/components/patterns/DashboardGrid";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { DashboardSkeleton } from "@/components/loading/Skeletons";
import { useApi } from "@/lib/hooks/useApi";
import { useUIStore } from "@/lib/store/uiStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import existing components
import AbsenceButton from "@/components/AbsenceButton";
import CutiModal from "@/components/CutiModal";
import { getCurrentUserCached, getAttendanceStatsCached, getUserLeaveStatsCached } from "@/lib/actions";

export default function KaryawanDashboard() {
  const [user, setUser] = useState({ id: null, name: "" });
  const { setPageTitle, setPageDescription } = useUIStore();

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
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-bold text-foreground">
              Selamat Datang, {user.name} 👋
            </h1>
            <p className="text-muted-foreground">Dashboard Karyawan - Overview kehadiran dan produktivitas</p>
          </motion.header>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <WidgetCard title="Quick Actions" description="Akses cepat ke fitur utama">
              <QuickActions actions={quickActions} />
            </WidgetCard>
          </motion.div>

          {/* KPI Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <KpiRow>
              <AttendanceStatsCard
                present={dashboardStats?.presentToday || 0}
                total={dashboardStats?.totalEmployees || 0}
                loading={statsLoading}
              />
              <StatsCard
                title="Jam Kerja Hari Ini"
                value={dashboardStats?.averageCheckIn || "08:15"}
                description="Rata-rata check-in"
                icon={Clock}
                loading={statsLoading}
              />
              <LateStatsCard
                count={dashboardStats?.lateToday || 0}
                total={dashboardStats?.totalEmployees || 0}
                loading={statsLoading}
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
              />
            </KpiRow>
          </motion.div>

          {/* Main Content Grid */}
          <ResponsiveDashboard>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column - Charts and Data */}
              <div className="lg:col-span-2 space-y-6">
                {/* Attendance Chart */}
                <WidgetCard
                  title="Grafik Kehadiran"
                  description="Trend kehadiran 7 hari terakhir"
                  actions={
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Detail
                    </Button>
                  }
                >
                  {chartLoading ? (
                    <div className="h-64 bg-muted animate-pulse rounded" />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Chart placeholder - Integrate with chart library
                    </div>
                  )}
                </WidgetCard>

                {/* Attendance Table */}
                <WidgetCard
                  title="Data Kehadiran Hari Ini"
                  description="Daftar kehadiran karyawan"
                >
                  <Tabs defaultValue="present" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="present">Hadir</TabsTrigger>
                      <TabsTrigger value="late">Terlambat</TabsTrigger>
                      <TabsTrigger value="absent">Tidak Hadir</TabsTrigger>
                    </TabsList>
                    <TabsContent value="present" className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Employee {i + 1}</p>
                              <p className="text-sm text-muted-foreground">08:15</p>
                            </div>
                          </div>
                          <Badge variant="secondary">On Time</Badge>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="late" className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <p className="font-medium">Employee {i + 10}</p>
                              <p className="text-sm text-muted-foreground">08:45</p>
                            </div>
                          </div>
                          <Badge variant="destructive">30 min late</Badge>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="absent" className="space-y-2">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">Employee {i + 20}</p>
                              <p className="text-sm text-muted-foreground">No check-in</p>
                            </div>
                          </div>
                          <Badge variant="outline">Absent</Badge>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </WidgetCard>
              </div>

              {/* Right Column - Activities and Info */}
              <div className="space-y-6">
                {/* Recent Activities */}
                <WidgetCard
                  title="Aktivitas Terbaru"
                  description="Update terbaru dari sistem"
                >
                  <ActivityTimeline
                    activities={recentActivities || []}
                    loading={activitiesLoading}
                  />
                </WidgetCard>

                {/* Attendance Actions */}
                <WidgetCard
                  title="Aksi Kehadiran"
                  description="Kelola kehadiran Anda"
                >
                  <div className="space-y-4">
                    <AbsenceButton />
                    <CutiModal />
                  </div>
                </WidgetCard>

                {/* System Status */}
                <WidgetCard
                  title="Status Sistem"
                  description="Informasi sistem saat ini"
                >
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
                </WidgetCard>
              </div>
            </motion.div>
          </ResponsiveDashboard>
        </div>
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
