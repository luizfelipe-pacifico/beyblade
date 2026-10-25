// Landing do Beyblade Arena (D-016): site estático, sem servidor. `next build` gera a pasta out/.
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // As imagens já saem otimizadas em WebP por scripts/optimize-images.mjs.
  images: { unoptimized: true },
  poweredByHeader: false,
  // site/ tem o próprio package-lock: sem isto o Next sobe até a raiz do repositório.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
