import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
};

/** Optimised image: responsive srcset + WebP for remote CDN images, graceful fallback. */
export function SmartImage({ src, alt, className, width, height, priority, sizes }: Props) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <span className="font-display text-xs uppercase tracking-widest">ABVP</span>
      </div>
    );
  }

  const isUnsplash = src.includes("images.unsplash.com");
  const build = (w: number) =>
    isUnsplash ? `${src.split("?")[0]}?auto=format&fit=crop&fm=webp&q=75&w=${w}` : src;
  const srcSet = isUnsplash
    ? [400, 800, 1200, 1600].map((w) => `${build(w)} ${w}w`).join(", ")
    : undefined;

  return (
    <img
      src={build(1200)}
      srcSet={srcSet}
      sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
