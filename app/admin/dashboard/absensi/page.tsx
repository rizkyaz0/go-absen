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
import { Construction } from "lucide-react";
import { getAllAbsences } from "@/lib/actions";

interface Absence {
  id: number;
  user: { id: number; name: string };
  shiftId?: number | null;
  date: string; // format: YYYY-MM-DD
  checkIn?: string | null; // format: HH:MM:SS
  checkOut?: string | null; // format: HH:MM:SS
  status: "Hadir" | "Absen" | "Pulang";
  note?: string;
}

export default function AbsensiPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>(""); // yyyy-mm-dd

  useEffect(() => {
    async function fetchAbsences() {
      try {
        const result = await getAllAbsences();
        if (result.success) {
          setAbsences(result.data);
        }
      } catch (err) {
        console.error("Error fetching absences:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAbsences();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Format tanggal DD/MM/YYYY
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  // Format jam HH:MM:SS
  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return "-";
    return timeStr.slice(11, 19); // ambil jam:menit:detik
  };

  // Filter berdasarkan tanggal
  const filteredAbsences = filterDate
    ? absences.filter((a) => a.date.slice(0, 10) === filterDate)
    : absences;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Absensi</h2>
        <p className="text-muted-foreground">
          Kelola dan pantau absensi karyawan
        </p>
      </div>

      {/* Alert untuk fitur dalam pengembangan */}
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertDescription>
          Fitur ini sedang dalam pengembangan. Beberapa fungsi mungkin belum tersedia.
        </AlertDescription>
      </Alert>

      {/* Filter tanggal */}
      <div className="flex items-center gap-4">
        <label htmlFor="filterDate" className="font-medium">
          Filter Tanggal:
        </label>
        <input
          id="filterDate"
          type="date"
          className="border rounded p-2"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={() => setFilterDate("")}
        >
          Reset
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rekap Absensi</CardTitle>
          <CardDescription>
            Data lengkap absensi seluruh karyawan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAbsences.length === 0 ? (
            <p>Tidak ada data absensi.</p>
          ) : (
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Tanggal</th>
                  <th className="px-4 py-2 text-left">Check In</th>
                  <th className="px-4 py-2 text-left">Check Out</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsences.map((absence) => (
                  <tr key={absence.id} className="border-t">
                    <td className="px-4 py-2">{absence.user.name}</td>
                    <td className="px-4 py-2">{formatDate(absence.date)}</td>
                    <td className="px-4 py-2">{formatTime(absence.checkIn)}</td>
                    <td className="px-4 py-2">
                      {formatTime(absence.checkOut)}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={
                          absence.status === "Hadir"
                            ? "default"
                            : absence.status === "Pulang"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {absence.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">{absence.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
