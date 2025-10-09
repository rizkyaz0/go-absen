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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Users, Construction } from "lucide-react";
import { getAllUsersCached, getAllAbsencesCached } from "@/lib/actions";
import { showErrorToast, showDataLoadedToast } from "@/lib/toast-utils";
import { Toaster } from "@/components/ui/sonner";

interface Absence {
  id: number;
  user: { id: number; name: string };
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
  statusI?: number;
}

export default function AdminDashboard() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // Fetch users and absences in parallel
        const [usersResult, absencesResult] = await Promise.all([
          getAllUsersCached(),
          getAllAbsencesCached()
        ]);

        if (isMounted) {
          if ('success' in usersResult && usersResult.success) {
            setUsers(usersResult.data);
            showDataLoadedToast("Karyawan", usersResult.data.length);
          } else if ('error' in usersResult) {
            showErrorToast("Gagal memuat data karyawan", usersResult.error);
          }
          
          if ('success' in absencesResult && absencesResult.success) {
            setAbsences(absencesResult.data);
            showDataLoadedToast("Absensi", absencesResult.data.length);
          } else if ('error' in absencesResult) {
            showErrorToast("Gagal memuat data absensi", absencesResult.error);
          }
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

  if (loading) return <div>Loading...</div>;

  // Helpers
  const isToday = (date?: string | Date | null) => {
    if (!date) return false;
    const d = date instanceof Date ? date : new Date(date);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const getMinutes = (time?: string | Date | null) => {
    if (!time) return null;
    
    let timeString: string;
    if (time instanceof Date) {
      // Convert Date to Asia/Jakarta timezone and format as HH:mm
      const localTime = new Date(time.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      timeString = localTime.toTimeString().slice(0, 5); // Get HH:mm part
    } else if (typeof time === 'string') {
      timeString = time;
    } else {
      return null;
    }
    
    const [h, m] = timeString.split(":").map(Number);
    return h * 60 + m;
  };

  const formatTimeDisplay = (time?: string | Date | null) => {
    if (!time) return "-";
    
    if (time instanceof Date) {
      // Convert Date to Asia/Jakarta timezone and format as HH:mm
      const localTime = new Date(time.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      return localTime.toTimeString().slice(0, 5); // Get HH:mm part
    } else if (typeof time === 'string') {
      return time;
    }
    
    return "-";
  };

  // Filter absensi hanya untuk hari ini
  const absensiHariIni = absences.filter((a) => isToday(a.date));

  // Stats
  const totalKaryawan = users.length;

  const hadirHariIni = absensiHariIni.filter((a) => a.checkIn !== null).length;

  // const terlambat = absensiHariIni.filter((a) => {
  //   if (!a.checkIn) return false;
  //   const menit = getMinutes(a.checkIn);
  //   return menit !== null && menit > 9 * 60; // lewat jam 9 pagi
  // }).length;

  const absen = totalKaryawan - hadirHariIni;

  const recentAbsensi = absensiHariIni.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Alert untuk status pengembangan */}
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertDescription>
          Dashboard admin sedang dalam pengembangan. Fitur laporan sudah tersedia dan dapat digunakan.
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Karyawan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKaryawan}</div>
            <p className="text-xs text-muted-foreground">Seluruh karyawan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hadir Hari Ini
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hadirHariIni}</div>
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
            <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absen}</div>
            <p className="text-xs text-muted-foreground">
              Belum absen hari ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Absensi */}
      <Card>
        <CardHeader>
          <CardTitle>Absensi Hari Ini</CardTitle>
          <CardDescription>Rekap absensi karyawan terbaru</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAbsensi.map((item) => {
              const menit = getMinutes(item.checkIn);
              let statusLabel: "Hadir" | "Terlambat" | "Absen" | "Pulang" =
                "Absen";
              let variant: "default" | "secondary" | "destructive" =
                "destructive";

              if (item.checkIn) {
                if (menit !== null && menit > 9 * 60) {
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
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">{item.user.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatTimeDisplay(item.checkIn)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={variant}>{statusLabel}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
