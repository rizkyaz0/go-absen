"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";
import { logoutUser } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const result = await logoutUser();
      
      if ('success' in result && result.success) {
        toast.success("Berhasil logout", {
          description: "Anda telah berhasil keluar dari akun",
        });
        onClose();
        router.push("/login");
      } else {
        toast.error("Gagal logout", {
          description: 'error' in result ? result.error : "Terjadi kesalahan saat logout",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Gagal logout", {
        description: "Terjadi kesalahan saat logout",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleLogout}
      title="Konfirmasi Logout"
      description="Apakah Anda yakin ingin keluar dari akun ini?"
      confirmText="Logout"
      cancelText="Batal"
      variant="destructive"
      isLoading={isLoading}
      icon={<LogOut className="h-5 w-5" />}
    />
  );
}