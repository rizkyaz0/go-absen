import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "recharts",
      "@radix-ui/react-select",
    ],
  },
};

export default nextConfig;
