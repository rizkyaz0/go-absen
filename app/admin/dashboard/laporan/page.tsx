'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { notifications } from "@/lib/notifications";
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
  XCircle,
  Loader2,
  Construction
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

interface SummaryData {
  totalHariKerja: number;
  rataRataKehadiran: number;
  totalTerlambat: number;
  izinDiterima: number;
  izinDitolak: number;
}

interface MonthlyData {
  bulan: string;
  hadir: number;
  terlambat: number;
  absen: number;
  izin: number;
}

interface LateEmployee {
  id: number;
  nama: string;
  jabatan: string;
  totalTerlambat: number;
  bulan: string;
}

interface DailyData {
  tanggal: string;
  hadir: number;
  terlambat: number;
  absen: number;
  izin: number;
}

export default function LaporanPage() {
  const [filterTanggal, setFilterTanggal] = useState({
    dari: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    hingga: new Date().toISOString().split('T')[0]
  });
  const [jenisLaporan, setJenisLaporan] = useState('bulanan');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [lateEmployees, setLateEmployees] = useState<LateEmployee[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);

  // Ref untuk print
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch data functions
  const fetchSummaryData = async () => {
    try {
      const response = await fetch(`/api/reports/summary?startDate=${filterTanggal.dari}&endDate=${filterTanggal.hingga}`);
      const data = await response.json();
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const year = new Date(filterTanggal.dari).getFullYear();
      const response = await fetch(`/api/reports/monthly?year=${year}`);
      const data = await response.json();
      setMonthlyData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setMonthlyData([]);
    }
  };

  const fetchLateEmployees = async () => {
    try {
      const response = await fetch(`/api/reports/late-employees?startDate=${filterTanggal.dari}&endDate=${filterTanggal.hingga}&limit=10`);
      const data = await response.json();
      setLateEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching late employees:', error);
      setLateEmployees([]);
    }
  };

  const fetchDailyData = async () => {
    try {
      const response = await fetch(`/api/reports/daily?startDate=${filterTanggal.dari}&endDate=${filterTanggal.hingga}&limit=7`);
      const data = await response.json();
      setDailyData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching daily data:', error);
      setDailyData([]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSummaryData(),
        fetchMonthlyData(),
        fetchLateEmployees(),
        fetchDailyData()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleFilter = async () => {
    await fetchAllData();
  };

  // Filter karyawan dengan safety check
  const filteredKaryawan = Array.isArray(lateEmployees) 
    ? lateEmployees.filter(karyawan =>
        karyawan.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        karyawan.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Export to PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`laporan-absensi-${new Date().toISOString().split('T')[0]}.pdf`);
      notifications.success('PDF berhasil diunduh', 'File laporan telah disimpan');
    } catch (error) {
      console.error('Error generating PDF:', error);
      notifications.error('Gagal membuat PDF', 'Silakan coba lagi atau hubungi admin');
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      // Data untuk Excel
      const excelData = {
        'Ringkasan': [
          ['Metrik', 'Nilai'],
          ['Total Hari Kerja', summaryData?.totalHariKerja || 0],
          ['Rata-rata Kehadiran (%)', summaryData?.rataRataKehadiran || 0],
          ['Total Terlambat', summaryData?.totalTerlambat || 0],
          ['Izin Diterima', summaryData?.izinDiterima || 0],
          ['Izin Ditolak', summaryData?.izinDitolak || 0]
        ],
        'Rekap Bulanan': [
          ['Bulan', 'Hadir', 'Terlambat', 'Absen', 'Izin', 'Persentase (%)'],
          ...monthlyData.map(item => [
            item.bulan,
            item.hadir,
            item.terlambat,
            item.absen,
            item.izin,
            item.hadir + item.absen + item.izin > 0 
              ? ((item.hadir / (item.hadir + item.absen + item.izin)) * 100).toFixed(1)
              : 0
          ])
        ],
        'Karyawan Terlambat': [
          ['Nama', 'Jabatan', 'Total Terlambat', 'Bulan'],
          ...filteredKaryawan.map(item => [
            item.nama,
            item.jabatan,
            item.totalTerlambat,
            item.bulan
          ])
        ],
        'Rekap Harian': [
          ['Tanggal', 'Hadir', 'Terlambat', 'Absen', 'Izin'],
          ...dailyData.map(item => [
            new Date(item.tanggal).toLocaleDateString('id-ID'),
            item.hadir,
            item.terlambat,
            item.absen,
            item.izin
          ])
        ]
      };

      const workbook = XLSX.utils.book_new();
      
      Object.keys(excelData).forEach(sheetName => {
        const worksheet = XLSX.utils.aoa_to_sheet(excelData[sheetName as keyof typeof excelData]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      XLSX.writeFile(workbook, `laporan-absensi-${new Date().toISOString().split('T')[0]}.xlsx`);
      notifications.success('Excel berhasil diunduh', 'File laporan telah disimpan');
    } catch (error) {
      console.error('Error generating Excel:', error);
      notifications.error('Gagal membuat Excel', 'Silakan coba lagi atau hubungi admin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Memuat data laporan...</span>
      </div>
    );
  }

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
          <Button variant="outline" onClick={handleExportPDF}>
            <Printer className="w-4 h-4 mr-2" />
            Print PDF
          </Button>
          <Button onClick={handleExportExcel}>
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

      {/* Content untuk print */}
      <div ref={printRef} className="space-y-6">
        {/* Summary Stats */}
        {summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hari Kerja</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.totalHariKerja}</div>
                <p className="text-xs text-muted-foreground">Periodik saat ini</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Hadir</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.rataRataKehadiran}%</div>
                <p className="text-xs text-muted-foreground">Kehadiran rata-rata</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Terlambat</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.totalTerlambat}</div>
                <p className="text-xs text-muted-foreground">Kasus keterlambatan</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Izin Diterima</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.izinDiterima}</div>
                <p className="text-xs text-muted-foreground">Izin disetujui</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Izin Ditolak</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.izinDitolak}</div>
                <p className="text-xs text-muted-foreground">Izin tidak disetujui</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rekap Bulanan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Rekap Bulanan
            </CardTitle>
            <CardDescription>
              Data absensi per bulan tahun {new Date(filterTanggal.dari).getFullYear()}
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
                  {monthlyData.map((item, index) => {
                    const total = item.hadir + item.absen + item.izin;
                    const persentase = total > 0 ? ((item.hadir / total) * 100).toFixed(1) : "0";
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
                          <Badge variant={parseFloat(persentase) >= 95 ? "default" : "outline"}>
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
              {dailyData.map((hari, index) => (
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
    </div>
  );
}
