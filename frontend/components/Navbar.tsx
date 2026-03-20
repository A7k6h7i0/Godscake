"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBakeryOwnerAuth } from "@/context/BakeryOwnerAuthContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated: isUserAuthenticated, logout: logoutUser } = useAuth();
  const { owner, isAuthenticated: isOwnerAuthenticated, logout: logoutOwner } = useBakeryOwnerAuth();
  const { items } = useCart();
  const [accountOpen, setAccountOpen] = useState(false);

  const closeAccount = () => setAccountOpen(false);
  const isAuthenticated = isUserAuthenticated || isOwnerAuthenticated;
  const displayName = isUserAuthenticated ? user?.name : owner?.name;
  const displayEmail = isUserAuthenticated ? user?.email : owner?.email;
  const initial = (displayName?.trim()?.charAt(0) || "U").toUpperCase();
  const showBakeryPanel = isOwnerAuthenticated;
  const showOrders = user?.role === "user" && isUserAuthenticated;
  const showCart = user?.role === "user" && isUserAuthenticated;
  const logoutAll = () => {
    if (isUserAuthenticated) logoutUser();
    if (isOwnerAuthenticated) logoutOwner();
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-almond/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-ink">
          <img src="/gods-cake-logo.svg" alt="God's Cake" className="h-10 w-10 rounded-2xl object-cover shadow-soft" />
          <span className="font-display text-xl">God&apos;s Cake</span>
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/"
            className="rounded-full border border-almond bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand-300"
          >
            Home
          </Link>
          <Link
            href="/bakeries"
            className="rounded-full border border-almond bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand-300"
          >
            Explore
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              aria-label="Open account menu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-semibold text-white shadow-glow"
            >
              {initial}
            </button>
          )}
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-full border border-almond bg-white px-3 py-1.5 text-xs">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-glow">
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link href="/" className="text-muted transition hover:text-ink">
            Home
          </Link>
          <Link href="/bakeries" className="text-muted transition hover:text-ink">
            Bakeries
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="text-muted transition hover:text-ink">
              Admin Panel
            </Link>
          )}
          {user?.role === "partner" && (
            <Link href="/partner" className="text-muted transition hover:text-ink">
              Partner Panel
            </Link>
          )}
          {showBakeryPanel && (
            <Link href="/bakery-owner" className="text-muted transition hover:text-ink">
              Bakery Panel
            </Link>
          )}
          {showOrders && (
            <Link href="/orders" className="text-muted transition hover:text-ink">
              Orders
            </Link>
          )}
          {showCart && (
            <Link href="/cart" className="text-muted transition hover:text-ink">
              Cart
              {items.length > 0 && (
                <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  {items.length}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Open account menu"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-semibold text-white shadow-glow transition hover:bg-brand-600"
              >
                {initial}
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-muted transition hover:text-ink">
                Login
              </Link>
              <Link href="/register" className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {accountOpen && isAuthenticated && (
        <div className="absolute right-4 top-16 z-20 w-72 rounded-2xl border border-almond bg-white/95 p-4 shadow-lift backdrop-blur">
          <p className="font-semibold text-ink">{displayName}</p>
          <p className="mb-3 text-xs text-muted">{displayEmail}</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="text-muted transition hover:text-ink" onClick={closeAccount}>
              Home
            </Link>
            <Link href="/bakeries" className="text-muted transition hover:text-ink" onClick={closeAccount}>
              Bakeries
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="text-muted transition hover:text-ink" onClick={closeAccount}>
                Admin Panel
              </Link>
            )}
            {user?.role === "partner" && (
              <Link href="/partner" className="text-muted transition hover:text-ink" onClick={closeAccount}>
                Partner Panel
              </Link>
            )}
            {showBakeryPanel && (
              <Link href="/bakery-owner" className="text-muted transition hover:text-ink" onClick={closeAccount}>
                Bakery Panel
              </Link>
            )}
            {showOrders && (
              <Link href="/orders" className="text-muted transition hover:text-ink" onClick={closeAccount}>
                Orders
              </Link>
            )}
            {showCart && (
              <Link href="/cart" className="text-muted transition hover:text-ink" onClick={closeAccount}>
                Cart ({items.length})
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                logoutAll();
                closeAccount();
              }}
              className="mt-1 w-fit rounded-full bg-brand-500 px-3 py-1.5 font-semibold text-white shadow-glow transition hover:bg-brand-600"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
