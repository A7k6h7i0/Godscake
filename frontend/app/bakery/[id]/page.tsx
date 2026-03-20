"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

type MenuItem = {
  _id: string;
  bakeryId: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  imageUrls?: string[];
  isAvailable: boolean;
};

type Cake = {
  _id: string;
  bakeryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
};

type DisplayItem = {
  id: string;
  type: "menu" | "cake";
  name: string;
  description?: string;
  category?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
};

type Bakery = { _id: string; name: string; address: string; phone?: string; timings?: { opensAt?: string; closesAt?: string; daysOpen?: string[] } };

export default function BakeryDetailsPage() {
  const params = useParams<{ id: string | string[] }>();
  const rawBakeryId = params.id;
  const bakeryId = Array.isArray(rawBakeryId) ? rawBakeryId[0] : rawBakeryId;
  const { addToCart, items } = useCart();
  const { toast } = useToast();

  const [bakery, setBakery] = useState<Bakery | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [bakeryRes, menuItemsRes, cakesRes] = await Promise.all([
          api.get(`/bakeries/${bakeryId}`),
          api.get(`/bakeries/${bakeryId}/menu-items`),
          api.get(`/bakeries/${bakeryId}/cakes`),
        ]);
        setBakery(bakeryRes.data.data);
        setMenuItems(menuItemsRes.data.data || []);
        setCakes(cakesRes.data.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load bakery");
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Unable to load bakery",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    if (bakeryId) load();
  }, [bakeryId, toast]);

  if (loading) {
    return (
      <section className="min-h-[calc(100vh-4rem)]">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col">
          <header className="bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <span>God's Cake</span>
              </Link>
              <div className="flex items-center gap-3">
                <Link href="/cart" className="relative">
                  <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M20.49 7.99a2 2 0 00-.93-2.41L16 3h-3.5a2 2 0 00-1.41.59l-.83 2.17H6a2 2 0 00-2 2v1h1.25a2 2 0 001.6.59l.75 2H2v2a2 2 0 002 2h12a2 2 0 002-2v-1.59"></path>
                  </svg>
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      {items.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1 flex-col items-center justify-center py-12 px-4">
            <div className="w-full max-w-4xl space-y-8">
              <div className="text-center">
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-brand-50">
                  <svg className="h-5 w-5 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l8.49 8.49a2 2 0 010 2.83l-6.34 6.35a2 2 0 01-2.83 0l-2.83-2.83-6.34 6.35a2 2 0 010-2.83l8.49-8.49z"></path>
                    <path d="M12 12a3 3 0 100 6 3 3 0 000-6z"></path>
                  </svg>
                </div>
                <h2 className="mt-4 text-3xl font-bold text-gray-900">Loading bakery details...</h2>
                <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the bakery information.</p>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="min-h-[calc(100vh-4rem)]">
        <div className="flex min-h-[calc(100vh-4rem)] flex-col">
          <header className="bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <span>God's Cake</span>
              </Link>
              <div className="flex items-center gap-3">
                <Link href="/cart" className="relative">
                  <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M20.49 7.99a2 2 0 00-.93-2.41L16 3h-3.5a2 2 0 00-1.41.59l-.83 2.17H6a2 2 0 00-2 2v1h1.25a2 2 0 001.6.59l.75 2H2v2a2 2 0 002 2h12a2 2 0 002-2v-1.59"></path>
                  </svg>
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      {items.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1 py-12">
            <div className="mx-auto max-w-xl">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
                    >
                      Try Again
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0L9 4l5-5 5 5-5 5"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

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
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {items.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        {items.length > 0 && (
          <div className="sticky top-[72px] z-20 border-b border-almond bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{items.length} item(s) in cart</span>
              </div>
              <Link href="/cart" className="flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600">
                View Cart
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-4xl w-full space-y-8">
            {/* Bakery Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-48 w-48 bg-gradient-to-br from-orange-500 via-rose-500 to-red-600 flex items-center justify-center">
                      <svg className="h-24 w-24 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l8.49 8.49a2 2 0 010 2.83l-6.34 6.35a2 2 0 01-2.83 0l-2.83-2.83-6.34 6.35a2 2 0 010-2.83l8.49-8.49z"></path>
                        <path d="M12 12a3 3 0 100 6 3 3 0 000-6z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">{bakery?.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                      </svg>
                      <span>{bakery?.address}</span>
                    </div>
                    {bakery?.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.39-1.39a2 2 0 012.11-.45z"></path>
                        </svg>
                        <span>{bakery.phone}</span>
                      </div>
                    )}
                    {bakery?.timings && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 8v4l3 3"></path>
                          <path d="M5 12h14"></path>
                        </svg>
                        <span>
                          Hours: {bakery.timings.opensAt || "-"} - {bakery.timings.closesAt || "-"} 
                          {bakery.timings.daysOpen?.length ? `(${bakery.timings.daysOpen.join(", ")})` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs for Menu Items and Cakes */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-2xl font-bold text-gray-900">Our Specialties</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {}}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      true ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Menu Items
                  </button>
                  <button
                    onClick={() => {}}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      true ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-brand-500 text-white'
                    }`}
                  >
                    Cakes
                  </button>
                </div>
              </div>

              {/* Display Items Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(() => {
                  const displayItems: DisplayItem[] = [
                    ...menuItems.map((item) => ({
                      id: item._id,
                      type: "menu" as const,
                      name: item.name,
                      description: item.description,
                      category: item.category,
                      price: item.price,
                      imageUrl: item.imageUrls?.[0],
                      isAvailable: item.isAvailable,
                    })),
                    ...cakes.map((cake) => ({
                      id: cake._id,
                      type: "cake" as const,
                      name: cake.name,
                      description: cake.description,
                      category: "Cake",
                      price: cake.price,
                      imageUrl: cake.imageUrl,
                      isAvailable: cake.isAvailable,
                    })),
                  ];

                  if (displayItems.length === 0) {
                    return (
                      <div className="col-span-full text-center py-12">
                        <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No items available</h3>
                        <p className="text-sm text-gray-600">
                          This bakery currently doesn't have any items available. Please check back later.
                        </p>
                      </div>
                    );
                  }

                  return displayItems.map((item) => (
                    <Link key={`${item.type}-${item.id}`} href={`/bakery/${bakeryId}/item/${item.id}`} className="group">
                      <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-0.5">
                        <img
                          src={item.imageUrl || "/placeholder-cake.jpg"}
                          alt={item.name}
                          className="h-48 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-cake.jpg";
                          }}
                        />
                        <div className="p-6 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="12 2 15.09 8.26 22 9.27 13 14.29 15.45 20.05 12 16.77 8.55 20.05 11 14.29 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <span className="text-sm font-medium text-yellow-600">
                                  {item.category || "Specialty"}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {item.description || "Freshly made with love and the finest ingredients"}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-2xl font-bold text-red-600">Rs. {item.price}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                if (!bakeryId || !item.isAvailable) return;
                                addToCart({
                                  cakeId: item.type === "cake" ? item.id : undefined,
                                  menuItemId: item.type === "menu" ? item.id : undefined,
                                  bakeryId,
                                  name: item.name,
                                  price: item.price,
                                  imageUrl: item.imageUrl,
                                });
                                toast({
                                  title: "Added to cart!",
                                  description: `${item.name} has been added to your cart`,
                                });
                              }}
                              disabled={!item.isAvailable}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                !item.isAvailable
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20'
                              }`}
                            >
                              {item.isAvailable ? "Add to cart" : "Out of stock"}
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ));
                })()}
              </div>
            </div>
          </div>
        </main>

      </div>
    </section>
  );
}

