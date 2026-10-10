/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep build artefacts out of OneDrive-synced folders when requested
  // (OneDrive breaks Next's file watcher): NEXT_DIST_DIR=C:\Temp\next-build
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};
module.exports = nextConfig;
