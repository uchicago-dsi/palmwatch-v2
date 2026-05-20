/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/owners", destination: "/suppliers", permanent: true },
      { source: "/groups", destination: "/suppliers", permanent: true },
      { source: "/contact", destination: "/about#contact", permanent: true },
    ];
  },
};

module.exports = nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
