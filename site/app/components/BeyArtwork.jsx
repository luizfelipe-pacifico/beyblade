// Responsive renders of the detailed vector masters, with no runtime tracing cost.
export default function BeyArtwork({ model, alt, sizes = '(max-width: 800px) 42vw, 300px', loading = 'lazy', className, ref }) {
  return (
    <img ref={ref} className={className} src={`/beyblades/${model}-960.webp`}
      srcSet={[480, 960, 1440].map((width) => `/beyblades/${model}-${width}.webp ${width}w`).join(', ')}
      sizes={sizes} alt={alt} width="1024" height="1024" loading={loading}
      fetchPriority={loading === 'eager' ? 'high' : undefined} decoding="async" />
  );
}
