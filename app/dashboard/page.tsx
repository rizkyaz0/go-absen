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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 p-4 md:p-6">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4"
          >
            <span className="text-2xl">👋</span>
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Selamat Datang, {user.name}!
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Kelola absensi dan cuti Anda dengan mudah
          </p>
        </div>
      </motion.header>

      {/* Menu utama */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="max-w-4xl mx-auto mb-10"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 text-center">
            Aksi Cepat
          </h2>
          <div className="space-y-4 flex flex-col items-center">
            <AbsenButton />
            <CutiModal />
          </div>
        </div>
      </motion.div>

      {/* Statistik singkat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 text-center">
          Statistik Anda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </motion.div>
    </div>
  );
}
