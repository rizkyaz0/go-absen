"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface User {
  id: number;
  name: string;
  roleId?: number;
  statusId?: number;
}

export default function KaryawanPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  // Helper untuk mapping roleId & statusId
  const roleMap: Record<number, string> = {
    1: "Project Manager",
    2: "Developer",
    3: "Admin",
  };

  const statusMap: Record<number, string> = {
    1: "Active",
    2: "Inactive",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Card */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
          <CardDescription>
            Daftar seluruh karyawan yang terdaftar dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <p>Tidak ada karyawan.</p>
          ) : (
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nama</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-medium">{user.name}</td>
                    <td className="px-4 py-2">
                      {user.roleId ? roleMap[user.roleId] || "-" : "-"}
                    </td>
                    <td className="px-4 py-2">
                      {user.statusId ? statusMap[user.statusId] || "-" : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
