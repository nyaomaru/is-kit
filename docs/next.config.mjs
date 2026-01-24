/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['is-kit'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
