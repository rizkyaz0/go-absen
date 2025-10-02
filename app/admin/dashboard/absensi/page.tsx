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

interface Absence {
  id: number;
  user: { 
    id: number; 
    name: string;
    role?: { name: string };
    status?: { name: string };
  };
  shiftId?: number | null;
  shift?: { name: string };
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  location?: string;
  note?: string;
}

export default function AbsensiPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const fetchAbsences = async (date?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = date 
        ? `/api/absences?date=${date}&limit=100`
        : `/api/absences?limit=100`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      
      const data: Absence[] = await res.json();
      setAbsences(data);
    } catch (err) {
      console.error('Error fetching absences:', err);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsences(filterDate);
  }, [filterDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  // Format tanggal DD/MM/YYYY
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID');
  };

  // Format jam HH:MM
  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return "-";
    return new Date(timeStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: string, checkIn?: string | null) => {
    if (!checkIn) return 'destructive'; // Absent
    
    if (checkIn) {
      const checkInTime = new Date(checkIn);
      const nineAM = new Date(checkInTime);
      nineAM.setHours(9, 0, 0, 0);
      
      if (checkInTime > nineAM) {
        return 'secondary'; // Late
      }
      return 'default'; // On time
    }
    
    return 'outline';
  };

  const getStatusLabel = (absence: Absence) => {
    if (!absence.checkIn) return 'Absen';
    
    const checkInTime = new Date(absence.checkIn);
    const nineAM = new Date(checkInTime);
    nineAM.setHours(9, 0, 0, 0);
    
    if (checkInTime > nineAM) {
      return 'Terlambat';
    }
    return 'Hadir';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Absensi</h2>
        <p className="text-muted-foreground">
          Kelola dan pantau absensi karyawan
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Filter tanggal */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
          <CardDescription>
            Pilih tanggal untuk melihat data absensi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label htmlFor="filterDate" className="font-medium">
              Tanggal:
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
              onClick={() => setFilterDate(new Date().toISOString().split('T')[0])}
            >
              Hari Ini
            </button>
            <button
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              onClick={() => setFilterDate("")}
            >
              Semua
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rekap Absensi</CardTitle>
          <CardDescription>
            Data lengkap absensi seluruh karyawan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {absences.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {filterDate 
                  ? `Tidak ada data absensi untuk tanggal ${formatDate(filterDate)}`
                  : "Tidak ada data absensi"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Nama</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                    <th className="px-4 py-3 text-left font-medium">Check In</th>
                    <th className="px-4 py-3 text-left font-medium">Check Out</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Lokasi</th>
                    <th className="px-4 py-3 text-left font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {absences.map((absence) => (
                    <tr key={absence.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{absence.user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {absence.user.role?.name || 'Employee'}
                      </td>
                      <td className="px-4 py-3">{formatDate(absence.date)}</td>
                      <td className="px-4 py-3">
                        <span className={absence.checkIn ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          {formatTime(absence.checkIn)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={absence.checkOut ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                          {formatTime(absence.checkOut)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(absence.status, absence.checkIn)}>
                          {getStatusLabel(absence)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {absence.location || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {absence.note || "-"}
                      </td>
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
