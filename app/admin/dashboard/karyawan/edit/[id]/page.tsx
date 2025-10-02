"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notifications } from "@/lib/notifications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditKaryawanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState<number | undefined>();
  const [statusId, setStatusId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoadingData(true);
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error("Gagal mengambil data karyawan");
        const data = await res.json();
        setName(data.name);
        setRoleId(data.roleId);
        setStatusId(data.statusId);
      } catch (error) {
        notifications.error('Gagal memuat data karyawan', (error as Error).message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roleId, statusId }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui karyawan");

      notifications.success('Karyawan berhasil diperbarui', 'Data karyawan telah disimpan');
      router.push("/admin/dashboard/karyawan");
    } catch (error) {
      notifications.error('Gagal memperbarui karyawan', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <p>Loading data karyawan...</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Edit Karyawan</h2>

      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.push("/admin/dashboard/karyawan")}
      >
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Form Edit Karyawan</CardTitle>
          <CardDescription>Perbarui data karyawan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama karyawan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => setRoleId(Number(value))}
                value={roleId?.toString() || ""}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Project Manager</SelectItem>
                  <SelectItem value="2">Developer</SelectItem>
                  <SelectItem value="3">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setStatusId(Number(value))}
                value={statusId?.toString() || ""}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="2">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
