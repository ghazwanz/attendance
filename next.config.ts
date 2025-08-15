import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', // localhost
        'https://gtwm8v4j-3000.asse.devtunnels.ms', // Codespaces
      ],
    },
  },
};
export default nextConfig;
