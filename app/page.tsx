"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  Calendar, 
  BarChart3, 
  Shield, 
  Smartphone,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const features = [
    {
      icon: Clock,
      title: "Absensi Real-time",
      description: "Sistem absensi yang akurat dengan tracking waktu real-time dan lokasi",
      color: "text-blue-500"
    },
    {
      icon: Users,
      title: "Manajemen Karyawan",
      description: "Kelola data karyawan dengan mudah dan efisien",
      color: "text-green-500"
    },
    {
      icon: Calendar,
      title: "Pengajuan Cuti",
      description: "Sistem pengajuan cuti yang terintegrasi dengan approval workflow",
      color: "text-purple-500"
    },
    {
      icon: BarChart3,
      title: "Laporan Lengkap",
      description: "Dashboard analitik dan laporan kehadiran yang komprehensif",
      color: "text-orange-500"
    },
    {
      icon: Shield,
      title: "Keamanan Terjamin",
      description: "Data terlindungi dengan sistem keamanan tingkat enterprise",
      color: "text-red-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Akses dari mana saja dengan tampilan yang responsif",
      color: "text-indigo-500"
    }
  ];

  const benefits = [
    "Mengurangi kesalahan manual dalam pencatatan absensi",
    "Meningkatkan produktivitas tim HR",
    "Transparansi data kehadiran untuk semua pihak",
    "Otomatisasi proses administrasi karyawan",
    "Laporan real-time untuk pengambilan keputusan"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              go-Absen
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Mulai Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Sistem Absensi Modern
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
            Kelola Absensi Karyawan dengan{" "}
            <span className="text-blue-600 dark:text-blue-400">Mudah</span> dan{" "}
            <span className="text-purple-600 dark:text-purple-400">Efisien</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Platform absensi digital yang membantu perusahaan mengelola kehadiran karyawan 
            dengan fitur lengkap dan antarmuka yang user-friendly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-lg">
                Coba Gratis Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Lihat Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Fitur Lengkap untuk Kebutuhan Anda
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola absensi karyawan dalam satu platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Mengapa Memilih go-Absen?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Dengan teknologi terdepan dan desain yang intuitif, go-Absen membantu 
                perusahaan mengoptimalkan manajemen kehadiran karyawan.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="p-8 shadow-2xl border-0">
                <div className="text-center space-y-6">
                  <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Dashboard Analitik</h3>
                    <p className="text-muted-foreground">
                      Pantau performa kehadiran tim dengan visualisasi data yang jelas dan actionable insights
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">98%</div>
                      <div className="text-sm text-muted-foreground">Akurasi</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">24/7</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">1000+</div>
                      <div className="text-sm text-muted-foreground">Perusahaan</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Meningkatkan Efisiensi Tim Anda?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Bergabunglah dengan ribuan perusahaan yang telah mempercayai go-Absen 
            untuk mengelola kehadiran karyawan mereka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-lg">
                Mulai Sekarang - Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                go-Absen
              </span>
            </div>
            <p className="text-muted-foreground text-center">
              © 2024 go-Absen. Semua hak dilindungi. Dibuat dengan ❤️ untuk efisiensi kerja yang lebih baik.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
