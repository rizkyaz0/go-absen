"use client";

import { useState, useEffect } from "react";
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
import { Home } from "lucide-react";

export default function CutiModal() {
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [alasan, setAlasan] = useState("");
  const [userId, setUserId] = useState(null);

  // Ambil userId dari login
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Gagal ambil user");
        const data = await res.json();
        setUserId(data.id);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("❌ User belum terdeteksi");
      return;
    }

    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          startDate: tanggalMulai,
          endDate: tanggalAkhir,
          type: "Cuti",
          status: "Pending",
          reason: alasan,
        }),
      });

      if (!res.ok) throw new Error("Gagal ajukan cuti");

      alert("✅ Pengajuan cuti berhasil!");
      setTanggalMulai("");
      setTanggalAkhir("");
      setAlasan("");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal ajukan cuti");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full py-6 border-white/20 text-white bg-dark hover:bg-gray-700 sm:w-auto flex items-center justify-center"
        >
          <Home className="mr-2" size={18} /> Ajukan Cuti/Izin
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white text-black rounded-lg p-6 shadow-xl w-[90%] max-w-md">
        <DialogTitle className="text-lg font-semibold">
          Form Pengajuan Cuti
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500 mb-4">
          Isi tanggal dan alasan cuti. HRD akan meninjau pengajuan.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="mulai">Tanggal Mulai</Label>
            <Input
              id="mulai"
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="akhir">Tanggal Akhir</Label>
            <Input
              id="akhir"
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              required
            />
          </div>

          <div>
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
            className="w-full py-3 bg-green-600 text-white hover:bg-green-700 transition"
          >
            Kirim Pengajuan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
