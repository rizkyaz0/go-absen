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
import { CheckCircle, XCircle, Clock, Users, Construction } from "lucide-react";

interface Absence {
  id: number;
  user: { id: number; name: string };
  shiftId?: number | null;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
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
    // Fetch users
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: User[]) => setUsers(data));

    // Fetch absences
    fetch("/api/absences")
      .then((res) => res.json())
      .then((data: Absence[]) => {
        setAbsences(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

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

  const getMinutesFromISO = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.getHours() * 60 + d.getMinutes();
  };

  // Filter absensi hanya untuk hari ini
  const absensiHariIni = absences.filter((a) => isToday(a.date));

  // Stats
  const totalKaryawan = users.length;

  const hadirHariIni = absensiHariIni.filter((a) => a.checkIn !== null).length;

  const terlambat = absensiHariIni.filter((a) => {
    if (!a.checkIn) return false;
    const menit = getMinutesFromISO(a.checkIn);
    return menit !== null && menit > 9 * 60; // lewat jam 9 pagi
  }).length;

  const absen = totalKaryawan - hadirHariIni;

  const recentAbsensi = absensiHariIni.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Info */}
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertDescription>
          Ringkasan kehadiran karyawan hari ini.
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
              const menit = getMinutesFromISO(item.checkIn);
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
                        {item.checkIn || "-"}
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
    </div>
  );
}
