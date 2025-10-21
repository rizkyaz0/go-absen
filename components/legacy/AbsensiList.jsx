"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Home } from "lucide-react";

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
        <h1 className="text-2xl font-bold">Selamat Datang, Rizky 👋</h1>
        <p className="text-gray-400 text-sm">Dashboard Karyawan</p>
      </motion.header>

      {/* Statistik singkat */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarDays size={16} /> Kehadiran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">20/22</p>
            <p className="text-xs text-gray-400">Bulan ini</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock size={16} /> Telat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
            <p className="text-xs text-gray-400">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu utama */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-4"
      >
        <Button
          className="w-full py-6 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-lg shadow-lg"
        >
          Absen Masuk
        </Button>
        <Button
          className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-400 text-white text-lg shadow-lg"
        >
          Absen Pulang
        </Button>
        <Button
          variant="outline"
          className="w-full py-6 border-white/20 text-white hover:bg-white/10"
        >
          <Home className="mr-2" size={18} /> Ajukan Cuti/Izin
        </Button>
      </motion.div>
    </div>
  );
}
