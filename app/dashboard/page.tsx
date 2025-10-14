"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-center">
          Selamat Datang, {user.name} 👋
        </h1>
        <p className="text-gray-400 text-sm text-center">Dashboard Karyawan</p>
      </motion.header>

      {/* Menu utama */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-4 flex flex-col items-center"
      >
        <AbsenceButton />
        <CutiModal />
      </motion.div>

      {/* Statistik singkat */}
      <div className="flex justify-center mt-10">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-full max-w-4xl">
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

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
