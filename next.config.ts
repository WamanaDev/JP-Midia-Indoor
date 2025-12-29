import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-f6892dd3cc3f47208a370003fd62223f.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // aumenta limite para 50MB
    },
  },
};

export default nextConfig;
