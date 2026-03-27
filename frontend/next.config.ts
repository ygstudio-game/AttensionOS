import type { NextConfig } from "next";

// We check which script was typed in the terminal
const isExtensionBuild = process.env.npm_lifecycle_event === 'build:extension';

const nextConfig: NextConfig = {
  // If building the extension, force static export. Otherwise, build normally.
  output: isExtensionBuild ? 'export' : undefined,

  images: {
    // Extensions don't support Next.js Node-based image optimization
    unoptimized: isExtensionBuild
  },

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;