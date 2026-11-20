import type { ReactNode } from "react";

export type MagnetId = "bubble" | "ticket" | "burst" | "mug" | "cloud";

type Line = { text: string; size: number; color: string };

type MagnetSpec = {
  width: number;
  height: number;
  text: { left: number; top: number; width: number; lines: readonly Line[] };
  art: ReactNode;
};

// Artwork colours from the design files. Decorative only, so they live with the artwork.
const INK = "#1B1B2F";
const CREAM = "#FFF6E9";
const SUNSHINE = "#FFD45C";
const RED = "#B91C2E";

const BUBBLE =
  "M40 10H320Q350 10 350 40V200Q350 230 320 230H190L130 285L140 230H40Q10 230 10 200V40Q10 10 40 10Z";
const TICKET =
  "M30 20H350Q370 20 370 40V90A22 22 0 0 0 370 134V190Q370 210 350 210H30Q10 210 10 190V134A22 22 0 0 0 10 90V40Q10 20 30 20Z";
const STARBURST =
  "M323.0 170.0L319.5 177.8L310.6 184.8L300.7 190.7L294.5 196.5L294.4 203.3L299.3 212.0L305.6 222.1L308.7 231.8L305.8 239.2L296.9 243.2L285.1 244.8L274.8 246.1L268.8 250.0L267.6 257.9L269.0 269.0L269.5 280.5L266.2 288.8L258.5 291.8L247.7 289.7L236.8 285.6L227.9 283.7L222.1 287.0L218.3 295.8L214.5 307.0L209.1 316.1L201.8 319.4L193.1 315.8L184.5 307.9L176.8 300.2L170.0 297.0L163.2 300.2L155.5 307.9L146.9 315.8L138.2 319.4L130.9 316.1L125.5 307.0L121.7 295.8L117.9 287.0L112.1 283.7L103.3 285.6L92.3 289.7L81.5 291.8L73.8 288.8L70.5 280.5L71.0 269.0L72.4 257.9L71.2 250.0L65.2 246.1L54.9 244.8L43.1 243.2L34.2 239.2L31.3 231.8L34.4 222.1L40.7 212.0L45.6 203.3L45.5 196.5L39.3 190.7L29.4 184.8L20.5 177.8L17.0 170.0L20.5 162.2L29.4 155.2L39.3 149.3L45.5 143.5L45.6 136.7L40.7 128.0L34.4 117.9L31.3 108.2L34.2 100.8L43.1 96.8L54.9 95.2L65.2 93.9L71.2 90.0L72.4 82.1L71.0 71.0L70.5 59.5L73.8 51.2L81.5 48.2L92.3 50.3L103.2 54.4L112.1 56.3L117.9 53.0L121.7 44.2L125.5 33.0L130.9 23.9L138.2 20.6L146.9 24.2L155.5 32.1L163.2 39.8L170.0 43.0L176.8 39.8L184.5 32.1L193.1 24.2L201.8 20.6L209.1 23.9L214.5 33.0L218.3 44.2L222.1 53.0L227.9 56.3L236.8 54.4L247.7 50.3L258.5 48.2L266.2 51.2L269.5 59.5L269.0 71.0L267.6 82.1L268.8 90.0L274.8 93.9L285.1 95.2L296.9 96.7L305.8 100.8L308.7 108.2L305.6 117.9L299.3 128.0L294.4 136.7L294.5 143.5L300.7 149.3L310.6 155.2L319.5 162.2L323.0 170.0Z";
const MUG_BODY = "M30 40H250V210Q250 270 190 270H90Q30 270 30 210Z";
const MUG_HANDLE = "M250 85H290Q325 85 325 130Q325 175 290 180H250";
const MUG_STEAM = "M95 30Q80 18 95 6M140 30Q125 18 140 6M185 30Q170 18 185 6";
const CLOUD =
  "M90 230Q20 230 20 170Q20 115 80 110Q85 50 150 50Q190 20 240 55Q300 40 330 90Q395 100 395 165Q395 230 330 230Z";

/** A flat sticker shape with the soft offset shadow from the design. */
function Shape({ d, fill }: { d: string; fill: string }) {
  return (
    <>
      <g transform="translate(9 12)" opacity=".22">
        <path d={d} fill="#000" />
      </g>
      <path d={d} fill={fill} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
    </>
  );
}

const SPECS: Record<MagnetId, MagnetSpec> = {
  bubble: {
    width: 360,
    height: 300,
    text: {
      left: 30,
      top: 120,
      width: 300,
      lines: [
        { text: "main", size: 44, color: INK },
        { text: "character", size: 52, color: INK },
        { text: "energy", size: 70, color: RED },
      ],
    },
    art: <Shape d={BUBBLE} fill={CREAM} />,
  },
  ticket: {
    width: 380,
    height: 230,
    text: {
      left: 25,
      top: 115,
      width: 330,
      lines: [
        { text: "study now,", size: 52, color: CREAM },
        { text: "nap later", size: 60, color: SUNSHINE },
      ],
    },
    art: <Shape d={TICKET} fill={INK} />,
  },
  burst: {
    width: 340,
    height: 340,
    text: {
      left: 55,
      top: 170,
      width: 230,
      lines: [
        { text: "good", size: 60, color: CREAM },
        { text: "vibes", size: 72, color: SUNSHINE },
        { text: "only", size: 52, color: CREAM },
      ],
    },
    art: <Shape d={STARBURST} fill="#E63946" />,
  },
  mug: {
    width: 340,
    height: 290,
    text: {
      left: 45,
      top: 155,
      width: 190,
      lines: [
        { text: "iced", size: 52, color: RED },
        { text: "coffee", size: 54, color: INK },
        { text: "& big", size: 40, color: INK },
        { text: "dreams", size: 46, color: INK },
      ],
    },
    art: (
      <>
        <g transform="translate(9 12)" opacity=".22">
          <path d={MUG_BODY} fill="#000" />
        </g>
        <path d={MUG_HANDLE} fill="none" stroke={INK} strokeWidth="36" strokeLinejoin="round" />
        <path d={MUG_HANDLE} fill="none" stroke="#FFFFFF" strokeWidth="22" strokeLinejoin="round" />
        <path d={MUG_BODY} fill="#FFFFFF" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
        <path d={MUG_STEAM} fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" opacity=".55" />
      </>
    ),
  },
  cloud: {
    width: 415,
    height: 260,
    text: {
      left: 67,
      top: 150,
      width: 280,
      lines: [
        { text: "low battery,", size: 40, color: INK },
        { text: "high hopes", size: 48, color: RED },
      ],
    },
    art: <Shape d={CLOUD} fill="#F8C6C6" />,
  },
};

/**
 * One decorative sticker (illustration + lettering). Position and scale come from the CSS
 * class the caller passes (e.g. .lh-m1 on the login page, .ab-m1 on the About page).
 */
export function MagnetSticker({ id, className }: { id: MagnetId; className: string }) {
  const { width, height, text, art } = SPECS[id];
  return (
    <div className={`sticker ${className}`} style={{ width, height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        {art}
      </svg>
      <div
        className="absolute text-center font-bold"
        style={{ left: text.left, top: text.top, width: text.width, transform: "translateY(-50%)" }}
      >
        {text.lines.map((line) => (
          <p key={line.text} style={{ margin: 0, fontSize: line.size, lineHeight: 1.02, color: line.color }}>
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
