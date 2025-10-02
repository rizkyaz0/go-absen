"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Construction } from "lucide-react";

interface Izin {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    roleId: number;
    statusId: number;
    role?: { name: string };
    status?: { name: string };
  };
  type: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason?: string;
  approvedBy?: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function IzinPage() {
  const [izinData, setIzinData] = useState<Izin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Fetch izin dari API
  const fetchIzin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = filter === "all" ? "/api/leave" : `/api/leave?status=${filter}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error('Failed to fetch leave requests');
      }
      
      const data: Izin[] = await res.json();
      setIzinData(data);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError('Failed to load leave requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIzin();
  }, [filter]);

  // Update status izin (Approve / Reject)
  const updateStatus = async (id: number, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch(`/api/leave/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status,
          approvedBy: 1 // TODO: Get from current user session
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal update status izin");
      }

      // Refresh data after update
      await fetchIzin();
    } catch (err) {
      console.error('Error updating leave status:', err);
      alert((err as Error).message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID');
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getDaysDifference = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Izin</h1>
        <p className="text-muted-foreground">
          Kelola permintaan izin dan cuti karyawan
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

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="font-medium">Filter Status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">Semua</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg border">
        {izinData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {filter === "all" 
                ? "Tidak ada permintaan izin" 
                : `Tidak ada permintaan izin dengan status ${filter}`
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Karyawan</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tipe Izin</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Tanggal Pengajuan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {izinData.map((izin) => (
                <TableRow key={izin.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{izin.user.name}</p>
                      <p className="text-sm text-gray-500">{izin.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {izin.user.role?.name || 'Employee'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{izin.type}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatDate(izin.startDate)}</p>
                      <p className="text-gray-500">s/d {formatDate(izin.endDate)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {getDaysDifference(izin.startDate, izin.endDate)} hari
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      izin.status === 'Approved' 
                        ? 'bg-green-100 text-green-800'
                        : izin.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {izin.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-xs truncate" title={izin.reason}>
                      {izin.reason || "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {formatDate(izin.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {izin.status === "Pending" ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(izin.id, "Approved")}
                          className="text-green-600 border-green-300 hover:bg-green-50"
                        >
                          Setujui
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(izin.id, "Rejected")}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Tolak
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        {izin.status === 'Approved' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
