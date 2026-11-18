import Image from "next/image";

const SRC = {
  color: "/stickNstay-logo-color.svg",
  dark: "/stickNstay-logo-on-dark.svg",
} as const;

/** Official logo, unmodified. 4841×1180 artwork; height drives size. */
export function Logo({ on = "color", className = "h-[30px] sm:h-10" }: { on?: keyof typeof SRC; className?: string }) {
  return (
    <Image
      src={SRC[on]}
      alt="stickNstay"
      width={4841}
      height={1180}
      unoptimized
      priority
      className={`w-auto ${className}`}
    />
  );
}
