/** Confirmation badge: SVG check (not a text glyph) so it is always perfectly centred. */
export function CheckBadge({ className = "h-24 w-24" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center rounded-full border-[3px] border-fg bg-accent shadow-[4px_4px_0_var(--sns-ink)] ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="var(--sns-ink)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" className="check-draw" />
      </svg>
    </span>
  );
}
