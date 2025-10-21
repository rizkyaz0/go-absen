"use client";

import { Trash2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  isLoading?: boolean;
  itemName?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini?",
  isLoading = false,
  itemName,
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  const finalDescription = itemName 
    ? `Apakah Anda yakin ingin menghapus "${itemName}"? Tindakan ini tidak dapat dibatalkan.`
    : description;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={title}
      description={finalDescription}
      confirmText="Hapus"
      cancelText="Batal"
      variant="destructive"
      isLoading={isLoading}
      type="delete"
      icon={<Trash2 className="h-5 w-5" />}
    />
  );
}