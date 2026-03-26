"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStoredUser } from "@/lib/auth";

export default function PartnerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      const storedUser = getStoredUser();

      if (storedUser?.role === "partner") {
        router.push("/partner");
        return;
      }

      if (storedUser?.role === "admin") {
        router.push("/admin");
        return;
      }

      if (storedUser?.role === "bakery") {
        router.push("/bakery-owner");
        return;
      }

      router.push("/bakeries");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07130f] text-white">
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#34d39922,transparent_55%),radial-gradient(circle_at_bottom,#14b8a622,transparent_60%)]" />

        <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-2xl font-semibold">Delivery partner login</h2>
            <p className="mt-1 text-sm text-white/70">Sign in with any delivery-partner email you registered.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60">Email</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="partner@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60">Password</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="********"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Login to partner panel"}
              </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm text-white/70">
              <p>
                Need a delivery partner account?{" "}
                <Link href="/register/partner" className="text-emerald-300 hover:underline">
                  Register here
                </Link>
              </p>
              <p>
                Are you a customer?{" "}
                <Link href="/login" className="text-red-300 hover:underline">
                  Login here
                </Link>
              </p>
              <p>
                Are you a bakery owner?{" "}
                <Link href="/login/bakery" className="text-amber-300 hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Delivery Partner</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Manage pickups, customer drops, and active delivery orders in one place.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70">
              Use your registered delivery partner email to accept available orders, update status, and complete deliveries
              from the existing partner dashboard.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-white/50">Pickup Queue</p>
                <p className="mt-2 text-sm text-white/80">See available bakery orders and accept them instantly.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-white/50">Status Updates</p>
                <p className="mt-2 text-sm text-white/80">Move orders from accepted to delivered with live tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
