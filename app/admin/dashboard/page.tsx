"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  Clock, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TrendingUp, 
  Calendar,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw
} from "lucide-react";
import { 
  getAllUsersCached, 
  getAllAbsencesCached, 
  getAllLeaveRequestsCached
} from "@/lib/actions";
import { showErrorToast, showDataLoadedToast } from "@/lib/toast-utils";
import { Toaster } from "@/components/ui/sonner";

interface Absence {
  id: number;
  user: { id: number; name: string; roleId?: number; statusId?: number };
  shiftId?: number | null;
  date: string | Date;
  checkIn?: string | Date | null;
  checkOut?: string | Date | null;
  status: "Hadir" | "Terlambat" | "Absen" | "Pulang";
  note?: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
  roleId?: number;
  statusId?: number;
  createdAt?: string | Date;
}

interface LeaveRequest {
  id: number;
  user: { id: number; name: string };
  type: string;
  startDate: string | Date;
  endDate: string | Date;
  status: "Pending" | "Approved" | "Rejected";
  reason?: string;
}

interface DashboardStats {
  totalKaryawan: number;
  hadirHariIni: number;
  terlambatHariIni: number;
  absenHariIni: number;
  pendingIzin: number;
  approvedIzin: number;
  rejectedIzin: number;
  tingkatKehadiran: number;
  rataRataKehadiran: number;
}

