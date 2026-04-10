/** @type {import('next').NextConfig} */
const apiOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(
  /\/$/,
  "",
);

const nextConfig = {
    async redirects() {
      return [
        { source: "/shop", destination: "/loja", permanent: true },
        { source: "/shop/:path*", destination: "/loja/:path*", permanent: true },
        { source: "/product/:path*", destination: "/produto/:path*", permanent: true },
        { source: "/cart", destination: "/carrinho", permanent: true },
        { source: "/checkout", destination: "/compra", permanent: true },
        { source: "/user", destination: "/usuario", permanent: true },
        { source: "/user/:path*", destination: "/usuario/:path*", permanent: true },
      ];
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'placehold.co',
            port: ""
          },
        ],
      },
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    },
    async rewrites() {
      // Legado: chamadas diretas a /backend-api ainda podem existir; o front usa /api/* + Route Handlers.
      return [
        {
          source: "/backend-api/:path*",
          destination: `${apiOrigin}/api/:path*`,
        },
      ];
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
      ];
    },
};

export default nextConfig;
