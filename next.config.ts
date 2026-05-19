import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    serverActions: {
      bodySizeLimit: "20mb"
    },
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 10,
    webpackBuildWorker: true,
    webpackMemoryOptimizations: true,
    workerThreads: false
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/like-zhizhi/**"
      }
    ]
  }
};

export default nextConfig;
