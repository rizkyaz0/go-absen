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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { getAllAbsencesCached, deleteAbsence } from "@/lib/actions";
import { toZonedTime, format } from 'date-fns-tz';
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { Toaster } from "@/components/ui/sonner";

interface Absence {
  id: number;
  user: { 
    id: number; 
    name: string; 
    roleId?: number; 
    statusId?: number;
    email?: string;
  };
  shiftId?: number | null;
  date: string | Date;
  checkIn?: string | Date | null;
  checkOut?: string | Date | null;
  status: "Hadir" | "Absen" | "Pulang";
  note?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function AbsensiPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [filteredAbsences, setFilteredAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>(""); // yyyy-mm-dd
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchAbsences() {
      try {
        setLoading(true);
        const result = await getAllAbsencesCached();
        if ('success' in result && result.success) {
          const normalized: Absence[] = (result.data as Array<{
            id: number;
            user: Absence['user'];
            shiftId?: number | null;
            date: string | Date;
            checkIn?: string | Date | null;
            checkOut?: string | Date | null;
            status: string;
            note?: string | null;
            createdAt?: string | Date;
            updatedAt?: string | Date;
          }>).map((a) => ({
            id: a.id,
            user: a.user,
            shiftId: a.shiftId ?? null,
            date: a.date,
            checkIn: a.checkIn ?? null,
            checkOut: a.checkOut ?? null,
            status: (a.status as string) as Absence['status'],
            note: a.note ?? undefined,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          }))
          setAbsences(normalized);
          setFilteredAbsences(normalized);
          setLastUpdated(new Date());
          showSuccessToast("Data absensi berhasil dimuat", `${result.data.length} record ditemukan`);
        } else if ('error' in result) {
          showErrorToast("Gagal memuat data absensi", result.error);
        }
      } catch (err) {
        console.error("Error fetching absences:", err);
        showErrorToast("Terjadi kesalahan", "Gagal memuat data absensi");
      } finally {
        setLoading(false);
      }
    }

    fetchAbsences();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = absences;

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter((a) => {
        const absenceDate = new Date(a.date);
        const absenceDateString = absenceDate.toISOString().split('T')[0];
        return absenceDateString === filterDate;
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Search by name
    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAbsences(filtered);
  }, [absences, filterDate, statusFilter, searchQuery]);

  const refreshData = async () => {
    try {
      setLoading(true);
      const result = await getAllAbsencesCached();
      if ('success' in result && result.success) {
        const normalized: Absence[] = (result.data as Array<{
          id: number;
          user: Absence['user'];
          shiftId?: number | null;
          date: string | Date;
          checkIn?: string | Date | null;
          checkOut?: string | Date | null;
          status: string;
          note?: string | null;
          createdAt?: string | Date;
          updatedAt?: string | Date;
        }>).map((a) => ({
          id: a.id,
          user: a.user,
          shiftId: a.shiftId ?? null,
          date: a.date,
          checkIn: a.checkIn ?? null,
          checkOut: a.checkOut ?? null,
          status: (a.status as string) as Absence['status'],
          note: a.note ?? undefined,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        }))
        setAbsences(normalized);
        setLastUpdated(new Date());
        showSuccessToast("Data berhasil diperbarui", "Data absensi telah di-refresh");
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      showErrorToast("Gagal refresh data", "Terjadi kesalahan saat memperbarui data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAbsence = async (id: number) => {
    try {
      const result = await deleteAbsence(id);
      if (result.error) {
        showErrorToast("Gagal menghapus absensi", result.error);
        return;
      }

      setAbsences(prev => prev.filter(a => a.id !== id));
      showSuccessToast("Absensi berhasil dihapus", "Data absensi telah dihapus");
    } catch (err) {
      console.error("Error deleting absence:", err);
      showErrorToast("Gagal menghapus absensi", "Terjadi kesalahan saat menghapus data");
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Nama', 'Tanggal', 'Check In', 'Check Out', 'Status', 'Catatan'],
      ...filteredAbsences.map(absence => [
        absence.user.name,
        formatDate(absence.date),
        formatTime(absence.checkIn),
        formatTime(absence.checkOut),
        absence.status,
        absence.note || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `absensi-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccessToast("Export berhasil", "File CSV telah didownload");
  };

  // Safe date formatter with timezone support
  const formatDate = (date?: string | Date | number | null) => {
    if (!date) return "-";
    const d = date instanceof Date ? date : new Date(date as string | number);
    if (Number.isNaN(d.getTime())) return "-";
    
    const localDate = toZonedTime(d, 'Asia/Jakarta');
    const day = String(localDate.getDate()).padStart(2, "0");
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const year = localDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Safe time formatter with timezone support
  const formatTime = (time?: string | Date | null) => {
    if (!time) return "-";
    const d = time instanceof Date ? time : new Date(time);
    if (Number.isNaN(d.getTime())) return "-";
    
    const localTime = toZonedTime(d, 'Asia/Jakarta');
    return format(localTime, 'HH:mm:ss', { timeZone: 'Asia/Jakarta' });
  };

  const getStatusBadge = (status: string, checkIn?: string | Date | null) => {
    const checkInTime = checkIn ? new Date(checkIn) : null;
    const isLate = checkInTime && checkInTime.getHours() > 8;
    
    switch (status) {
      case "Hadir":
        return (
          <Badge variant={isLate ? "secondary" : "default"} className="flex items-center gap-1">
            {isLate ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
            {isLate ? "Terlambat" : "Hadir"}
          </Badge>
        );
      case "Pulang":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pulang
          </Badge>
        );
      case "Absen":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Absen
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const getRoleName = (roleId?: number) => {
    const roleMap: Record<number, string> = {
      1: "Project Manager",
      2: "Developer", 
      3: "Admin",
    };
    return roleId ? roleMap[roleId] || "Unknown" : "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-lg font-medium">Memuat data absensi...</p>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Absensi</h2>
          <p className="text-muted-foreground">
            Kelola dan pantau absensi karyawan
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Terakhir diperbarui: {lastUpdated.toLocaleString('id-ID')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Absensi</p>
                <p className="text-2xl font-bold">{filteredAbsences.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Hadir</p>
                <p className="text-2xl font-bold">
                  {filteredAbsences.filter(a => a.status === 'Hadir').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Terlambat</p>
                <p className="text-2xl font-bold">
                  {filteredAbsences.filter(a => {
                    if (!a.checkIn) return false;
                    const checkInTime = new Date(a.checkIn);
                    return checkInTime.getHours() > 8;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Absen</p>
                <p className="text-2xl font-bold">
                  {filteredAbsences.filter(a => a.status === 'Absen').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Nama</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Cari nama karyawan..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterDate">Filter Tanggal</Label>
              <Input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Filter Status</Label>
              <select
                id="statusFilter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="Hadir">Hadir</option>
                <option value="Pulang">Pulang</option>
                <option value="Absen">Absen</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Reset Filter</Label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setFilterDate("");
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Reset Semua
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rekap Absensi</CardTitle>
          <CardDescription>
            Data lengkap absensi seluruh karyawan ({filteredAbsences.length} record)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAbsences.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Tidak ada data absensi</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterDate || statusFilter !== "all" 
                  ? "Tidak ada data yang sesuai dengan filter yang dipilih"
                  : "Belum ada data absensi yang tersedia"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Karyawan</th>
                    <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium">Check In</th>
                    <th className="text-left py-3 px-4 font-medium">Check Out</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Catatan</th>
                    <th className="text-left py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAbsences.map((absence) => (
                    <tr key={absence.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {absence.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{absence.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {getRoleName(absence.user.roleId)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{formatDate(absence.date)}</td>
                      <td className="py-4 px-4 text-sm font-mono">{formatTime(absence.checkIn)}</td>
                      <td className="py-4 px-4 text-sm font-mono">{formatTime(absence.checkOut)}</td>
                      <td className="py-4 px-4">
                        {getStatusBadge(absence.status, absence.checkIn)}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground max-w-xs truncate">
                        {absence.note || "-"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteAbsence(absence.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
