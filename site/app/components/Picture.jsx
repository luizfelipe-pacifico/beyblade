import { image } from '../site';

// <img> com srcset dos WebP gerados (640/1280/1920). O navegador escolhe pelo tamanho na tela e pela densidade.
export default function Picture({ id, sizes = '100vw', priority = false, className, style }) {
  const img = image(id);
  const src = (w) => `/images/${id}-${w}.webp`;
  return (
    <img
      className={className}
      style={style}
      src={src(1280)}
      srcSet={`${src(640)} 640w, ${src(1280)} 1280w, ${src(1920)} 1920w`}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={img.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  );
}
