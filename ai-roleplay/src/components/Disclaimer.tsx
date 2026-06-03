import Link from "next/link";

interface Props {
  variant?: "compact" | "footer";
}

export function Disclaimer({ variant = "compact" }: Props) {
  if (variant === "footer") {
    return (
      <p className="text-parchment-300/60">
        <span className="mr-2 inline-block rounded bg-rose-700/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-rose-500">
          18+
        </span>
        Adults-only &middot; Suggestive romance &middot; Consenting adults only
      </p>
    );
  }

  return (
    <div
      role="status"
      className="mx-auto max-w-3xl rounded-lg border border-gold-500/20 bg-night-800/60 px-5 py-3 text-center text-sm leading-relaxed backdrop-blur-sm"
    >
      <p className="text-parchment-200">
        <span className="mr-1.5 inline-block rounded bg-rose-700/30 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-rose-500">
          18+
        </span>
        Adults-only. Spicy slow-burn romantasy with an AI&nbsp;twist.
      </p>
    </div>
  );
}
