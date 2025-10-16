"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, easeOut } from "framer-motion";
import {
  Clock,
  ShieldCheck,
  Workflow,
  Users,
  Github,
  LogIn,
  Layers,
  Zap,
  Cloud,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.7,
      ease: easeOut,
    },
  }),
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-[#0a0f1f] via-[#111827] to-[#1e293b] text-white relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10rem] right-[-10rem] w-[30rem] h-[30rem] bg-blue-600/30 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-8rem] left-[-10rem] w-[25rem] h-[25rem] bg-purple-600/20 blur-[150px] rounded-full animate-pulse"></div>
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="fixed top-0 left-0 w-full z-50 bg-[#0a0f1f]/60 backdrop-blur-xl border-b border-white/10 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-400" />
            <span className="font-bold text-xl tracking-wide">Go-Absen</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#fitur"
              className="text-slate-300 hover:text-blue-400 transition font-medium"
            >
              Fitur
            </a>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white transition"
                asChild
              >
                <a href="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 px-8 py-32 md:py-48">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="max-w-xl"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Absen Online Canggih
            </span>
            <br />
            Untuk Era Digital Modern
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8">
            Go-Absen hadir dengan teknologi real-time, keamanan tinggi, dan
            integrasi cepat untuk menunjang produktivitas perusahaan modern.
          </p>

          <div className="flex gap-4">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Button className="text-lg px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition shadow-lg" asChild>
                <a href="/dashboard">Mulai Sekarang</a>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }}>
              <Button
                variant="outline"
                className="text-lg px-6 py-3 border-slate-300 text-slate-900 hover:bg-slate-200 hover:text-[#1e293b] transition"
                asChild
              >
                <a href="#fitur">Lihat Fitur</a>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Animated Illustration Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: easeOut }}
          className="relative w-full max-w-sm p-10 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-2xl text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <Users className="w-16 h-16 text-blue-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Absensi Real-Time</h3>
            <p className="text-slate-300">
              Data absensi otomatis tersinkronisasi tanpa ribet.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section
        id="fitur"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-24 px-8 border-t border-white/10 bg-gradient-to-b from-[#111827] to-[#0a0f1f]"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
          Fitur Unggulan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />,
              title: "Realtime Monitoring",
              desc: "Pantau absensi karyawan secara langsung dengan sistem sinkronisasi cepat.",
            },
            {
              icon: <Workflow className="w-12 h-12 text-purple-400 mx-auto mb-4" />,
              title: "Integrasi Mudah",
              desc: "Hubungkan sistem absensi dengan API atau platform internal dengan cepat.",
            },
            {
              icon: <ShieldCheck className="w-12 h-12 text-green-400 mx-auto mb-4" />,
              title: "Keamanan Data",
              desc: "Seluruh data absensi terenkripsi dan dijamin privasinya. privasi terjaga",
            },
            {
              icon: <Cloud className="w-12 h-12 text-cyan-400 mx-auto mb-4" />,
              title: "Berbasis Cloud",
              desc: "Akses data kapan pun dan di mana pun tanpa perlu server lokal.",
            },
            {
              icon: <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />,
              title: "Cepat & Efisien",
              desc: "Waktu absensi berkurang hingga 70% dengan sistem otomatis.",
            },
            {
              icon: <Users className="w-12 h-12 text-pink-400 mx-auto mb-4" />,
              title: "Multi-Level User",
              desc: "Kelola peran pengguna: admin, karyawan, dan HR dengan mudah.",
            },
          ].map((f, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(59,130,246,0.2)" }}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={sectionVariants}
            >
              <Card className="bg-white/5 border border-white/10 text-center backdrop-blur-md shadow-lg p-8 hover:border-blue-500/50 transition-all">
                {f.icon}
                <h3 className="text-xl font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-slate-300">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

     {/* ✅ Modern & Clean Footer Layout */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easeOut }}
        className="relative z-10 bg-gradient-to-b from-[#0a0f1f] to-[#111827] border-t border-white/10 text-slate-300"
      >
        <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-7 h-7 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Go-Absen</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Platform absensi modern berbasis cloud dengan keamanan tinggi dan teknologi real-time.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" className="hover:text-blue-400 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" className="hover:text-blue-400 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" className="hover:text-pink-400 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://github.com/rizkyaz0/go-absen" className="hover:text-slate-100 transition">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="#fitur" className="hover:text-blue-400 transition">Fitur</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition">Login</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Dukungan</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><a href="/faq" className="hover:text-blue-400 transition">FAQ</a></li>
              <li><a href="/help" className="hover:text-blue-400 transition">Pusat Bantuan</a></li>
              <li><a href="/terms" className="hover:text-blue-400 transition">Syarat & Ketentuan</a></li>
              <li><a href="/privacy" className="hover:text-blue-400 transition">Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak Kami</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" /> Bandung, Indonesia
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" /> +62 812 3456 7890
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" /> support@goabsen.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} <span className="text-slate-300 font-medium">Go-Absen</span>. Dibuat dengan 💙 oleh Tim Go-Absen.
        </div>
      </motion.footer>

    </div>
  );
}
