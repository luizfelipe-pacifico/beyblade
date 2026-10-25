/** @type {import('next').NextConfig} */
const nextConfig = {
  // Jogo local: sem telemetria de imagem remota e sem cabeçalho que expõe a stack.
  poweredByHeader: false,
  images: { unoptimized: true },
  // site/ é a landing (outro app Next, D-016); não entra no build do jogo.
  outputFileTracingExcludes: { '*': ['site/**'] },
};

export default nextConfig;
