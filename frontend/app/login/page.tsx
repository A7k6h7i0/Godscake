"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AuthUser, getStoredUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const redirectBasedOnRole = (user: AuthUser) => {
    switch (user.role) {
      case "admin":
        router.push("/admin");
        break;
      case "partner":
        router.push("/partner");
        break;
      case "bakery":
        router.push("/bakery-owner");
        break;
      default:
        router.push("/bakeries");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const storedUser = getStoredUser();
      if (storedUser) {
        redirectBasedOnRole(storedUser);
        toast({
          title: "Welcome back!",
          description: `Hello ${storedUser.name}, you've successfully logged in.`,
        });
      } else {
        router.push("/bakeries");
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
      toast({
        title: "Login failed",
        description: err?.response?.data?.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_10%_20%,rgba(226,55,68,0.07)_0,transparent_30%),radial-gradient(circle_at_90%_10%,rgba(255,149,0,0.08)_0,transparent_30%),var(--z-bg)]">
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <img src="/gods-cake-logo.svg" alt="God's Cake" className="h-8 w-8 rounded-full object-cover" />
              <span>God's Cake</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/cart" className="relative">
                <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M20.49 7.99a2 2 0 00-.93-2.41L16 3h-3.5a2 2 0 00-1.41.59l-.83 2.17H6a2 2 0 00-2 2v1h1.25a2 2 0 001.6.59l.75 2H2v2a2 2 0 002 2h12a2 2 0 002-2v-1.59"></path>
                </svg>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-md w-full space-y-8">
            {/* Logo and Tagline */}
            <div className="text-center">
              <div className="h-10 w-10 mx-auto rounded-full bg-brand-50">
                <img src="/gods-cake-logo.svg" alt="God's Cake" className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="mt-2 text-sm text-gray-500">
                Sign in to continue your cake journey
              </p>
            </div>

            {/* Login Form */}
            <form className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6" onSubmit={onSubmit}>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors pl-10"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
                    onClick={(e) => {
                      e.preventDefault();
                      // Toggle password visibility (optional enhancement)
                    }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4.5c7 0 11 8 11 8h1.5c-3.5-4-7.5-6-11.5-6s-8 2-11.5 6c0 0 4-8 11-8z"></path>
                      <path d="M12 12a3 3 0 100 6 3 3 0 000-6z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span className="ml-3">{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 font-medium text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-600"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"></circle>
                      <path d="M12 6v6M12 12l4-4"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to your account
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Alternative Options */}
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
                  Register as customer
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Are you a bakery owner?{" "}
                <Link href="/register/bakery" className="font-medium text-amber-600 hover:text-amber-700">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                ← Go back home
              </Link>
            </div>
            <span className="text-xs text-gray-400">
              © {new Date().getFullYear()} God's Cake. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
