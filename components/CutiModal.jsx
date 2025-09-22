"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Home } from "lucide-react"; // ✅ tambahkan ini

export default function CutiModal() {
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [alasan, setAlasan] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      tanggalMulai,
      tanggalAkhir,
      alasan,
    });

    alert("✅ Pengajuan cuti berhasil diajukan!");

    setTanggalMulai("");
    setTanggalAkhir("");
    setAlasan("");
  };

  return (
    <Dialog>
      {/* Tombol */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full py-6 border-white/20 text-white bg-dark hover:bg-gray-300 cursor-pointer sm:w-auto sm:px-6 sm:py-3"
        >
          <Home className="mr-2" size={18} /> Ajukan Cuti/Izin
        </Button>
      </DialogTrigger>

      {/* Konten modal */}
      <DialogContent className="bg-white text-black rounded-lg p-6 shadow-xl w-[90%] max-w-md">
        <DialogTitle className="text-lg font-semibold">
          Form Pengajuan Cuti
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500 mb-4">
          Isi tanggal dan alasan cuti. HRD akan meninjau pengajuan.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="mulai">Tanggal Mulai</Label>
            <Input
              id="mulai"
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="akhir">Tanggal Akhir</Label>
            <Input
              id="akhir"
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="alasan">Alasan</Label>
            <Textarea
              id="alasan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Tulis alasan cuti..."
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 bg-green-600 text-white font-semibold"
          >
            Kirim Pengajuan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
