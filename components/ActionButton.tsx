"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash, Plus } from "lucide-react";

interface ActionButtonProps {
  variant: "edit" | "delete" | "add";
  onClick: () => void;
}

export function ActionButton({ variant, onClick }: ActionButtonProps) {
  let icon = null;
  let label = "";
  let buttonVariant: "default" | "outline" | "destructive" = "default";

  switch (variant) {
    case "edit":
      icon = <Pencil size={16} />;
      label = "Edit";
      buttonVariant = "outline";
      break;
    case "delete":
      icon = <Trash size={16} />;
      label = "Delete";
      buttonVariant = "destructive";
      break;
    case "add":
      icon = <Plus size={16} />;
      label = "Tambah";
      buttonVariant = "default";
      break;
  }

  return (
    <Button
      variant={buttonVariant}
      size="sm"
      onClick={onClick}
      aria-label={label}
      className="flex items-center space-x-1"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
