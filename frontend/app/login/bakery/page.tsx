"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBakeryOwnerAuth } from "@/context/BakeryOwnerAuthContext";
import { api } from "@/lib/api";
import { bakeryOwnerApi } from "@/lib/bakeryOwnerApi";
import { getStoredBakeryOwner, setStoredBakeryOwner } from "@/lib/bakeryOwnerAuth";

type BakeryResult = {
  _id: string;
  name: string;
  address: string;
};

export default function BakeryLoginPage() {
  const router = useRouter();
  const { login } = useBakeryOwnerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bakeryQuery, setBakeryQuery] = useState("");
  const [bakeryResults, setBakeryResults] = useState<BakeryResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedBakery, setSelectedBakery] = useState<BakeryResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bakeryQuery.trim()) {
      setBakeryResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/bakeries", {
          params: { search: bakeryQuery, page: 1, limit: 6 },
        });
        const results = (res.data.data || []) as BakeryResult[];
        setBakeryResults(results);
        setShowResults(true);
      } catch {
        setBakeryResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [bakeryQuery]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const storedOwner = getStoredBakeryOwner();
      if (selectedBakery && !storedOwner?.bakeryId) {
        await bakeryOwnerApi.post("/bakery-owners/bakery/claim", { bakeryId: selectedBakery._id });
        const profileRes = await bakeryOwnerApi.get("/bakery-owners/me");
        if (profileRes.data?.data?.owner) {
          setStoredBakeryOwner(profileRes.data.data.owner);
        }
      }
      router.push("/bakery-owner");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f0e] text-white">
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#f9c78422,transparent_55%),radial-gradient(circle_at_bottom,#ff8a5b22,transparent_60%)]" />

        <div className="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-2xl font-semibold">Bakery owner login</h2>
            <p className="mt-1 text-sm text-white/70">Secure access to your bakery operations hub.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60">Email</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                  placeholder="owner@bakery.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60">Password</label>
                 <input
                   className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                   placeholder="********"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                 />
              </div>
              <div className="relative">
                <label className="text-xs uppercase tracking-widest text-white/60">Bakery name</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                  placeholder="Search your bakery"
                  value={bakeryQuery}
                  onChange={(e) => {
                    setBakeryQuery(e.target.value);
                    setSelectedBakery(null);
                  }}
                  onFocus={() => {
                    if (bakeryResults.length) setShowResults(true);
                  }}
                />
                {showResults && bakeryResults.length > 0 && (
                  <div className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-white/10 bg-[#121212] shadow-lg">
                    {bakeryResults.map((bakery) => (
                      <button
                        key={bakery._id}
                        type="button"
                        onClick={() => {
                          setSelectedBakery(bakery);
                          setBakeryQuery(bakery.name);
                          setShowResults(false);
                        }}
                        className="flex w-full flex-col gap-1 border-b border-white/5 px-4 py-3 text-left text-sm hover:bg-white/5"
                      >
                        <span className="font-semibold text-white">{bakery.name}</span>
                        <span className="text-xs text-white/60">{bakery.address}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showResults && bakeryResults.length === 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-[#121212] px-4 py-3 text-sm text-white/60">
                    No bakeries found.
                  </div>
                )}
                {selectedBakery && (
                  <p className="mt-2 text-xs text-amber-200">
                    Selected: {selectedBakery.name}
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-300">{error}</p>}
              <button
                className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login to bakery dashboard"}
              </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm text-white/70">
              <p>
                Need a bakery account?{" "}
                <Link href="/register/bakery" className="text-amber-300 hover:underline">
                  Register your bakery
                </Link>
              </p>
              <p>
                Are you a customer?{" "}
                <Link href="/login" className="text-red-300 hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Production Ready</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Run your bakery like a modern delivery business.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70">
              Track incoming orders, update status in real time, and manage a polished menu - all in one dashboard.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-white/50">Order Flow</p>
                <p className="mt-2 text-sm text-white/80">Placed to Accepted to Preparing to Out for Delivery to Delivered</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-white/50">Menu Ops</p>
                <p className="mt-2 text-sm text-white/80">Edit prices, availability, and categories instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

