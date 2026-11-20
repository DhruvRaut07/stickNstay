import type { ReactNode } from "react";

/** Standard card surface for every admin panel. */
export const card = "rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(27,27,47,0.04)]";

/** Page title row: heading, optional description, optional actions on the right. */
export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold leading-tight">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

/** Confirmation after an action (from the ?msg= param). Rendered as plain text, never HTML. */
export function FlashMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className="rounded-xl border border-accent-deep bg-accent/60 px-4 py-3 text-sm font-semibold">
      {message}
    </p>
  );
}

/** Something failed to load or save. Details are in the server log, not here. */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl border border-magnet/40 bg-magnet/10 px-4 py-3 text-sm font-semibold text-link">
      {children}
    </p>
  );
}

/** Small coloured status pill. */
export function Pill({ tone, children }: { tone: "new" | "confirmed" | "delivered" | "cancelled" | "neutral"; children: ReactNode }) {
  const tones = {
    new: "bg-accent text-fg",
    confirmed: "bg-[#DCE9FF] text-[#1E3A8A]",
    delivered: "bg-[#D5F2DE] text-[#14532D]",
    cancelled: "bg-paper text-muted line-through",
    neutral: "bg-paper text-muted",
  } as const;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
