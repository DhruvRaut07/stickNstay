type StickerProps = {
  /** Path under /stickers without extension, e.g. "06-gen-z-and-funny/overthinking-brb". */
  name: string;
  /** Empty (default) marks the sticker as decorative. */
  alt?: string;
  tilt?: number;
  className?: string;
};

/** One sticker from the quote library (800px webp). Pass a width via className. */
export function Sticker({ name, alt = "", tilt = 0, className = "" }: StickerProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/stickers/${name}.webp`}
      alt={alt}
      width={800}
      height={800}
      loading="lazy"
      className={`h-auto select-none ${className}`}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    />
  );
}
