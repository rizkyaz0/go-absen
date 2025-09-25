"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import AbsenButton from "@/components/AbsenButton";
import CutiModal from "@/components/CutiModal";
import StatCard from "@/components/StatCard";
import Loading from "./loading";

export default function KaryawanDashboard() {
  const [user, setUser] = useState({ id: null, name: "" });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Gagal ambil user");
        const data = await res.json();
        setUser(data);
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
            apiEndpoint={`/api/stats/kehadiran?userId=${user.id}`}
            field="value"
          />

          <StatCard
            title="Sisa Cuti"
            icon={CalendarDays}
            subtitle="Bulan ini"
            apiEndpoint={`/api/stats/cuti?userId=${user.id}`}
            field="value"
          />
        </div>
      </div>
    </div>
  );
}
