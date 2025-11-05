"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Table components reserved for future server-table refactor
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X,
  FileText,
} from "lucide-react";
import {
  getAllLeaveRequests,
  updateLeaveRequestStatus,
  resetMonthlyLeaveQuota,
} from "@/lib/actions";
import {
  showErrorToast,
  showLeaveStatusUpdatedToast,
  showSuccessToast,
} from "@/lib/toast-utils";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Toaster } from "@/components/ui/sonner";

interface Izin {
  id: number;
  user: {
    id: number;
    name: string;
    roleId: number;
    statusId: number;
    email?: string;
  };
  type: string;
  startDate: string | Date;
  endDate: string | Date;
  status: "Pending" | "Approved" | "Rejected";
  reason?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function IzinPage() {
  const [izinData, setIzinData] = useState<Izin[]>([]);
  const [filteredIzin, setFilteredIzin] = useState<Izin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Fetch izin dari API
  useEffect(() => {
    const fetchIzin = async () => {
      try {
        setLoading(true);
        const result = await getAllLeaveRequests();
        if (result.success) {
          const normalized: Izin[] = (
            result.data as Array<
              Izin | (Izin & { startDate: Date; endDate: Date })
            >
          ).map((l) => ({
            ...l,
            startDate: l.startDate,
            endDate: l.endDate,
          }));
          setIzinData(normalized);
          setFilteredIzin(normalized);
          setLastUpdated(new Date());
        } else if ("error" in result) {
          showErrorToast("Gagal memuat data izin", result.error);
        }
      } catch (err) {
        console.error(err);
        showErrorToast("Terjadi kesalahan", "Gagal memuat data izin");
      } finally {
        setLoading(false);
      }
    };
    fetchIzin();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = izinData;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((izin) => izin.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((izin) => izin.type === typeFilter);
    }

    // Search by name
    if (searchQuery) {
      filtered = filtered.filter((izin) =>
        izin.user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredIzin(filtered);
  }, [izinData, statusFilter, typeFilter, searchQuery]);

  const refreshData = async () => {
    try {
      setLoading(true);
      const result = await getAllLeaveRequests();
      if (result.success) {
        const normalized: Izin[] = (
          result.data as Array<
            Izin | (Izin & { startDate: Date; endDate: Date })
          >
        ).map((l) => ({
          ...l,
          startDate: l.startDate,
          endDate: l.endDate,
        }));
        setIzinData(normalized);
        setLastUpdated(new Date());
        showSuccessToast(
          "Data berhasil diperbarui",
          "Data izin telah di-refresh"
        );
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      showErrorToast(
        "Gagal refresh data",
        "Terjadi kesalahan saat memperbarui data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update status izin (Approve / Reject)
  const updateStatus = async (id: number, status: "Approved" | "Rejected") => {
    try {
      const result = await updateLeaveRequestStatus(id, status);
      if (result.error) {
        showErrorToast("Gagal update status izin", result.error);
        return;
      }

      setIzinData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );

      showLeaveStatusUpdatedToast(status);
    } catch (err) {
      showErrorToast("Gagal update status izin", (err as Error).message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      Cuti: "bg-blue-100 text-blue-800",
      Izin: "bg-purple-100 text-purple-800",
      Sakit: "bg-orange-100 text-orange-800",
      Personal: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={typeColors[type] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  const formatDate = (date: string | Date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("id-ID");
  };

  const calculateDays = (startDate: string | Date, endDate: string | Date) => {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-lg font-medium">Memuat data izin...</p>
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
          <h2 className="text-3xl font-bold tracking-tight">
            Kelola Izin & Cuti
          </h2>
          <p className="text-muted-foreground">
            Kelola permintaan izin dan cuti karyawan
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Terakhir diperbarui: {lastUpdated.toLocaleString("id-ID")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refreshData} disabled={loading} variant="outline">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => setShowResetModal(true)} variant="destructive">
            Reset Jatah Cuti Bulanan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Permintaan
                </p>
                <p className="text-2xl font-bold">{filteredIzin.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">
                  {filteredIzin.filter((i) => i.status === "Pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Disetujui
                </p>
                <p className="text-2xl font-bold">
                  {filteredIzin.filter((i) => i.status === "Approved").length}
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
                <p className="text-sm font-medium text-muted-foreground">
                  Ditolak
                </p>
                <p className="text-2xl font-bold">
                  {filteredIzin.filter((i) => i.status === "Rejected").length}
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
              <Label htmlFor="search">Cari Karyawan</Label>
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
              <Label htmlFor="statusFilter">Filter Status</Label>
              <select
                id="statusFilter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeFilter">Filter Tipe</Label>
              <select
                id="typeFilter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Semua Tipe</option>
                <option value="Cuti">Cuti</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Reset Filter</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
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
          <CardTitle>Daftar Permintaan Izin</CardTitle>
          <CardDescription>
            Kelola permintaan izin dan cuti karyawan ({filteredIzin.length}{" "}
            permintaan)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIzin.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Tidak ada permintaan izin
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Tidak ada permintaan yang sesuai dengan filter yang dipilih"
                  : "Belum ada permintaan izin yang tersedia"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">
                      Karyawan
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Tipe Izin
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Periode</th>
                    <th className="text-left py-3 px-4 font-medium">Durasi</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Alasan</th>
                    <th className="text-left py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIzin.map((izin) => (
                    <tr
                      key={izin.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {izin.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{izin.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {izin.user.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getTypeBadge(izin.type)}</td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(izin.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(izin.endDate)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium">
                          {calculateDays(izin.startDate, izin.endDate)} hari
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(izin.status)}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground max-w-xs truncate">
                        {izin.reason || "-"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              (window.location.href = `/admin/dashboard/izin/${izin.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {izin.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatus(izin.id, "Approved")
                                }
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatus(izin.id, "Rejected")
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

      <ConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={async () => {
          try {
            setIsResetting(true);
            const result = await resetMonthlyLeaveQuota();
            if ("error" in result && result.error) {
              showErrorToast("Gagal reset jatah cuti", result.error);
              return;
            }
            showSuccessToast(
              "Berhasil",
              "Jatah cuti bulan berjalan telah di-reset"
            );
            await refreshData();
          } finally {
            setIsResetting(false);
            setShowResetModal(false);
          }
        }}
        title="Reset Jatah Cuti Bulanan"
        description="Tindakan ini akan mengaktifkan kembali jatah cuti untuk bulan berjalan tanpa menghapus data cuti sebelumnya. Lanjutkan?"
        confirmText={isResetting ? "Memproses..." : "Ya, Reset Sekarang"}
        cancelText="Batal"
        variant="destructive"
        isLoading={isResetting}
        type="warning"
      />
    </div>
  );
}
