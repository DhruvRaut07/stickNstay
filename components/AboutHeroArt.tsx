import { MagnetSticker, type MagnetId } from "./MagnetSticker";

// Same five stickers as the login page, arranged for the About hero (positions: .ab-m1 ... .ab-m5).
const LAYOUT: readonly (readonly [MagnetId, string])[] = [
  ["bubble", "ab-m1"],
  ["ticket", "ab-m2"],
  ["burst", "ab-m3"],
  ["mug", "ab-m4"],
  ["cloud", "ab-m5"],
];

/** Decorative sticker cluster on the right of the About hero. */
export function AboutHeroArt() {
  return (
    <div className="about-art" aria-hidden="true">
      {LAYOUT.map(([id, cls]) => (
        <MagnetSticker key={id} id={id} className={cls} />
      ))}
    </div>
  );
}
