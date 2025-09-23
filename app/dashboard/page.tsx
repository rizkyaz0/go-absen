"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import AbsenButton from "@/components/AbsenButton";
import CutiModal from "@/components/CutiModal";
import StatCard from "@/components/StatCard";

export default function KaryawanDashboard() {
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
          Selamat Datang, Rizky 👋
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
        <AbsenButton />
        <CutiModal />
      </motion.div>

      {/* Statistik singkat */}
      <div className="flex justify-center mt-10">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-full max-w-4xl">
          <StatCard
            title="Kehadiran"
            icon={CalendarDays}
            subtitle="Bulan ini"
            apiEndpoint="/api/stats/kehadiran"
            field="value"
          />

          <StatCard
            title="Sisa Cuti"
            icon={CalendarDays}
            subtitle="Bulan ini"
            apiEndpoint={`/api/stats/cuti?userId=4`}
            field="value"
          />

          {/* Bisa tambahkan lagi misalnya: */}
          {/* <StatCard title="Cuti" icon={Calendar} value="1" subtitle="Bulan ini" /> */}
        </div>
      </div>
    </div>
  );
}
