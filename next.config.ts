import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": [path.join(__dirname, "src/generated/prisma/**/*")],
  },
};

export default nextConfig;
