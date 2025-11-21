/** @type {import('next').NextConfig} */
const nextConfig = {
  // Moved from experimental to root config
  serverExternalPackages: ['postgres'],
}

module.exports = nextConfig