import { MagnetSticker, type MagnetId } from "./MagnetSticker";

// Position/scale classes live in globals.css (.lh-m1 ... .lh-m5).
const LAYOUT: readonly (readonly [MagnetId, string])[] = [
  ["bubble", "lh-m1"],
  ["ticket", "lh-m2"],
  ["burst", "lh-m3"],
  ["mug", "lh-m4"],
  ["cloud", "lh-m5"],
];

/** Decorative left panel of the login page: a yellow dotted board with floating magnets. */
export function LoginHero() {
  return (
    <section className="login-hero" aria-hidden="true">
      <div className="lh-glow" />
      {LAYOUT.map(([id, cls]) => (
        <MagnetSticker key={id} id={id} className={cls} />
      ))}
      <div className="lh-tag">custom magnets for your space</div>
    </section>
  );
}
