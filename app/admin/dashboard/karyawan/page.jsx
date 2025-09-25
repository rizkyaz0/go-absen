import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function KaryawanPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Karyawan</h2>
          <p className="text-muted-foreground">
            Kelola data seluruh karyawan perusahaan
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Karyawan
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
          <CardDescription>
            Daftar seluruh karyawan yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Konten data karyawan akan ditampilkan di sini...</p>
        </CardContent>
      </Card>
    </div>
  );
}