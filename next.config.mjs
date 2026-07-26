/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure server-only packages aren't bundled for the client
  serverExternalPackages: ["pdf-parse", "mongoose", "mongodb", "bcryptjs"],

  // Increase API body size limit for file uploads (20MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
