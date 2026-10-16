import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Per-user pages read the session on every request. Cache Components would
  // force a Suspense shell around all of that; this app renders it directly.
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs", "stripe"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
