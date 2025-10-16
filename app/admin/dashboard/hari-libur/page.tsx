"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/sonner";
import { Calendar, Trash2, Plus } from "lucide-react";
import { getHolidays, createHoliday, deleteHoliday } from "@/lib/actions";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";

interface Holiday {
  id: number;
  date: string | Date;
  name: string;
  isHalfDay: boolean;
}

export default function HolidayPage() {
  const [items, setItems] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getHolidays();
      if ("success" in res && res.success) {
        setItems(res.data as Holiday[]);
      } else if ('error' in (res as { error?: string })) {
        showErrorToast("Gagal memuat hari libur", (res as { error?: string }).error);
      }
      setLoading(false);
    })();
  }, []);

  const addHoliday = async () => {
    if (!date || !name) {
      showErrorToast("Tanggal/Nama wajib diisi");
      return;
    }
    const res = await createHoliday({ date, name, isHalfDay });
    if ('error' in (res as { error?: string })) {
      showErrorToast("Gagal menambah hari libur", (res as { error?: string }).error);
      return;
    }
    showSuccessToast("Hari libur ditambahkan");
    setDate("");
    setName("");
    setIsHalfDay(false);
    const refreshed = await getHolidays();
    if ("success" in refreshed && refreshed.success) setItems(refreshed.data as Holiday[]);
  };

  const removeHoliday = async (id: number) => {
    const res = await deleteHoliday(id);
    if ('error' in (res as { error?: string })) {
      showErrorToast("Gagal menghapus hari libur", (res as { error?: string }).error);
      return;
    }
    showSuccessToast("Hari libur dihapus");
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hari Libur</h2>
          <p className="text-muted-foreground">Tetapkan tanggal merah untuk menghitung hari kerja</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Tambah Hari Libur</CardTitle>
          <CardDescription>Masukkan tanggal, nama, dan opsi setengah hari</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" placeholder="Contoh: Libur Nasional" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="half" checked={isHalfDay} onCheckedChange={(c) => setIsHalfDay(!!c)} />
                <Label htmlFor="half">Setengah hari</Label>
              </div>
              <Button onClick={addHoliday} className="ml-auto"><Plus className="h-4 w-4 mr-2" /> Tambah</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Hari Libur</CardTitle>
          <CardDescription>Semua tanggal merah yang aktif</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Memuat...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">Belum ada hari libur</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium">Nama</th>
                    <th className="text-left py-3 px-4 font-medium">Tipe</th>
                    <th className="text-left py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((h) => (
                    <tr key={h.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{new Date(h.date).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4">{h.name}</td>
                      <td className="py-3 px-4">{h.isHalfDay ? 'Setengah hari' : 'Sehari penuh'}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => removeHoliday(h.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
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
