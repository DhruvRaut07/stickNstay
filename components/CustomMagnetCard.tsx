import Link from "next/link";
import { MAX_IMAGE_BYTES } from "@/lib/rules";

const MAX_MB = MAX_IMAGE_BYTES / (1024 * 1024);

const FACTS = ["5×7 inch magnet", `JPG, PNG or WEBP, up to ${MAX_MB} MB`, "Printed exactly as you send it"] as const;

/** Featured shop tile for the custom-photo magnet. One purpose, one primary action. */
export function CustomMagnetCard({ price }: { price: number }) {
  return (
    <li className="col-span-2 flex flex-col gap-6 rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:gap-8 sm:p-6">
      <div
        role="img"
        aria-label="Placeholder where your photo will appear"
        className="mx-auto flex aspect-[5/7] w-36 shrink-0 flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-fg/30 bg-paper text-muted sm:w-44"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="m21 16-4.6-4.6a1.5 1.5 0 0 0-2.1 0L6 19.5" />
        </svg>
        <span className="text-sm font-semibold">Your photo</span>
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-muted">Custom</p>
        <h3 className="mt-0.5 text-2xl font-bold leading-tight">Your photo, your magnet.</h3>
        <p className="mt-2 text-muted">
          Upload any picture and we print it on a magnet for your fridge, locker or desk.
        </p>

        <ul className="mt-4 space-y-1.5 text-[15px]">
          {FACTS.map((fact) => (
            <li key={fact} className="flex gap-2">
              <span aria-hidden="true" className="font-bold text-magnet">
                ✓
              </span>
              {fact}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/order?variant=custom" className="btn press px-8">
            Upload your photo
          </Link>
          <p className="text-xl font-bold">₹{price}</p>
        </div>
      </div>
    </li>
  );
}
