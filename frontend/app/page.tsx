 "use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow"></div>
      <div className="absolute inset-0 bg-grid opacity-40"></div>
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-almond bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              <span className="h-2 w-2 rounded-full bg-brand-500"></span>
              Crafted. Delivered. Celebrated.
            </span>
            <h1 className="font-display text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Celebration-ready cakes from
              <span className="block text-brand-600">neighborhood artisans.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted">
              Choose from premium bakeries, customize your order, and track every step from oven to doorstep in real time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/bakeries"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-brand-600"
              >
                Find bakeries
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full border border-almond bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:border-brand-300 hover:bg-brand-50"
                >
                  Create account
                </Link>
              )}
              <Link
                href="/partner"
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-semibold text-muted transition hover:text-ink"
              >
                Partner with us
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-soft">
                  <svg className="h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </span>
                30-45 min delivery
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-soft">
                  <svg className="h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l8.49 8.49a2 2 0 010 2.83l-6.34 6.35a2 2 0 01-2.83 0l-2.83-2.83-6.34 6.35a2 2 0 010-2.83l8.49-8.49z"></path>
                    <path d="M12 12a3 3 0 100 6 3 3 0 000-6z"></path>
                  </svg>
                </span>
                200+ verified bakeries
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-soft">
                  <svg className="h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18h6"></path>
                    <path d="M10 22h4"></path>
                    <path d="M12 2a7 7 0 017 7c0 2.4-1.2 4.5-3 5.8V17H8v-2.2C6.2 13.5 5 11.4 5 9a7 7 0 017-7z"></path>
                  </svg>
                </span>
                Live order tracking
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-almond bg-white/80 p-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Custom</p>
                <p className="mt-2 text-lg font-semibold text-ink">Personalized messages</p>
                <p className="mt-1 text-sm text-muted">Make every cake feel bespoke.</p>
              </div>
              <div className="rounded-2xl border border-almond bg-white/80 p-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Trusted</p>
                <p className="mt-2 text-lg font-semibold text-ink">Hygiene verified</p>
                <p className="mt-1 text-sm text-muted">Top-rated kitchens only.</p>
              </div>
              <div className="rounded-2xl border border-almond bg-white/80 p-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Gifting</p>
                <p className="mt-2 text-lg font-semibold text-ink">Surprise delivery</p>
                <p className="mt-1 text-sm text-muted">Schedule ahead with ease.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-6 -top-8 hidden h-32 w-32 rounded-full bg-brand-200 blur-3xl lg:block"></div>
            <div className="glass-panel relative rounded-[28px] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Delivery status</p>
                  <h2 className="mt-2 font-display text-2xl text-ink">Milestone order</h2>
                </div>
                <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">On the way</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-almond bg-white/90 px-4 py-3 shadow-soft">
                  <div>
                    <p className="text-sm font-semibold text-ink">Midnight Mocha Cake</p>
                    <p className="text-xs text-muted">Baked by Crumb & Bloom</p>
                  </div>
                  <p className="text-sm font-semibold text-ink">₹899</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-almond bg-white/90 px-4 py-3 shadow-soft">
                  <div>
                    <p className="text-sm font-semibold text-ink">Berry Velvet Slice</p>
                    <p className="text-xs text-muted">Freshly packed</p>
                  </div>
                  <p className="text-sm font-semibold text-ink">₹249</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-almond bg-cream/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Eta</p>
                    <p className="text-lg font-semibold text-ink">19 minutes</p>
                  </div>
                  <button className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-glow transition hover:bg-brand-600">
                    Track rider
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full bg-brand-500"></span>
                  Rider picked up your order
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="rounded-2xl bg-brand-100 px-4 py-3 text-xs font-semibold text-brand-700">
                  Contactless delivery
                </div>
                <div className="rounded-2xl bg-cream px-4 py-3 text-xs font-semibold text-muted">
                  Gift wrap included
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