export default function AdminDashboard() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalKaryawan: 0,
    hadirHariIni: 0,
    terlambatHariIni: 0,
    absenHariIni: 0,
    pendingIzin: 0,
    approvedIzin: 0,
    rejectedIzin: 0,
    tingkatKehadiran: 0,
    rataRataKehadiran: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        // Fetch all data in parallel for better performance
        const [usersResult, absencesResult, leaveResult] = await Promise.all([
          getAllUsersCached(),
          getAllAbsencesCached(),
          getAllLeaveRequestsCached()
        ]);

        if (isMounted) {
          // Process users data
          if ('success' in usersResult && usersResult.success) {
            showDataLoadedToast("Karyawan", usersResult.data.length);
          } else if ('error' in usersResult) {
            showErrorToast("Gagal memuat data karyawan", usersResult.error);
          }
          
          // Process absences data
          if ('success' in absencesResult && absencesResult.success) {
            const normalized: Absence[] = (absencesResult.data as Array<Absence | (Absence & { status: string })>).map((a) => ({
              ...a,
              status: a.status as Absence['status'],
            }))
            setAbsences(normalized);
            showDataLoadedToast("Absensi", absencesResult.data.length);
          } else if ('error' in absencesResult) {
            showErrorToast("Gagal memuat data absensi", absencesResult.error);
          }

          // Process leave requests data
          if ('success' in leaveResult && leaveResult.success) {
            const normalizedLeaves: LeaveRequest[] = (leaveResult.data as Array<LeaveRequest | (LeaveRequest & { status: string })>).map((l) => ({
              ...l,
              status: l.status as LeaveRequest['status'],
            }))
            setLeaveRequests(normalizedLeaves);
            showDataLoadedToast("Permintaan Izin", leaveResult.data.length);
          } else if ('error' in leaveResult) {
            showErrorToast("Gagal memuat data izin", leaveResult.error);
          }

          // Calculate stats
          calculateStats(
            ('success' in usersResult && usersResult.success) ? usersResult.data || [] : [],
            ('success' in absencesResult && absencesResult.success)
              ? ((absencesResult.data as Array<Absence | (Absence & { status: string })>).map((a) => ({
                  ...a,
                  status: a.status as Absence['status'],
                })) as Absence[])
              : [],
            ('success' in leaveResult && leaveResult.success)
              ? ((leaveResult.data as Array<LeaveRequest | (LeaveRequest & { status: string })>).map((l) => ({
                  ...l,
                  status: l.status as LeaveRequest['status'],
                })) as LeaveRequest[])
              : []
          );
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        showErrorToast("Terjadi kesalahan", "Gagal memuat data dashboard");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const calculateStats = (usersData: User[], absencesData: Absence[], leaveData: LeaveRequest[]) => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Filter data for today
    const absensiHariIni = absencesData.filter((a) => {
      const absenceDate = new Date(a.date);
      const absenceDateString = absenceDate.toISOString().split('T')[0];
      return absenceDateString === todayString;
    });

    const hadirHariIni = absensiHariIni.filter((a) => a.checkIn !== null).length;
    const terlambatHariIni = absensiHariIni.filter((a) => {
      if (!a.checkIn) return false;
      const checkInTime = new Date(a.checkIn);
      const hours = checkInTime.getHours();
      return hours > 8; // Terlambat jika check-in setelah jam 8
    }).length;

    const totalKaryawan = usersData.length;
    const absenHariIni = totalKaryawan - hadirHariIni;
    const tingkatKehadiran = totalKaryawan > 0 ? (hadirHariIni / totalKaryawan) * 100 : 0;

    // Leave requests stats
    const pendingIzin = leaveData.filter(l => l.status === 'Pending').length;
    const approvedIzin = leaveData.filter(l => l.status === 'Approved').length;
    const rejectedIzin = leaveData.filter(l => l.status === 'Rejected').length;

    // Calculate average attendance for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAbsences = absencesData.filter((a) => {
      const absenceDate = new Date(a.date);
      return absenceDate >= thirtyDaysAgo;
    });

    const totalAbsences = recentAbsences.length;
    const totalPresent = recentAbsences.filter(a => a.checkIn !== null).length;
    const rataRataKehadiran = totalAbsences > 0 ? (totalPresent / totalAbsences) * 100 : 0;

    setStats({
      totalKaryawan,
      hadirHariIni,
      terlambatHariIni,
      absenHariIni,
      pendingIzin,
      approvedIzin,
      rejectedIzin,
      tingkatKehadiran,
      rataRataKehadiran
    });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [usersResult, absencesResult, leaveResult] = await Promise.all([
        getAllUsersCached(),
        getAllAbsencesCached(),
        getAllLeaveRequestsCached()
      ]);

      if ('success' in usersResult && usersResult.success) {
        // Users data processed in calculateStats
      }
      if ('success' in absencesResult && absencesResult.success) {
        const normalized: Absence[] = (absencesResult.data as Array<Absence | (Absence & { status: string })>).map((a) => ({
          ...a,
          status: a.status as Absence['status'],
        }))
        setAbsences(normalized);
      }
      if ('success' in leaveResult && leaveResult.success) {
        const normalizedLeaves: LeaveRequest[] = (leaveResult.data as Array<LeaveRequest | (LeaveRequest & { status: string })>).map((l) => ({
          ...l,
          status: l.status as LeaveRequest['status'],
        }))
        setLeaveRequests(normalizedLeaves);
      }

      calculateStats(
        ('success' in usersResult && usersResult.success) ? usersResult.data || [] : [],
        ('success' in absencesResult && absencesResult.success)
          ? ((absencesResult.data as Array<Absence | (Absence & { status: string })>).map((a) => ({
              ...a,
              status: a.status as Absence['status'],
            })) as Absence[])
          : [],
        ('success' in leaveResult && leaveResult.success)
          ? ((leaveResult.data as Array<LeaveRequest | (LeaveRequest & { status: string })>).map((l) => ({
              ...l,
              status: l.status as LeaveRequest['status'],
            })) as LeaveRequest[])
          : []
      );
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error refreshing data:", err);
      showErrorToast("Gagal refresh data", "Terjadi kesalahan saat memperbarui data");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatTimeDisplay = (time?: string | Date | null) => {
    if (!time) return "-";
    
    if (time instanceof Date) {
      const localTime = new Date(time.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      return localTime.toTimeString().slice(0, 5);
    } else if (typeof time === 'string') {
      return time;
    }
    
    return "-";
  };


  // Filter data for today
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const absensiHariIni = absences.filter((a) => {
    const absenceDate = new Date(a.date);
    const absenceDateString = absenceDate.toISOString().split('T')[0];
    return absenceDateString === todayString;
  });

  const recentAbsensi = absensiHariIni.slice(0, 5);
  const recentLeaveRequests = leaveRequests.filter(l => l.status === 'Pending').slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-lg font-medium">Memuat dashboard...</p>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Overview sistem manajemen absensi dan karyawan
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Terakhir diperbarui: {lastUpdated.toLocaleString('id-ID')}
            </p>
          )}
        </div>
        <Button onClick={refreshData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKaryawan}</div>
            <p className="text-xs text-muted-foreground">Seluruh karyawan aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hadirHariIni}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tingkatKehadiran.toFixed(1)}% kehadiran
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(stats.tingkatKehadiran, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.terlambatHariIni}</div>
            <p className="text-xs text-muted-foreground">Karyawan terlambat hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absenHariIni}</div>
            <p className="text-xs text-muted-foreground">Belum absen hari ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Izin</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingIzin}</div>
            <p className="text-xs text-muted-foreground">Menunggu persetujuan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Izin Disetujui</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedIzin}</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>


      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Absensi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Absensi Hari Ini
            </CardTitle>
            <CardDescription>Rekap absensi karyawan terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAbsensi.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada absensi hari ini</p>
                </div>
              ) : (
                recentAbsensi.map((item) => {
      const checkInTime = item.checkIn ? new Date(item.checkIn) : null;
      const isLate = checkInTime && (checkInTime.getHours() > 8 || (checkInTime.getHours() === 8 && checkInTime.getMinutes() > 15));
                  
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {item.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{item.user.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatTimeDisplay(item.checkIn)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isLate ? "secondary" : "default"}>
                        {isLate ? "Terlambat" : "Hadir"}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Permintaan Izin Pending
            </CardTitle>
            <CardDescription>Menunggu persetujuan admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeaveRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Tidak ada permintaan izin pending</p>
                </div>
              ) : (
                recentLeaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        {request.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{request.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {request.type} - {new Date(request.startDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Akses cepat ke fitur utama</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Data Karyawan</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Absensi</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <PieChart className="h-6 w-6" />
              <span className="text-sm">Laporan</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Clock className="h-6 w-6" />
              <span className="text-sm">Izin & Cuti</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
