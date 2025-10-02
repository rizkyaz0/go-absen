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
import { CheckCircle, XCircle, Clock, Users, TrendingUp, Calendar, UserCheck, UserX } from "lucide-react";

interface Absence {
  id: number;
  user: { 
    id: number; 
    name: string;
    role?: { name: string };
    status?: { name: string };
  };
  shiftId?: number | null;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  note?: string;
}

interface User {
  id: number;
  name: string;
  email?: string;
  roleId?: number;
  statusId?: number;
  role?: { name: string };
  status?: { name: string };
}

interface LeaveRequest {
  id: number;
  user: { name: string };
  type: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function AdminDashboard() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [usersRes, absencesRes, leaveRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/absences?limit=50"),
          fetch("/api/leave?limit=10")
        ]);

        if (!usersRes.ok || !absencesRes.ok || !leaveRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [usersData, absencesData, leaveData] = await Promise.all([
          usersRes.json(),
          absencesRes.json(),
          leaveRes.json()
        ]);

        setUsers(usersData);
        setAbsences(absencesData);
        setLeaveRequests(leaveData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Helpers
  const isToday = (dateStr: string) => {
    const today = new Date();
    const d = new Date(dateStr);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const getCheckInTime = (checkIn?: string | null) => {
    if (!checkIn) return null;
    const time = new Date(checkIn);
    return time.getHours() * 60 + time.getMinutes();
  };

  // Filter data for today
  const absensiHariIni = absences.filter((a) => isToday(a.date));
  const activeUsers = users.filter(u => u.status?.name === 'Active');

  // Calculate statistics
  const totalKaryawan = activeUsers.length;
  const hadirHariIni = absensiHariIni.filter((a) => a.checkIn !== null).length;
  
  const terlambat = absensiHariIni.filter((a) => {
    if (!a.checkIn) return false;
    const checkInMinutes = getCheckInTime(a.checkIn);
    return checkInMinutes !== null && checkInMinutes > 9 * 60; // After 9:00 AM
  }).length;

  const absen = Math.max(0, totalKaryawan - hadirHariIni);
  
  // Leave request statistics
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending').length;
  const approvedLeaves = leaveRequests.filter(l => l.status === 'Approved').length;

  // Recent activity
  const recentAbsensi = absensiHariIni.slice(0, 5);
  const recentLeaves = leaveRequests.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Ringkasan aktivitas dan statistik karyawan hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Karyawan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKaryawan}</div>
            <p className="text-xs text-muted-foreground">Karyawan aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hadir Hari Ini
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{hadirHariIni}</div>
            <p className="text-xs text-muted-foreground">
              {totalKaryawan > 0
                ? ((hadirHariIni / totalKaryawan) * 100).toFixed(1)
                : 0}
              % kehadiran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{terlambat}</div>
            <p className="text-xs text-muted-foreground">
              Datang terlambat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absen}</div>
            <p className="text-xs text-muted-foreground">
              Belum absen hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Izin Pending</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu persetujuan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Absensi Hari Ini</CardTitle>
            <CardDescription>Aktivitas check-in karyawan terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAbsensi.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Belum ada absensi hari ini
                </p>
              ) : (
                recentAbsensi.map((item) => {
                  const checkInMinutes = getCheckInTime(item.checkIn);
                  let statusLabel = "Absen";
                  let variant: "default" | "secondary" | "destructive" = "destructive";

                  if (item.checkIn) {
                    if (checkInMinutes !== null && checkInMinutes > 9 * 60) {
                      statusLabel = "Terlambat";
                      variant = "secondary";
                    } else {
                      statusLabel = "Hadir";
                      variant = "default";
                    }
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {item.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{item.user.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.user.role?.name || 'Employee'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.checkIn ? new Date(item.checkIn).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : '-'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={variant}>{statusLabel}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Permintaan Izin Terbaru</CardTitle>
            <CardDescription>Izin yang perlu ditinjau</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeaves.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Tidak ada permintaan izin
                </p>
              ) : (
                recentLeaves.map((leave) => {
                  const statusVariant = 
                    leave.status === 'Approved' ? 'default' :
                    leave.status === 'Rejected' ? 'destructive' : 'secondary';

                  return (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {leave.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{leave.user.name}</p>
                          <p className="text-sm text-gray-500">{leave.type}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(leave.startDate).toLocaleDateString('id-ID')} - {new Date(leave.endDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusVariant}>{leave.status}</Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
