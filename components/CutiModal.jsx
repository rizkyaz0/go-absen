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
import { notifications } from "@/lib/notifications";

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
      notifications.error("User belum terdeteksi", "Silakan login ulang");
      return;
    }

    const loadingToast = notifications.loading("Mengirim pengajuan cuti...");

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

      notifications.leave.submitSuccess();
      setTanggalMulai("");
      setTanggalAkhir("");
      setAlasan("");
      window.location.reload();
    } catch (err) {
      console.error(err);
      notifications.leave.submitError();
    } finally {
      // Dismiss loading toast
      if (loadingToast) {
        setTimeout(() => {
          // The loading toast will be automatically dismissed when success/error shows
        }, 100);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full py-4 px-8 border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-300 hover:scale-105 rounded-xl font-semibold"
        >
          <Home className="mr-3" size={20} /> 
          Ajukan Cuti/Izin
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-[90%] max-w-md border-0">
        <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          📝 Form Pengajuan Cuti
        </DialogTitle>
        <DialogDescription className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Isi formulir di bawah ini untuk mengajukan cuti. HRD akan meninjau pengajuan Anda.
        </DialogDescription>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 w-full"
        >
          <div className="space-y-2">
            <Label htmlFor="mulai" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tanggal Mulai Cuti
            </Label>
            <Input
              id="mulai"
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="akhir" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tanggal Akhir Cuti
            </Label>
            <Input
              id="akhir"
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alasan" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Alasan Cuti
            </Label>
            <Textarea
              id="alasan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Jelaskan alasan pengajuan cuti Anda..."
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px] resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            📤 Kirim Pengajuan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
