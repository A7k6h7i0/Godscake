"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AuthUser, getStoredUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      } else {
        router.push("/bakeries");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Login</h1>
        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button 
            className="w-full rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-red-600 hover:underline">
            Register as customer
          </Link>
        </p>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Are you a bakery owner?{" "}
          <Link href="/register/bakery" className="text-amber-600 hover:underline">
            Register here
          </Link>
        </p>
      </section>
    </main>
  );
}
