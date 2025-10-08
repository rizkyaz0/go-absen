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
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Construction } from "lucide-react";
import { getAllAbsencesCached } from "@/lib/actions";
import { toZonedTime, format } from 'date-fns-tz';

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
        const result = await getAllAbsencesCached();
        if ('success' in result && result.success) {
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

  // Safe date formatter with timezone support - handles Date, string, number, null, undefined
  const formatDate = (date?: string | Date | number | null) => {
    if (!date) return "-";
    const d = date instanceof Date ? date : new Date(date as string | number);
    if (Number.isNaN(d.getTime())) return "-";
    
    // Convert UTC date to Asia/Jakarta timezone for display
    const localDate = toZonedTime(d, 'Asia/Jakarta');
    const day = String(localDate.getDate()).padStart(2, "0");
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const year = localDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Safe time formatter with timezone support - handles Date, string, null, undefined
  const formatTime = (time?: string | Date | null) => {
    if (!time) return "-";
    const d = time instanceof Date ? time : new Date(time);
    if (Number.isNaN(d.getTime())) return "-";
    
    // Convert UTC time to Asia/Jakarta timezone for display
    const localTime = toZonedTime(d, 'Asia/Jakarta');
    return format(localTime, 'HH:mm:ss', { timeZone: 'Asia/Jakarta' });
  };

  // Filter berdasarkan tanggal - safe date comparison with timezone
  const filteredAbsences = filterDate
    ? absences.filter((a) => {
        const absenceDate = new Date(a.date);
        const localAbsenceDate = toZonedTime(absenceDate, 'Asia/Jakarta');
        const absenceDateString = format(localAbsenceDate, 'yyyy-MM-dd', { timeZone: 'Asia/Jakarta' });
        return absenceDateString === filterDate;
      })
    : absences;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Absensi</h2>
        <p className="text-muted-foreground">
          Kelola dan pantau absensi karyawan
        </p>
      </div>

      {/* Feature is now fully functional */}

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
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada data absensi untuk tanggal yang dipilih.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Nama</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Check In</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Check Out</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAbsences.map((absence) => (
                    <tr key={absence.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{absence.user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatDate(absence.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatTime(absence.checkIn)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {formatTime(absence.checkOut)}
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{absence.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
