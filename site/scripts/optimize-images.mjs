// Baixa as imagens listadas em images.json e gera WebP responsivos em public/images/.
//
// Qualidade "4K sem o peso de 4K": cada imagem sai em 640, 1280 e 1920 px de largura. Em uma tela
// 4K o navegador escolhe a de 1920 (via srcset), que já tem densidade de pixel suficiente; o arquivo
// fica em dezenas de KB em vez de vários MB.
//
// Ampliação: os frames do anime têm 1440 px. Se ESRGAN_BIN apontar para o realesrgan-ncnn-vulkan,
// a imagem é ampliada 4x com o modelo de anime (traços nítidos) e depois reduzida, o que dá detalhe
// real. Sem ele, a ampliação é Lanczos com nitidez leve: fica limpa, mas não inventa detalhe.
//
// Uso: npm run images            (ESRGAN_BIN=C:/caminho/realesrgan-ncnn-vulkan.exe npm run images)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.join(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'images.json'), 'utf8'));
const cacheDir = path.join(root, '.image-cache');
const outDir = path.join(root, 'public', 'images');
const esrgan = process.env.ESRGAN_BIN;

fs.mkdirSync(cacheDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

// A CDN da wiki responde com um desafio da Cloudflare se o pedido não parecer de um navegador.
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  Referer: 'https://beyblade.fandom.com/',
};

async function download(img) {
  const cached = fs.readdirSync(cacheDir).find((f) => f.startsWith(`${img.id}.`) && !f.includes('.x4.'));
  if (cached) return path.join(cacheDir, cached);

  const res = await fetch(`${img.url}?format=original`, { headers: HEADERS });
  const type = res.headers.get('content-type') ?? '';
  if (!res.ok || !type.startsWith('image/')) throw new Error(`${img.id}: download falhou (${res.status} ${type})`);
  const file = path.join(cacheDir, `${img.id}.${type.split('/')[1]}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

function upscale(file, id) {
  const out = path.join(cacheDir, `${id}.x4.png`);
  if (!fs.existsSync(out)) {
    execFileSync(esrgan, ['-i', file, '-o', out, '-n', 'realesr-animevideov3', '-s', '4'], { stdio: 'inherit' });
  }
  return out;
}

const report = [];
for (const img of manifest.images) {
  const original = await download(img);
  const source = esrgan ? upscale(original, img.id) : original;
  const meta = await sharp(original).metadata();

  for (const width of manifest.widths) {
    const out = path.join(outDir, `${img.id}-${width}.webp`);
    let pipeline = sharp(source).resize({ width, kernel: 'lanczos3', withoutEnlargement: false });
    // Sem ESRGAN, só a maior largura passa do original; uma nitidez leve compensa a ampliação.
    if (!esrgan && width > meta.width) pipeline = pipeline.sharpen({ sigma: 0.7, m1: 0.6, m2: 2 });
    const info = await pipeline.webp({ quality: 82, effort: 6, smartSubsample: true }).toFile(out);
    report.push(`${path.basename(out)}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
  }
  // Proporção para o next/image e o CSS evitarem salto de layout.
  img.width = meta.width;
  img.height = meta.height;
}

// Prévia de link (WhatsApp, Discord): 1200x630 em JPEG, que todos os apps de mensagem leem.
const ogSource = path.join(cacheDir, fs.readdirSync(cacheDir).find((f) => f.startsWith(`${manifest.og}.`) && !f.includes('.x4.')));
await sharp(esrgan ? upscale(ogSource, manifest.og) : ogSource)
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(root, 'public', 'og.jpg'));

fs.writeFileSync(path.join(root, 'app', 'images.generated.json'), JSON.stringify(manifest.images, null, 2) + '\n');
console.log(report.join('\n'));
console.log(esrgan ? '\nAmpliação: Real-ESRGAN (realesr-animevideov3, 4x).' : '\nAmpliação: Lanczos + nitidez (defina ESRGAN_BIN para usar o Real-ESRGAN).');
