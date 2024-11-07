import type { NextConfig } from "next";

require("./src/env");

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  transpilePackages: ["@remotion/player", "remotion"],
};

export default nextConfig;
