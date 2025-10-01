// app/admin/dashboard/izin/page.tsx
"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Izin {
  id: number;
  nama: string;
  tipe: "Cuti" | "Izin Tidak Hadir";
  tanggalMulai: string;
  tanggalSelesai: string;
  status: "Pending" | "Disetujui" | "Ditolak";
}

const izinDataInitial: Izin[] = [
  {
    id: 1,
    nama: "Budi",
    tipe: "Cuti",
    tanggalMulai: "2025-10-10",
    tanggalSelesai: "2025-10-15",
    status: "Pending",
  },
  {
    id: 2,
    nama: "Sari",
    tipe: "Izin Tidak Hadir",
    tanggalMulai: "2025-10-05",
    tanggalSelesai: "2025-10-05",
    status: "Pending",
  },
  // Add more dummy data or fetch from API
];

export default function IzinPage() {
  const [izinData, setIzinData] = useState(izinDataInitial);

  const handleApprove = (id: number) => {
    setIzinData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Disetujui" } : item
      )
    );
  };

  const handleReject = (id: number) => {
    setIzinData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Ditolak" } : item
      )
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Daftar Izin</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Tipe Izin</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Selesai</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {izinData.map((izin) => (
            <TableRow key={izin.id}>
              <TableCell>{izin.nama}</TableCell>
              <TableCell>{izin.tipe}</TableCell>
              <TableCell>{izin.tanggalMulai}</TableCell>
              <TableCell>{izin.tanggalSelesai}</TableCell>
              <TableCell>{izin.status}</TableCell>
              <TableCell className="flex space-x-2">
                {izin.status === "Pending" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(izin.id)}
                    >
                      Setujui
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(izin.id)}
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