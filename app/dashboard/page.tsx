"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock, LogOut, BadgeCheck } from "lucide-react";
import AbsenceButton from "@/components/AbsenceButton";
import CutiModal from "@/components/CutiModal";
import StatCardServer from "@/components/StatCardServer";
import Loading from "./loading";
import { getCurrentUserCached, getAttendanceStatsCached, getUserLeaveStatsCached } from "@/lib/actions";
import { Toaster } from "@/components/ui/sonner";

export default function KaryawanDashboard() {
  const [user, setUser] = useState<{ id: number | null; name: string }>({ id: null, name: "" });

  useEffect(() => {
    async function fetchUser() {
      try {
        const result = await getCurrentUserCached();
        if ('error' in result) {
          console.error(result.error);
          return;
        }
        setUser({ id: result.id as number, name: result.name as string });
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  if (!user.id) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/80 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">Go-Absen</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="hidden sm:flex items-center gap-1"><MapPin className="w-4 h-4" /> Kantor Pusat</div>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> WIB</div>
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Hai, {user.name} 👋</h1>
                <p className="text-slate-300 text-xs sm:text-sm">Siap untuk hari yang produktif? Jangan lupa absen ya.</p>
              </div>
              <CalendarDays className="hidden sm:block w-10 h-10 text-slate-300" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="grid grid-cols-1 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Absensi</h2>
                <p className="text-xs text-slate-300">Tekan tombol untuk absen masuk/pulang</p>
              </div>
              <AbsenceButton />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Pengajuan Cuti/Izin</h2>
                <p className="text-xs text-slate-300">Ajukan izin atau cuti dengan cepat</p>
              </div>
              <CutiModal />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 mt-4 pb-16">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCardServer
            title="Kehadiran"
            icon={CalendarDays}
            subtitle="Bulan ini"
            serverAction={() => getAttendanceStatsCached(user.id || 0)}
            field="value"
          />
          <StatCardServer
            title="Sisa Cuti"
            icon={CalendarDays}
            subtitle="Bulan ini"
            serverAction={() => getUserLeaveStatsCached(user.id || 0)}
            field="remainingLeave"
          />
        </div>
      </div>

      {/* Toast */}
      <Toaster />
    </div>
  );
}
