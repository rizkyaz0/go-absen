"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft } from "lucide-react";
import { getUserById, getAbsencesByUserCached } from "@/lib/actions";
import { showErrorToast } from "@/lib/toast-utils";
import { Toaster } from "@/components/ui/sonner";

interface User {
  id: number;
  name: string;
  roleId: number;
  statusId: number;
}

interface Absence {
  id: number;
  date: string | Date;
  checkIn?: string | Date | null;
  checkOut?: string | Date | null;
  status: string;
  note?: string;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [user, setUser] = useState<User | null>(null);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const u = await getUserById(id);
        if ('error' in (u as { error?: string })) {
          showErrorToast("Gagal memuat data karyawan", (u as { error?: string }).error);
        } else {
          setUser((u as { data: User }).data);
        }
        const a = await getAbsencesByUserCached(id);
        if ("success" in a && a.success) setAbsences(a.data as Absence[]);
      } catch (err) {
        showErrorToast("Terjadi kesalahan", (err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getRoleBadge = (roleId?: number) => {
    const roleMap: Record<number, { name: string; color: string }> = {
      1: { name: "Project Manager", color: "bg-blue-100 text-blue-800" },
      2: { name: "Developer", color: "bg-green-100 text-green-800" },
      3: { name: "Admin", color: "bg-purple-100 text-purple-800" },
    };
    if (!roleId || !roleMap[roleId]) return <Badge variant="secondary">Unknown</Badge>;
    return <Badge className={roleMap[roleId].color}>{roleMap[roleId].name}</Badge>;
  };

  const getStatusBadge = (statusId?: number) => {
    if (statusId === 1) return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    if (statusId === 2) return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
    return <Badge variant="secondary">Unknown</Badge>;
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Memuat...</div>;
  }

  if (!user) {
    return <div className="text-sm text-muted-foreground">Data karyawan tidak ditemukan</div>;
  }

  const recent = absences.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Karyawan</h2>
          <p className="text-muted-foreground">Informasi profil dan riwayat absensi</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/dashboard/karyawan")}> 
          <ChevronLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>ID: {user.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {getRoleBadge(user.roleId)}
            {getStatusBadge(user.statusId)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi Terbaru</CardTitle>
          <CardDescription>10 aktivitas terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">Belum ada data absensi</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium">Check In</th>
                    <th className="text-left py-3 px-4 font-medium">Check Out</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(a.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID') : '-'}</td>
                      <td className="py-3 px-4">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID') : '-'}</td>
                      <td className="py-3 px-4">{a.status}</td>
                      <td className="py-3 px-4">{a.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
