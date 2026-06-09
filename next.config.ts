import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fycpmbdrybdgfcsvfrqf.supabase.co",
      },
    ],
  },
};

export default nextConfig;
