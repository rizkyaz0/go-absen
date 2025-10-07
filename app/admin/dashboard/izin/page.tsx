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
import { getAllLeaveRequests, updateLeaveRequestStatus } from "@/lib/actions";

interface Izin {
  id: number;
  user: {
    id: number;
    name: string;
    roleId: number;
    statusId: number;
  };
  type: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason?: string;
}

export default function IzinPage() {
  const [izinData,setIzinData] = useState<Izin[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch izin dari API
  useEffect(() => {
    const fetchIzin = async () => {
      try {
        const result = await getAllLeaveRequests();
        if (result.success) {
          setIzinData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIzin();
  }, []);

  // Update status izin (Approve / Reject)
  const updateStatus = async (id: number, status: "Approved" | "Rejected") => {
    try {
      const result = await updateLeaveRequestStatus(id, status);
      if (result.error) {
        alert("Gagal update status izin: " + result.error);
        return;
      }

      setIzinData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) return <p>Loading izin...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Daftar Izin</h1>
        <p className="text-muted-foreground">
          Kelola permintaan izin dan cuti karyawan
        </p>
      </div>

      {/* Alert untuk fitur dalam pengembangan */}
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertDescription>
          Fitur ini sedang dalam pengembangan. Beberapa fungsi mungkin belum tersedia.
        </AlertDescription>
      </Alert>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Tipe Izin</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Selesai</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Alasan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {izinData.map((izin) => (
            <TableRow key={izin.id}>
              <TableCell>{izin.user.name}</TableCell>
              <TableCell>{izin.type}</TableCell>
              <TableCell>
                {new Date(izin.startDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(izin.endDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{izin.status}</TableCell>
              <TableCell>{izin.reason || "-"}</TableCell>
              <TableCell className="flex space-x-2">
                {izin.status === "Pending" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(izin.id, "Approved")}
                    >
                      Setujui
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateStatus(izin.id, "Rejected")}
                    >
                      Tolak
                    </Button>
                  </>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
