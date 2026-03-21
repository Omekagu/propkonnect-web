/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      },
      {
        // Catch-all for any other HTTPS image sources (avatars, external CDNs)
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
}

export default nextConfig
