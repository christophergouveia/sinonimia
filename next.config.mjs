/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 's.dicio.com.br',
          },
        ],
      },
};

export default nextConfig;
