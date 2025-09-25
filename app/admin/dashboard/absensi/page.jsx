import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AbsensiPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Data Absensi</h2>
        <p className="text-muted-foreground">
          Kelola dan pantau absensi karyawan
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Rekap Absensi</CardTitle>
          <CardDescription>
            Data lengkap absensi seluruh karyawan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten absensi akan ditampilkan di sini...</p>
        </CardContent>
      </Card>
    </div>
  );
}