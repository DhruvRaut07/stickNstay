import Image from "next/image";

type MagnetProps = {
  tilt: string;
  bg: string;
  text: string;
  label: string;
  title?: string;
  imageUrl?: string | null;
  /** Rendered width hint so next/image serves a small file (default: shop grid). */
  sizes?: string;
};

/** Product art: the sticker image when there is one, else coloured placeholder art. */
export function Magnet({
  tilt,
  bg,
  text,
  label,
  title,
  imageUrl,
  sizes = "(min-width: 768px) 25vw, 50vw",
}: MagnetProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={label}
        width={800}
        height={800}
        sizes={sizes}
        className="aspect-square h-auto w-full select-none object-contain"
        style={{ transform: `rotate(${tilt})` }}
      />
    );
  }
  return (
    <div
      className="relative aspect-[5/7] w-full rounded-[28px] border border-line shadow-[var(--shadow-card)]"
      style={{ transform: `rotate(${tilt})`, background: bg }}
      role="img"
      aria-label={label}
    >
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/25 via-transparent to-black/10" />
      {title && (
        <span
          className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-2xl font-bold leading-tight"
          style={{ color: text }}
        >
          {title}
        </span>
      )}
      <span className="absolute bottom-4 left-4 text-sm font-semibold" style={{ color: text }}>
        StickNstay
      </span>
    </div>
  );
}
