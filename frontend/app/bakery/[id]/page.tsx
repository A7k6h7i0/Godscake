"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Skeleton from "@/components/Skeleton";
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

  const [bakery, setBakery] = useState<Bakery | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

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
      } finally {
        setLoading(false);
      }
    };
    if (bakeryId) load();
  }, [bakeryId]);

  if (loading) {
    return (
      <section className="space-y-5">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={`menu-skeleton-${idx}`} className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <Skeleton className="h-44 w-full" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section className="space-y-5">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold">{bakery?.name}</h1>
        <p className="text-sm text-gray-600">{bakery?.address}</p>
        {bakery?.phone && <p className="text-sm text-gray-600">Phone: {bakery.phone}</p>}
        {bakery?.timings && (
          <p className="text-sm text-gray-600">
            Hours: {bakery.timings.opensAt || "-"} - {bakery.timings.closesAt || "-"} ({bakery.timings.daysOpen?.join(", ") || ""})
          </p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            return <p className="text-gray-600">No items available at the moment.</p>;
          }

          return displayItems.map((item) => (
            <article key={`${item.type}-${item.id}`} className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <img
                src={item.imageUrl || "https://placehold.co/600x400"}
                alt={item.name}
                className="h-44 w-full object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-xs text-amber-600 uppercase tracking-wide">{item.category || "General"}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      item.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description || "Freshly made"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-red-600">Rs. {item.price}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!bakeryId || !item.isAvailable) return;
                      addToCart({
                        cakeId: item.type === "cake" ? item.id : undefined,
                        menuItemId: item.type === "menu" ? item.id : undefined,
                        bakeryId,
                        name: item.name,
                        price: item.price,
                        imageUrl: item.imageUrl,
                      });
                      setAddedMessage(`${item.name} added to cart`);
                      setTimeout(() => setAddedMessage(""), 1500);
                    }}
                    disabled={!item.isAvailable}
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {item.isAvailable ? "Add to cart" : "Out of stock"}
                  </button>
                </div>
              </div>
            </article>
          ));
        })()}
      </div>
      <div className="flex items-center justify-between rounded-lg border bg-white p-3">
        <p className="text-sm text-gray-700">{addedMessage || `${items.length} item(s) currently in cart`}</p>
        <Link href="/cart" className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          Go to cart
        </Link>
      </div>
    </section>
  );
}
