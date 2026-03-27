import Link from "next/link";
import NavbarClientControls from "@/components/NavbarClientControls";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-almond/80 bg-white/80 backdrop-blur">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 text-lg font-semibold tracking-tight text-ink">
          <img
            src="/gods-cake-logo.svg"
            alt="God's Cake"
            className="h-9 w-9 shrink-0 rounded-2xl object-cover shadow-soft sm:h-10 sm:w-10"
          />
          <span className="font-display text-lg sm:text-xl">God&apos;s Cake</span>
        </Link>

        <NavbarClientControls />
      </div>
    </nav>
  );
}
