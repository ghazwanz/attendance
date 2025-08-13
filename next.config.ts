import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', // localhost
        'ghbjp298-3000.asse.devtunnels.ms/', // Codespaces
      ],
    },
  },
};

export default nextConfig;
