"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PartnerRegistrationPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({ ...formData, role: "partner" });
      router.push("/partner");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("Email already exists. Please login with that delivery partner email.");
      } else {
        setError(err?.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07130f] text-white">
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#34d39922,transparent_55%),radial-gradient(circle_at_bottom,#14b8a622,transparent_60%)]" />

        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Delivery Partner</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Create a dedicated delivery partner account and start using the partner panel.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70">
              This registration creates a real `partner` role account, so delivery boys can log in later with any
              registered email and access the existing delivery dashboard.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs">
                Separate partner panel
              </div>
              <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs">
                Login with registered email
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
            <h2 className="text-2xl font-semibold">Create delivery partner account</h2>
            <p className="mt-1 text-sm text-white/70">Register once, then sign in with the same email anytime.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

              <div>
                <label className="text-xs uppercase tracking-widest text-white/60">Partner Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="Ravi Kumar"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-white/60">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="partner@example.com"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-white/60">Password</label>
                <input
                  name="password"
                  type="password"
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="********"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-white/60">Phone (optional)</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  placeholder="+91 98765 43210"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-400 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create delivery partner account"}
              </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm text-white/70">
              <p>
                Already have a delivery partner account?{" "}
                <Link href="/login/partner" className="text-emerald-300 hover:underline">
                  Login here
                </Link>
              </p>
              <p>
                Are you a customer?{" "}
                <Link href="/register" className="text-red-300 hover:underline">
                  Register as customer
                </Link>
              </p>
              <p>
                Are you a bakery owner?{" "}
                <Link href="/register/bakery" className="text-amber-300 hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
