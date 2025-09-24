'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";

// Data dummy - nanti diganti dengan API calls
const dashboardData = {
  stats: {
    totalKaryawan: 125,
    hadirHariIni: 98,
    terlambat: 12,
    absen: 15
  },
  recentAbsensi: [
    { id: 1, nama: "Ahmad Santoso", waktu: "08:00", status: "hadir" },
    { id: 2, nama: "Siti Rahayu", waktu: "08:15", status: "terlambat" },
    { id: 3, nama: "Budi Prasetyo", waktu: "-", status: "absen" },
    { id: 4, nama: "Maya Indah", waktu: "07:55", status: "hadir" },
  ]
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.totalKaryawan}</div>
            <p className="text-xs text-muted-foreground">Seluruh karyawan terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.hadirHariIni}</div>
            <p className="text-xs text-muted-foreground">
              {((dashboardData.stats.hadirHariIni / dashboardData.stats.totalKaryawan) * 100).toFixed(1)}% kehadiran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.terlambat}</div>
            <p className="text-xs text-muted-foreground">Karyawan terlambat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stats.absen}</div>
            <p className="text-xs text-muted-foreground">Belum absen hari ini</p>
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
            {dashboardData.recentAbsensi.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{item.nama}</p>
                    <p className="text-sm text-gray-500">{item.waktu}</p>
                  </div>
                </div>
                <Badge 
                  variant={item.status === 'hadir' ? 'default' : 
                          item.status === 'terlambat' ? 'secondary' : 'destructive'}
                >
                  {item.status === 'hadir' ? 'Hadir' : 
                   item.status === 'terlambat' ? 'Terlambat' : 'Absen'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}