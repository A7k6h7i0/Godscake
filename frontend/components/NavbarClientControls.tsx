"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBakeryOwnerAuth } from "@/context/BakeryOwnerAuthContext";
import { useCart } from "@/context/CartContext";

export default function NavbarClientControls() {
  const { user, isAuthenticated: isUserAuthenticated, logout: logoutUser } = useAuth();
  const { owner, isAuthenticated: isOwnerAuthenticated, logout: logoutOwner } = useBakeryOwnerAuth();
  const { items } = useCart();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeAccount = () => setAccountOpen(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
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
    <>
      <div className="relative md:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          className="relative z-30 flex h-11 w-11 items-center justify-center rounded-full border border-almond bg-white/80 text-ink shadow-soft transition hover:border-brand-300"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobileMenu}
            className="fixed inset-0 z-10 cursor-default bg-transparent"
          />
        )}

        {mobileMenuOpen && (
          <div className="absolute right-0 top-14 z-20 w-56 rounded-2xl border border-almond bg-white/95 p-4 shadow-lift backdrop-blur">
            <div className="flex flex-col gap-3 text-sm font-medium">
              <Link href="/" className="text-muted transition hover:text-ink" onClick={closeMobileMenu}>
                Home
              </Link>
              <Link href="/bakeries" className="text-muted transition hover:text-ink" onClick={closeMobileMenu}>
                Bakeries
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" className="text-muted transition hover:text-ink" onClick={closeMobileMenu}>
                  Admin Panel
                </Link>
              )}
              {user?.role === "partner" && (
                <Link href="/partner" className="text-muted transition hover:text-ink" onClick={closeMobileMenu}>
                  Partner Panel
                </Link>
              )}
              {showBakeryPanel && (
                <Link href="/bakery-owner" className="text-muted transition hover:text-ink" onClick={closeMobileMenu}>
                  Bakery Panel
                </Link>
              )}
              {showOrders && (
                <Link href="/orders" className="text-muted transition hover:text-ink" onClick={closeMobileMenu}>
                  Orders
                </Link>
              )}
              {showCart && (
                <Link href="/cart" className="text-muted transition hover:text-ink" onClick={closeMobileMenu}>
                  Cart
                  {items.length > 0 && (
                    <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                      {items.length}
                    </span>
                  )}
                </Link>
              )}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((v) => !v);
                    closeMobileMenu();
                  }}
                  className="w-fit rounded-full bg-brand-500 px-3 py-1.5 font-semibold text-white shadow-glow transition hover:bg-brand-600"
                >
                  Account
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="rounded-full border border-almond bg-white px-3 py-1.5 text-xs" onClick={closeMobileMenu}>
                    Login
                  </Link>
                  <Link href="/register" className="rounded-full bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-glow" onClick={closeMobileMenu}>
                    Register
                  </Link>
                </div>
              )}
            </div>
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
    </>
  );
}
