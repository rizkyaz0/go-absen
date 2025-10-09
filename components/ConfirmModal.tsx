"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  isLoading?: boolean;
  icon?: React.ReactNode;
  type?: "delete" | "warning" | "info" | "success";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  description = "Apakah Anda yakin ingin melanjutkan?",
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "default",
  isLoading = false,
  icon,
  type = "info",
}: ConfirmModalProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirm();
    } catch (error) {
      console.error("Error in confirm action:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "delete":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
          titleColor: "text-destructive",
          descriptionColor: "text-muted-foreground",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          titleColor: "text-yellow-600",
          descriptionColor: "text-muted-foreground",
        };
      case "success":
        return {
          icon: <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
            <div className="h-2 w-2 bg-white rounded-full" />
          </div>,
          titleColor: "text-green-600",
          descriptionColor: "text-muted-foreground",
        };
      default:
        return {
          icon: <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="h-2 w-2 bg-white rounded-full" />
          </div>,
          titleColor: "text-blue-600",
          descriptionColor: "text-muted-foreground",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {icon || typeStyles.icon}
            <DialogTitle className={cn("text-lg font-semibold", typeStyles.titleColor)}>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className={cn("text-sm leading-relaxed", typeStyles.descriptionColor)}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
            className={cn(
              "w-full sm:w-auto order-1 sm:order-2",
              type === "delete" && "bg-destructive hover:bg-destructive/90"
            )}
          >
            {isProcessing || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}