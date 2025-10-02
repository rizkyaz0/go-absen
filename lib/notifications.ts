import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info, Clock } from "lucide-react";

export const notifications = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4" />,
      duration: 5000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertCircle className="h-4 w-4" />,
      duration: 4000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="h-4 w-4" />,
      duration: 3000,
    });
  },

  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
      icon: <Clock className="h-4 w-4" />,
    });
  },

  // Specialized notifications for common use cases
  attendance: {
    checkInSuccess: () => notifications.success(
      "Absen Masuk Berhasil! ✅", 
      "Selamat bekerja hari ini!"
    ),
    checkOutSuccess: () => notifications.success(
      "Absen Pulang Berhasil! ✅", 
      "Terima kasih atas kerja keras hari ini!"
    ),
    checkInError: () => notifications.error(
      "Absen Masuk Gagal ❌", 
      "Silakan coba lagi atau hubungi admin"
    ),
    checkOutError: () => notifications.error(
      "Absen Pulang Gagal ❌", 
      "Silakan coba lagi atau hubungi admin"
    ),
    tooEarly: (time: string) => notifications.warning(
      "Belum Waktunya Pulang ⏱️", 
      `Anda bisa absen pulang setelah jam ${time} WIB`
    ),
  },

  leave: {
    submitSuccess: () => notifications.success(
      "Pengajuan Cuti Berhasil! ✅", 
      "HRD akan meninjau pengajuan Anda"
    ),
    submitError: () => notifications.error(
      "Pengajuan Cuti Gagal ❌", 
      "Silakan periksa data dan coba lagi"
    ),
  },

  auth: {
    loginError: (message?: string) => notifications.error(
      "Login Gagal ❌", 
      message || "Email atau password salah"
    ),
    loginSuccess: () => notifications.success(
      "Login Berhasil! ✅", 
      "Selamat datang kembali!"
    ),
  },

  data: {
    saveSuccess: () => notifications.success(
      "Data Berhasil Disimpan! ✅"
    ),
    saveError: () => notifications.error(
      "Gagal Menyimpan Data ❌", 
      "Silakan coba lagi"
    ),
    deleteSuccess: () => notifications.success(
      "Data Berhasil Dihapus! ✅"
    ),
    deleteError: () => notifications.error(
      "Gagal Menghapus Data ❌", 
      "Silakan coba lagi"
    ),
  },
};