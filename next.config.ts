/** @type {import('next').NextConfig} */
// experimental.serverComponentsExternalPackages 옵션을 제거하고 최상위 serverExternalPackages로 이동
const nextConfig = {
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    // 다른 실험적 옵션이 있다면 이곳에 유지
  },
};

module.exports = nextConfig;
