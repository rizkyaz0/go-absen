"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardServerProps {
  title: string;
  icon?: React.ElementType;
  subtitle?: string;
  serverAction?: () => Promise<{ success?: boolean; data?: unknown; error?: string }>;
  field?: string;
}

export default function StatCardServer({ 
  title, 
  icon: Icon, 
  subtitle, 
  serverAction, 
  field 
}: StatCardServerProps) {
  const [value, setValue] = useState("...");

  useEffect(() => {
    if (!serverAction) return;
    
    const fetchData = async () => {
      try {
        const result = await serverAction();
        if (result.error) {
          console.error("Stat fetch error:", result.error);
          setValue("0");
          return;
        }
        
        if (field) {
          setValue((result.data as Record<string, unknown>)?.[field]?.toString() ?? "0");
        } else {
          setValue(Array.isArray(result.data) ? result.data.length.toString() : "0");
        }
      } catch (err) {
        console.error("Stat fetch error:", err);
        setValue("0");
      }
    };
    fetchData();
  }, [serverAction, field]);

  return (
    <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {Icon && <Icon size={16} />} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </CardContent>
    </Card>
  );
}