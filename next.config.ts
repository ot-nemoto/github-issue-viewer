import type { NextConfig } from "next";

const isStatic = process.env.BUILD_MODE === "static";

const nextConfig: NextConfig = {
  ...(isStatic && {
    output: "export",
    basePath: "/github-issue-viewer",
    assetPrefix: "/github-issue-viewer",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
