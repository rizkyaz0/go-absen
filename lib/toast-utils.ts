import { toast } from "sonner";

// Toast utility functions untuk konsistensi di seluruh aplikasi

export const showSuccessToast = (title: string, description?: string, duration = 4000) => {
  toast.success(title, {
    description,
    duration,
    style: {
      backgroundColor: "rgba(34, 197, 94, 0.95)",
      color: "hsl(355, 7%, 97%)",
      border: "none",
      backdropFilter: "blur(8px)",
    },
  });
};

export const showErrorToast = (title: string, description?: string, duration = 6000) => {
  toast.error(title, {
    description,
    duration,
    style: {
      backgroundColor: "rgba(239, 68, 68, 0.95)",
      color: "hsl(355, 7%, 97%)",
      border: "none",
      backdropFilter: "blur(8px)",
    },
  });
};

export const showWarningToast = (title: string, description?: string, duration = 5000) => {
  toast.warning(title, {
    description,
    duration,
    style: {
      backgroundColor: "rgba(245, 158, 11, 0.95)",
      color: "hsl(355, 7%, 97%)",
      border: "none",
      backdropFilter: "blur(8px)",
    },
  });
};

export const showInfoToast = (title: string, description?: string, duration = 4000) => {
  toast.info(title, {
    description,
    duration,
    style: {
      backgroundColor: "rgba(59, 130, 246, 0.95)",
      color: "hsl(355, 7%, 97%)",
      border: "none",
      backdropFilter: "blur(8px)",
    },
  });
};

// Specific toast functions untuk operasi umum
export const showUserAddedToast = (userName: string) => {
  showSuccessToast("✅ Karyawan Berhasil Ditambahkan", `Data ${userName} telah disimpan ke sistem`, 5000);
};

export const showUserUpdatedToast = (userName: string) => {
  showSuccessToast("✅ Karyawan Berhasil Diperbarui", `Data ${userName} telah diupdate`, 5000);
};

export const showUserDeletedToast = (userName: string) => {
  showSuccessToast("🗑️ Karyawan Berhasil Dihapus", `Data ${userName} telah dihapus dari sistem`, 5000);
};

export const showAbsenceCheckInToast = (time: string) => {
  showSuccessToast("✅ Absen Masuk Berhasil", `Selamat datang! Waktu masuk: ${time}`, 5000);
};

export const showAbsenceCheckOutToast = (time: string) => {
  showSuccessToast("✅ Absen Keluar Berhasil", `Terima kasih! Waktu pulang: ${time}`, 5000);
};

export const showLeaveRequestToast = () => {
  showSuccessToast("✅ Pengajuan Cuti Berhasil", "Permintaan cuti Anda telah diajukan", 5000);
};

export const showLeaveStatusUpdatedToast = (status: string) => {
  const statusText = status === 'Approved' ? 'disetujui' : 'ditolak';
  showSuccessToast("✅ Status Izin Diperbarui", `Izin telah ${statusText}`, 5000);
};

export const showDataLoadedToast = (dataType: string, count: number) => {
  showInfoToast(`📊 Data ${dataType} Dimuat`, `${count} ${dataType.toLowerCase()} ditemukan`, 3000);
};

export const showExportSuccessToast = (format: string) => {
  showSuccessToast(`📄 Export ${format.toUpperCase()} Berhasil`, `File ${format.toLowerCase()} telah dibuat`, 4000);
};

export const showExportErrorToast = (format: string) => {
  showErrorToast(`❌ Export ${format.toUpperCase()} Gagal`, `Gagal membuat file ${format.toLowerCase()}`, 6000);
};