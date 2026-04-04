import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev behind Cloudflare quick tunnels: avoids blocked cross-site requests; HMR may still warn if WS isn’t proxied.
  allowedDevOrigins: ["*.trycloudflare.com", "*.cfargotunnel.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
