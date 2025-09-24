'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Download, 
  Filter, 
  Printer, 
  Search, 
  BarChart3, 
  PieChart,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

// Data dummy untuk laporan
const laporanData = {
  summary: {
    totalHariKerja: 22,
    rataRataKehadiran: 95.2,
    totalTerlambat: 45,
    izinDiterima: 18,
    izinDitolak: 3
  },
  rekapBulanan: [
    { bulan: 'Jan 2024', hadir: 2400, terlambat: 45, absen: 12, izin: 8 },
    { bulan: 'Feb 2024', hadir: 2350, terlambat: 38, absen: 15, izin: 12 },
    { bulan: 'Mar 2024', hadir: 2420, terlambat: 42, absen: 8, izin: 5 },
    { bulan: 'Apr 2024', hadir: 2380, terlambat: 51, absen: 10, izin: 9 },
  ],
  karyawanTerlambat: [
    { id: 1, nama: "Ahmad Santoso", jabatan: "Developer", totalTerlambat: 8, bulan: "April 2024" },
    { id: 2, nama: "Siti Rahayu", jabatan: "Designer", totalTerlambat: 6, bulan: "April 2024" },
    { id: 3, nama: "Budi Prasetyo", jabatan: "Manager", totalTerlambat: 5, bulan: "April 2024" },
    { id: 4, nama: "Maya Indah", jabatan: "QA", totalTerlambat: 4, bulan: "April 2024" },
  ],
  rekapHarian: [
    { tanggal: '2024-04-01', hadir: 98, terlambat: 5, absen: 2, izin: 1 },
    { tanggal: '2024-04-02', hadir: 97, terlambat: 8, absen: 3, izin: 0 },
    { tanggal: '2024-04-03', hadir: 99, terlambat: 3, absen: 1, izin: 2 },
    { tanggal: '2024-04-04', hadir: 96, terlambat: 7, absen: 4, izin: 1 },
  ]
};

export default function LaporanPage() {
  const [filterTanggal, setFilterTanggal] = useState({
    dari: '2024-04-01',
    hingga: new Date().toISOString().split('T')[0]
  });
  const [jenisLaporan, setJenisLaporan] = useState('bulanan');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExport = (format) => {
    console.log(`Export laporan dalam format ${format}`);
    // Logic untuk export laporan
    alert(`Fitur export ${format} akan diimplementasikan!`);
  };

  const handleFilter = () => {
    console.log('Filter applied:', { jenisLaporan, filterTanggal, searchQuery });
    // Logic untuk filter data
    alert('Filter diterapkan!');
  };

  const filteredKaryawan = laporanData.karyawanTerlambat.filter(karyawan =>
    karyawan.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    karyawan.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Absensi</h2>
          <p className="text-muted-foreground">
            Analisis dan monitoring data absensi karyawan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="jenis-laporan">Jenis Laporan</Label>
              <select 
                id="jenis-laporan"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={jenisLaporan}
                onChange={(e) => setJenisLaporan(e.target.value)}
              >
                <option value="harian">Harian</option>
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
                <option value="tahunan">Tahunan</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dari-tanggal">Dari Tanggal</Label>
              <Input 
                id="dari-tanggal"
                type="date" 
                value={filterTanggal.dari}
                onChange={(e) => setFilterTanggal({...filterTanggal, dari: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hingga-tanggal">Hingga Tanggal</Label>
              <Input 
                id="hingga-tanggal"
                type="date" 
                value={filterTanggal.hingga}
                onChange={(e) => setFilterTanggal({...filterTanggal, hingga: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search">Cari Karyawan</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                  id="search"
                  placeholder="Cari nama atau jabatan..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Button onClick={handleFilter} className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Terapkan Filter
          </Button>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Kerja</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laporanData.summary.totalHariKerja}</div>
            <p className="text-xs text-muted-foreground">Periodik saat ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Hadir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laporanData.summary.rataRataKehadiran}%</div>
            <p className="text-xs text-muted-foreground">Kehadiran rata-rata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Terlambat</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laporanData.summary.totalTerlambat}</div>
            <p className="text-xs text-muted-foreground">Kasus keterlambatan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Izin Diterima</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laporanData.summary.izinDiterima}</div>
            <p className="text-xs text-muted-foreground">Izin disetujui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Izin Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laporanData.summary.izinDitolak}</div>
            <p className="text-xs text-muted-foreground">Izin tidak disetujui</p>
          </CardContent>
        </Card>
      </div>

      {/* Rekap Bulanan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Rekap Bulanan
          </CardTitle>
          <CardDescription>
            Data absensi per bulan tahun 2024
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Bulan</th>
                  <th className="text-right py-3 px-4">Hadir</th>
                  <th className="text-right py-3 px-4">Terlambat</th>
                  <th className="text-right py-3 px-4">Absen</th>
                  <th className="text-right py-3 px-4">Izin</th>
                  <th className="text-right py-3 px-4">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {laporanData.rekapBulanan.map((item, index) => {
                  const total = item.hadir + item.absen + item.izin;
                  const persentase = total > 0 ? ((item.hadir / total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.bulan}</td>
                      <td className="text-right py-3 px-4">{item.hadir.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">
                        <Badge variant={item.terlambat > 40 ? "destructive" : "secondary"}>
                          {item.terlambat}
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4">{item.absen}</td>
                      <td className="text-right py-3 px-4">{item.izin}</td>
                      <td className="text-right py-3 px-4 font-medium">
                        <Badge variant={persentase >= 95 ? "default" : "outline"}>
                          {persentase}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Karyawan Sering Terlambat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Karyawan dengan Keterlambatan Tertinggi
          </CardTitle>
          <CardDescription>
            Top 10 karyawan dengan jumlah keterlambatan terbanyak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredKaryawan.map((karyawan) => (
              <div key={karyawan.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {karyawan.nama.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{karyawan.nama}</p>
                    <p className="text-sm text-gray-500">{karyawan.jabatan}</p>
                    <p className="text-xs text-gray-400">{karyawan.bulan}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    {karyawan.totalTerlambat} kali
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">total terlambat</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rekap Harian */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Rekap Harian Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {laporanData.rekapHarian.map((hari, index) => (
              <Card key={index} className="text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {new Date(hari.tanggal).toLocaleDateString('id-ID', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hadir:</span>
                    <Badge variant="default">{hari.hadir}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Terlambat:</span>
                    <Badge variant="secondary">{hari.terlambat}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Absen:</span>
                    <Badge variant="outline">{hari.absen}</Badge>
                  </div>
                  {hari.izin > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Izin:</span>
                      <Badge variant="outline">{hari.izin}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}