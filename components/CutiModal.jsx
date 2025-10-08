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
import { getCurrentUserCached, createLeaveRequest, getUserLeaveStatsCached } from "@/lib/actions";

export default function CutiModal() {
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalAkhir, setTanggalAkhir] = useState("");
  const [alasan, setAlasan] = useState("");
  const [userId, setUserId] = useState(null);
  const [remainingLeave, setRemainingLeave] = useState(2);

  // Ambil userId dari login dan sisa cuti
  useEffect(() => {
    async function fetchUser() {
      try {
        const result = await getCurrentUserCached();
        if ('error' in result) {
          console.error(result.error);
          return;
        }
        setUserId(result.id);
        
        // Ambil sisa cuti
        const leaveStats = await getUserLeaveStatsCached(result.id);
        if ('success' in leaveStats && leaveStats.success) {
          setRemainingLeave(leaveStats.data.remainingLeave);
        }
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

    // Validasi tanggal
    if (tanggalAkhir < tanggalMulai) {
      alert("❌ Tanggal akhir tidak boleh lebih awal dari tanggal mulai");
      return;
    }

    // Hitung berapa hari cuti yang diminta
    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalAkhir);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const requestedDays = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

    // Validasi sisa cuti
    if (requestedDays > remainingLeave) {
      alert(`❌ Sisa cuti tidak mencukupi. Sisa cuti: ${remainingLeave} hari, yang diminta: ${requestedDays} hari`);
      return;
    }

    try {
      const result = await createLeaveRequest({
        userId,
        startDate: tanggalMulai,
        endDate: tanggalAkhir,
        type: "Cuti",
        reason: alasan,
      });

      if (result.error) {
        alert("❌ Gagal ajukan cuti: " + result.error);
        return;
      }

      alert("✅ Pengajuan cuti berhasil!");
      setTanggalMulai("");
      setTanggalAkhir("");
      setAlasan("");
      window.location.reload();
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
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Sisa cuti bulan ini:</strong> {remainingLeave} hari
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-w-sm mx-auto w-full"
        >
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
