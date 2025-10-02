"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButton } from "@/components/ActionButton";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Construction } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  statusId?: number;
  role?: { id: number; name: string };
  status?: { id: number; name: string };
  createdAt?: string;
}

export default function KaryawanPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/users");
      
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Remove static maps since we now get role/status from API

  // Navigasi ke halaman tambah karyawan
  const handleAdd = () => {
    router.push("/admin/dashboard/karyawan/tambah");
  };

  // Navigasi ke halaman edit karyawan
  const handleEdit = (id: number) => {
    router.push(`/admin/dashboard/karyawan/edit/${id}`);
  };

  // Buka modal hapus
  const handleDeleteClick = (id: number) => {
    setSelectedUserId(id);
    setDeleteModalOpen(true);
  };

  // Konfirmasi hapus
  const handleConfirmDelete = async () => {
    if (selectedUserId === null) return;

    try {
      const res = await fetch(`/api/users/${selectedUserId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menghapus karyawan");
      }

      // Refresh data after successful deletion
      await fetchUsers();
      setSelectedUserId(null);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert((error as Error).message);
    }
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
        <ActionButton variant="add" onClick={handleAdd} />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

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
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading employees...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada karyawan yang terdaftar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Bergabung</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role?.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status?.name === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status?.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('id-ID')
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="flex space-x-2">
                      <ActionButton
                        variant="edit"
                        onClick={() => handleEdit(user.id)}
                      />
                      <ActionButton
                        variant="delete"
                        onClick={() => handleDeleteClick(user.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal konfirmasi hapus */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
