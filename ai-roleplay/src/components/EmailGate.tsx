"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { captureAndRedirect } from "@/lib/funnel-client";
import type { GateCopy } from "@/data/characters";

interface GateTarget {
  chatSlug: string;
  name: string;
  gate: GateCopy;
}

interface GateCtx {
  openGate: (chatSlug: string, name: string, gate: GateCopy) => void;
}
const Ctx = createContext<GateCtx | null>(null);

export function useEmailGate(): GateCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEmailGate must be used within EmailGateProvider");
  return ctx;
}

const isValidEmail = (s: string) => /.+@.+\..+/.test(s);

export function EmailGateProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<GateTarget | null>(null);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openGate = useCallback((chatSlug: string, name: string, gate: GateCopy) => {
    setError(false);
    setTarget({ chatSlug, name, gate });
  }, []);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) setTarget(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, submitting]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !target) return;
    const email = ((new FormData(e.currentTarget).get("email") as string) ?? "").trim();
    if (!isValidEmail(email)) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitting(true);
    await captureAndRedirect(email, target.chatSlug); // navigates away
  };

  return (
    <Ctx.Provider value={{ openGate }}>
      {children}
      {target && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080609]/85 p-5 backdrop-blur-md"
          onClick={(e) => { if (!submitting && e.target === e.currentTarget) setTarget(null); }}
        >
          <div className="rise-in relative w-full max-w-[400px] rounded-3xl border border-[#F17BB6]/20 bg-[#161016]/95 px-7 pb-7 pt-8 shadow-[0_24px_80px_-24px_rgba(219,39,119,0.4)]">
            <span aria-hidden className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full bg-[#F17BB6]/12">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#F17BB6">
                <path d="M12 21s-6.7-4.35-9.33-8.02C.9 10.42 1.4 7.1 3.9 5.7c1.9-1.06 4.2-.5 5.6 1.06L12 9.3l2.5-2.54c1.4-1.56 3.7-2.12 5.6-1.06 2.5 1.4 3 4.72 1.23 7.28C18.7 16.65 12 21 12 21z" />
              </svg>
            </span>
            <h2 id="gate-title" className="text-center font-display text-2xl font-bold tracking-tight text-white">
              {target.gate.headline}
            </h2>
            <p className="mx-auto mt-2 max-w-[300px] text-center text-sm leading-relaxed text-white/55">
              {target.gate.sub}
            </p>
            <form onSubmit={onSubmit} noValidate className="mt-6">
              <input
                type="email" name="email" autoFocus required
                placeholder="name@example.com"
                className="w-full rounded-xl border-[1.5px] border-white/10 bg-white/[0.04] px-4 py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#F17BB6]"
              />
              {error && (
                <div role="alert" className="mt-2 text-[13px] text-rose-400">
                  Enter a valid email like name@example.com
                </div>
              )}
              <button
                type="submit" disabled={submitting}
                className="btn-primary mt-3 w-full justify-center disabled:opacity-70"
              >
                {submitting ? "Submitting…" : target.gate.button}
              </button>
            </form>
            <p className="mt-3 text-center text-[12px] text-white/45">
              Free to start · pick up right where you left off
            </p>
            <button type="button" onClick={() => setTarget(null)}
              className="mt-4 block w-full text-center text-[13px] text-white/45 transition-colors hover:text-white/75">
              ← back to the story
            </button>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-white/35">
              By continuing you agree to our{" "}
              <a href="https://ourdreamnetwork.com/terms" className="text-white/55 underline underline-offset-2">Terms</a> &{" "}
              <a href="https://ourdreamnetwork.com/privacy" className="text-white/55 underline underline-offset-2">Privacy</a>.
            </p>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
