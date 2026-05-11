/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['public.blob.vercel-storage.com'],
  },
}

module.exports = nextConfig

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
