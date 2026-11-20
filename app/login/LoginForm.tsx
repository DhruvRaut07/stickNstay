"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { loginStep, type LoginState } from "./actions";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

const pill =
  "box-border h-[58px] w-full rounded-full border-2 border-line bg-[#fffdf9] pr-5 text-lg text-fg placeholder:text-muted transition focus:border-fg motion-reduce:transition-none";

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type Prefill = { bsp?: string; email?: string };

/** Pill input with a leading icon, as in the login design. */
function IconField({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold">{label}</span>
      <span className="relative block">
        <svg {...iconProps} className="pointer-events-none absolute left-5 top-[17px] size-[22px] text-muted">
          {icon}
        </svg>
        {children}
      </span>
    </label>
  );
}

const textButton =
  "inline-flex min-h-11 items-center font-semibold text-link hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline";

/**
 * "Start over" and "use a different email" remount the steps with a fresh form state, keeping
 * what the person typed so a typo is a one-field fix instead of starting from scratch.
 */
export function LoginForm({ next }: { next: string }) {
  const [run, setRun] = useState<{ id: number; prefill: Prefill }>({ id: 0, prefill: {} });
  return (
    <LoginSteps
      key={run.id}
      next={next}
      prefill={run.prefill}
      focusEmail={run.id > 0}
      onRestart={(prefill) => setRun((current) => ({ id: current.id + 1, prefill }))}
    />
  );
}

function LoginSteps({
  next,
  prefill,
  focusEmail,
  onRestart,
}: {
  next: string;
  prefill: Prefill;
  focusEmail: boolean;
  onRestart: (prefill: Prefill) => void;
}) {
  const verifyButton = useRef<HTMLButtonElement>(null);
  const [sentAt, setSentAt] = useState(0);
  const [now, setNow] = useState(0);

  const [state, action, isPending] = useActionState<LoginState, FormData>(
    async (previous, formData) => {
      const result = await loginStep(previous, formData);
      // A fresh code was just emailed: start the resend countdown.
      if (result.step === "verify" && !result.error) {
        const stamp = Date.now();
        setSentAt(stamp);
        setNow(stamp);
      }
      return result;
    },
    { step: "request", next, ...prefill },
  );

  useEffect(() => {
    if (!sentAt) return;
    const id = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= sentAt + RESEND_SECONDS * 1000) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [sentAt]);

  const secondsLeft = sentAt ? Math.max(0, Math.ceil((sentAt + RESEND_SECONDS * 1000 - now) / 1000)) : 0;

  return (
    <form action={action} aria-busy={isPending} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={state.next} />

      {state.step === "request" ? (
        <>
          <IconField
            label="BSP number"
            icon={
              <>
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <circle cx="9" cy="11" r="2" />
                <path d="M6.5 16c.6-1.5 4.4-1.5 5 0M14 10h4M14 14h3" />
              </>
            }
          >
            <input
              name="bsp"
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="e.g. 26BSP0123"
              required
              defaultValue={state.bsp}
              className={`${pill} pl-[54px] uppercase placeholder:normal-case`}
            />
          </IconField>

          <div className="flex flex-col gap-2">
            <IconField
              label="College email"
              icon={
                <>
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="M3 8l9 6 9-6" />
                </>
              }
            >
              <input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                autoFocus={focusEmail}
                placeholder="yourname26@ibsindia.org"
                required
                defaultValue={state.email}
                className={`${pill} pl-[54px]`}
              />
            </IconField>
            <p className="flex items-start gap-2 text-sm leading-snug text-muted">
              <svg {...iconProps} className="mt-0.5 size-4 flex-none">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <span>We&apos;ll email you a 6-digit code. No password needed.</span>
            </p>
          </div>
        </>
      ) : (
        <>
          <input type="hidden" name="bsp" value={state.bsp} />
          <input type="hidden" name="email" value={state.email} />
          <p className="rounded-2xl bg-accent/40 p-4 text-sm">
            We sent a code to <strong className="break-all">{state.email}</strong>. It expires in 10 minutes. Can&apos;t
            see it? Check your spam folder.
          </p>
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-semibold">6-digit code</span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              enterKeyHint="go"
              pattern="\d{6}"
              maxLength={CODE_LENGTH}
              required
              autoFocus
              onChange={(event) => {
                const digits = event.currentTarget.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
                event.currentTarget.value = digits;
                // Last digit typed or pasted: no need to hunt for the button.
                if (digits.length === CODE_LENGTH && !isPending) {
                  event.currentTarget.form?.requestSubmit(verifyButton.current);
                }
              }}
              className={`${pill} pl-5 text-center text-2xl font-bold tracking-[0.4em]`}
            />
          </label>
        </>
      )}

      <div aria-live="polite">
        {state.error && (
          <p role="alert" className="rounded-2xl bg-magnet/10 p-4 text-sm font-medium text-link">
            {state.error}{" "}
            <Link href="/contact" className="font-semibold underline">
              Need help?
            </Link>
          </p>
        )}
      </div>

      {/* Verify must stay the first submit button so Enter in the code field verifies. */}
      <button
        ref={verifyButton}
        type="submit"
        name="intent"
        value={state.step === "request" ? "request" : "verify"}
        disabled={isPending}
        className="mt-1 flex h-[60px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-accent text-[19px] font-bold text-fg shadow-[0_5px_0_#c9a23a] transition hover:bg-accent-deep active:translate-y-[3px] active:shadow-[0_2px_0_#c9a23a] disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:translate-y-0"
      >
        {isPending ? "One moment…" : state.step === "request" ? "Send me a code" : "Verify and continue"}
        {!isPending && (
          <svg {...iconProps} strokeWidth={2.6} className="size-[22px]">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </button>

      {state.step === "verify" && (
        <div className="flex flex-wrap items-center justify-center gap-x-6">
          <button
            type="submit"
            name="intent"
            value="request"
            formNoValidate
            disabled={isPending || secondsLeft > 0}
            className={textButton}
          >
            {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
          </button>
          <button
            type="button"
            onClick={() => onRestart({ bsp: state.bsp, email: state.email })}
            className={textButton}
          >
            Use a different email
          </button>
        </div>
      )}
    </form>
  );
}
