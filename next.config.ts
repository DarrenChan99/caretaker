import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Seeded placeholder portraits are SVGs; real photo drop-ins will be raster.
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
