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
import { getAllUsers, deleteUser } from "@/lib/actions";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  roleId?: number;
  statusId?: number;
}

export default function KaryawanPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await getAllUsers();
        if (result.success) {
          setUsers(result.data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const roleMap: Record<number, string> = {
    1: "Project Manager",
    2: "Developer",
    3: "Admin",
  };

  const statusMap: Record<number, string> = {
    1: "Active",
    2: "Inactive",
  };

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
      setIsDeleting(true);
      const result = await deleteUser(selectedUserId);
      
      if (result.error) {
        toast.error("Gagal menghapus user", {
          description: result.error,
        });
        return;
      }

      // Hapus di UI setelah berhasil
      setUsers((prev) => prev.filter((user) => user.id !== selectedUserId));
      setSelectedUserId(null);
      setDeleteModalOpen(false);
      
      toast.success("User berhasil dihapus", {
        description: "Data karyawan telah dihapus dari sistem",
      });
    } catch (error) {
      toast.error("Gagal menghapus user", {
        description: (error as Error).message,
      });
    } finally {
      setIsDeleting(false);
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

      {/* Alert untuk fitur dalam pengembangan */}
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertDescription>
          Fitur ini sedang dalam pengembangan. Beberapa fungsi mungkin belum tersedia.
        </AlertDescription>
      </Alert>

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      {user.roleId ? roleMap[user.roleId] || "-" : "-"}
                    </TableCell>
                    <TableCell>
                      {user.statusId ? statusMap[user.statusId] || "-" : "-"}
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
        isLoading={isDeleting}
      />
    </div>
  );
}
