import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // This Next.js version defaults to 'attachment', which makes browsers
    // download optimized images instead of rendering them inline.
    contentDispositionType: 'inline',
  },
};

export default nextConfig;
