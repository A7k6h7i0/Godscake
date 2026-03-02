"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const [accountOpen, setAccountOpen] = useState(false);

  const closeAccount = () => setAccountOpen(false);
  const initial = (user?.name?.trim()?.charAt(0) || "U").toUpperCase();

  return (
    <nav className="sticky top-0 z-10 border-b border-red-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight text-red-600">
          God&apos;s Cake
        </Link>
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              aria-label="Open account menu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-semibold text-white"
            >
              {initial}
            </button>
          )}
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-full border px-3 py-1.5 text-sm">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold text-white">
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/bakeries" className="hover:text-red-600">
            Bakeries
          </Link>
          {user?.role === "admin" ? (
            <Link href="/admin" className="hover:text-red-600">
              Admin Panel
            </Link>
          ) : user?.role === "partner" ? (
            <Link href="/partner" className="hover:text-red-600">
              Partner Panel
            </Link>
          ) : (
            <>
              <Link href="/orders" className="hover:text-red-600">
                Orders
              </Link>
              <Link href="/cart" className="hover:text-red-600">
                Cart ({items.length})
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Open account menu"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-semibold text-white hover:bg-red-700"
              >
                {initial}
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="hover:text-red-600">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-red-600 px-3 py-1.5 font-semibold text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {accountOpen && isAuthenticated && (
        <div className="absolute right-4 top-16 z-20 w-64 rounded-lg border bg-white p-3 shadow-lg">
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="mb-3 text-xs text-gray-500">{user?.email}</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/bakeries" className="hover:text-red-600" onClick={closeAccount}>
              Bakeries
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="hover:text-red-600" onClick={closeAccount}>
                Admin Panel
              </Link>
            )}
            {user?.role === "partner" && (
              <Link href="/partner" className="hover:text-red-600" onClick={closeAccount}>
                Partner Panel
              </Link>
            )}
            {user?.role === "user" && (
              <>
                <Link href="/orders" className="hover:text-red-600" onClick={closeAccount}>
                  Orders
                </Link>
                <Link href="/cart" className="hover:text-red-600" onClick={closeAccount}>
                  Cart ({items.length})
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                closeAccount();
              }}
              className="mt-1 w-fit rounded-full bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
