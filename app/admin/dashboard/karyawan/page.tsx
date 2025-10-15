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
// Table components reserved for future server-table refactor
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
// import { ActionButton } from "@/components/ActionButton";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX
} from "lucide-react";
import { getAllUsers, deleteUser } from "@/lib/actions";
import { showErrorToast, showUserDeletedToast, showSuccessToast } from "@/lib/toast-utils";
import { Toaster } from "@/components/ui/sonner";

interface User {
  id: number;
  name: string;
  email?: string;
  roleId?: number;
  statusId?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function KaryawanPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const result = await getAllUsers();
        if (result.success) {
          setUsers(result.data);
          setFilteredUsers(result.data);
          setLastUpdated(new Date());
          showSuccessToast("Data karyawan berhasil dimuat", `${result.data.length} karyawan ditemukan`);
        } else if ('error' in result) {
          showErrorToast("Gagal memuat data karyawan", result.error);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        showErrorToast("Terjadi kesalahan", "Gagal memuat data karyawan");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.roleId?.toString() === roleFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.statusId?.toString() === statusFilter);
    }

    // Search by name or email
    if (searchQuery) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, statusFilter, searchQuery]);

  const refreshData = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers();
      if (result.success) {
        setUsers(result.data);
        setLastUpdated(new Date());
        showSuccessToast("Data berhasil diperbarui", "Data karyawan telah di-refresh");
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      showErrorToast("Gagal refresh data", "Terjadi kesalahan saat memperbarui data");
    } finally {
      setLoading(false);
    }
  };

  // roleMap and statusMap are defined inline in helpers below

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
        showErrorToast("Gagal menghapus user", result.error);
        return;
      }

      // Hapus di UI setelah berhasil
      const deletedUser = users.find(user => user.id === selectedUserId);
      setUsers((prev) => prev.filter((user) => user.id !== selectedUserId));
      setSelectedUserId(null);
      setDeleteModalOpen(false);
      
      showUserDeletedToast(deletedUser?.name || "User");
    } catch (error) {
      showErrorToast("Gagal menghapus user", (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (roleId?: number) => {
    const roleMap: Record<number, { name: string; color: string }> = {
      1: { name: "Project Manager", color: "bg-blue-100 text-blue-800" },
      2: { name: "Developer", color: "bg-green-100 text-green-800" },
      3: { name: "Admin", color: "bg-purple-100 text-purple-800" },
    };
    
    if (!roleId || !roleMap[roleId]) {
      return <Badge variant="secondary">Unknown</Badge>;
    }
    
    return (
      <Badge className={roleMap[roleId].color}>
        {roleMap[roleId].name}
      </Badge>
    );
  };

  const getStatusBadge = (statusId?: number) => {
    if (statusId === 1) {
      return (
        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <UserCheck className="h-3 w-3" />
          Active
        </Badge>
      );
    } else if (statusId === 2) {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <UserX className="h-3 w-3" />
          Inactive
        </Badge>
      );
    }
    
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "-";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('id-ID');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-lg font-medium">Memuat data karyawan...</p>
          <p className="text-sm text-muted-foreground">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Karyawan</h2>
          <p className="text-muted-foreground">
            Kelola data seluruh karyawan perusahaan
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Terakhir diperbarui: {lastUpdated.toLocaleString('id-ID')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Karyawan</p>
                <p className="text-2xl font-bold">{filteredUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {filteredUsers.filter(u => u.statusId === 1).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Admin</p>
                <p className="text-2xl font-bold">
                  {filteredUsers.filter(u => u.roleId === 3).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">
                  {filteredUsers.filter(u => u.statusId === 2).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Karyawan</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Cari nama atau email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roleFilter">Filter Role</Label>
              <select
                id="roleFilter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Semua Role</option>
                <option value="1">Project Manager</option>
                <option value="2">Developer</option>
                <option value="3">Admin</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Filter Status</Label>
              <select
                id="statusFilter"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="1">Active</option>
                <option value="2">Inactive</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Reset Filter</Label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
              >
                Reset Semua
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
          <CardDescription>
            Daftar seluruh karyawan yang terdaftar dalam sistem ({filteredUsers.length} karyawan)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Tidak ada data karyawan</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || roleFilter !== "all" || statusFilter !== "all" 
                  ? "Tidak ada karyawan yang sesuai dengan filter yang dipilih"
                  : "Belum ada karyawan yang terdaftar dalam sistem"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Karyawan</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Bergabung</th>
                    <th className="text-left py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{user.email || "-"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getRoleBadge(user.roleId)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(user.statusId)}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => router.push(`/admin/dashboard/karyawan/detail/${user.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(user.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteClick(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal konfirmasi hapus */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        itemName={users.find(user => user.id === selectedUserId)?.name}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
