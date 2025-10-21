"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  icon?: React.ElementType;
  subtitle?: string;
  apiEndpoint?: string; // optional: ambil data dari API
  field?: string; // optional: field yang dipakai
}

export default function StatCard({ title, icon: Icon, subtitle, apiEndpoint, field }: StatCardProps) {
  const [value, setValue] = useState("...");

  useEffect(() => {
    if (!apiEndpoint) return;
    const fetchData = async () => {
      try {
        const res = await fetch(apiEndpoint);
        const json = await res.json();
        if (field) {
          setValue(json[field] ?? "0");
        } else {
          setValue(Array.isArray(json) ? json.length.toString() : "0");
        }
      } catch (err) {
        console.error("Stat fetch error:", err);
        setValue("0");
      }
    };
    fetchData();
  }, [apiEndpoint, field]);

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
