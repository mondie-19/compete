import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is the default in Next.js 16. Declaring it here silences
  // the build error caused by having a webpack config without a turbopack config.
  turbopack: {},
};

export default nextConfig;
