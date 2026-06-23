import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image1.challengermode.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "opgg-static.akamaized.net",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
        pathname: "/cdn/**",
      },
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
