"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { captureAndRedirect } from "@/lib/funnel-client";

interface GateCtx {
  /** Open the modal for a given character chat slug. */
  openGate: (chatSlug: string) => void;
}
const Ctx = createContext<GateCtx | null>(null);

export function useEmailGate(): GateCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEmailGate must be used within EmailGateProvider");
  return ctx;
}

const isValidEmail = (s: string) => /.+@.+\..+/.test(s);

export function EmailGateProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const openGate = useCallback((chatSlug: string) => {
    setError(false);
    setSlug(chatSlug);
  }, []);

  useEffect(() => {
    if (!slug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) setSlug(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slug, submitting]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !slug) return;
    const email = ((new FormData(e.currentTarget).get("email") as string) ?? "").trim();
    if (!isValidEmail(email)) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitting(true);
    await captureAndRedirect(email, slug); // navigates away
  };

  return (
    <Ctx.Provider value={{ openGate }}>
      {children}
      {slug && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-5 backdrop-blur-md"
          onClick={(e) => { if (!submitting && e.target === e.currentTarget) setSlug(null); }}
        >
          <div className="relative w-full max-w-[420px] rounded-2xl border border-[#F17BB6]/25 bg-[#141414]/95 px-6 pb-14 pt-7 shadow-2xl">
            <h2 id="gate-title" className="mb-1.5 text-center text-[22px] font-bold">
              Free Trial Offer
            </h2>
            <p className="mb-5 text-center text-sm text-white/60">
              Enter your email to get <span className="text-[#F17BB6]">5 messages free</span>
            </p>
            <form onSubmit={onSubmit} noValidate>
              <input
                type="email" name="email" autoFocus required
                placeholder="name@example.com"
                className="w-full rounded-[10px] border-[1.5px] border-white/10 bg-white/5 px-4 py-3.5 text-base text-white outline-none focus:border-[#F17BB6]"
              />
              {error && (
                <div role="alert" className="mt-2 text-[13px] text-red-500">
                  Enter a valid email like name@example.com
                </div>
              )}
              <button
                type="submit" disabled={submitting}
                className="btn-primary mt-3.5 w-full justify-center text-sm disabled:opacity-70"
              >
                {submitting ? "Submitting…" : "Get my 5 free messages →"}
              </button>
            </form>
            <button type="button" onClick={() => setSlug(null)}
              className="mt-3.5 block w-full text-center text-[13px] text-white/50 hover:text-white/80">
              ← back
            </button>
            <p className="mt-4 text-center text-[11px] text-white/40">
              18+. By continuing you agree to our{" "}
              <a href="https://ourdreamnetwork.com/terms" className="text-white/60 underline">Terms</a> &{" "}
              <a href="https://ourdreamnetwork.com/privacy" className="text-white/60 underline">Privacy</a>.
            </p>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
