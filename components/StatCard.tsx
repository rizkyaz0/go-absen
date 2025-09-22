// components/StatCard.jsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  icon?: React.ElementType;
  value: React.ReactNode;
  subtitle?: string;
}

export default function StatCard({ title, icon: Icon, value, subtitle }: StatCardProps) {
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
