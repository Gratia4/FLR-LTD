import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep development chunks separate from the static production export.
  // Running `next build` while the local server is open can otherwise replace
  // its chunk manifest and leave the browser requesting files that no longer exist.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
