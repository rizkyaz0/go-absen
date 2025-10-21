"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, User, FileText } from "lucide-react";
import { getAllLeaveRequests } from "@/lib/actions";
import { showErrorToast } from "@/lib/toast-utils";
import { Toaster } from "@/components/ui/sonner";

interface IzinDetail {
  id: number;
  user: { id: number; name: string };
  type: string;
  startDate: string | Date;
  endDate: string | Date;
  status: "Pending" | "Approved" | "Rejected";
  reason?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function IzinDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [izin, setIzin] = useState<IzinDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getAllLeaveRequests();
        if ('error' in res) {
          showErrorToast("Gagal memuat izin", res.error);
        } else {
          const found = (res.data as IzinDetail[]).find(i => i.id === id) || null;
          setIzin(found);
        }
      } catch (err) {
        showErrorToast("Terjadi kesalahan", (err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-sm text-muted-foreground">Memuat...</div>;
  if (!izin) return <div className="text-sm text-muted-foreground">Data izin tidak ditemukan</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Izin</h2>
          <p className="text-muted-foreground">Alasan dan periode izin karyawan</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/dashboard/izin")}> 
          <ChevronLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> {izin.user.name}</CardTitle>
          <CardDescription>ID Izin: {izin.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Tipe</div>
              <div className="font-medium">{izin.type}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div>
                {izin.status === 'Pending' && <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>}
                {izin.status === 'Approved' && <Badge className="bg-green-100 text-green-800">Approved</Badge>}
                {izin.status === 'Rejected' && <Badge className="bg-red-100 text-red-800">Rejected</Badge>}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Periode</div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />
                {new Date(izin.startDate).toLocaleDateString('id-ID')} - {new Date(izin.endDate).toLocaleDateString('id-ID')}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" /> Alasan</div>
              <div className="font-medium">{izin.reason || '-'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
