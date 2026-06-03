import { Disclaimer } from "@/components/Disclaimer";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-night-900/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm sm:flex-row sm:justify-between sm:px-6">
        <Disclaimer variant="footer" />
        <ul className="flex gap-4">
          <li><a href="https://ourdreamnetwork.com/privacy" className="text-white/50 hover:text-[#F17BB6]">Privacy</a></li>
          <li><a href="https://ourdreamnetwork.com/terms" className="text-white/50 hover:text-[#F17BB6]">Terms</a></li>
        </ul>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-white/40">
        &copy; OurDream Network. All rights reserved. 18+ only.
      </div>
    </footer>
  );
}
