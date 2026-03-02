"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CakeCard from "@/components/CakeCard";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";

type Cake = {
  _id: string;
  bakeryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

type Bakery = { _id: string; name: string; address: string };

export default function BakeryDetailsPage() {
  const params = useParams<{ id: string | string[] }>();
  const rawBakeryId = params.id;
  const bakeryId = Array.isArray(rawBakeryId) ? rawBakeryId[0] : rawBakeryId;
  const { addToCart, items } = useCart();

  const [bakery, setBakery] = useState<Bakery | null>(null);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [bakeryRes, cakesRes] = await Promise.all([
          api.get(`/bakeries/${bakeryId}`),
          api.get(`/bakeries/${bakeryId}/cakes`),
        ]);
        setBakery(bakeryRes.data.data);
        setCakes(cakesRes.data.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load bakery");
      } finally {
        setLoading(false);
      }
    };
    if (bakeryId) load();
  }, [bakeryId]);

  if (loading) return <p>Loading bakery...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section className="space-y-5">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold">{bakery?.name}</h1>
        <p className="text-sm text-gray-600">{bakery?.address}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cakes.map((cake) => (
          <CakeCard
            key={cake._id}
            cake={cake}
            onAdd={() => {
              if (!bakeryId) return;
              addToCart({
                cakeId: cake._id,
                bakeryId,
                name: cake.name,
                price: cake.price,
                imageUrl: cake.imageUrl,
              });
              setAddedMessage(`${cake.name} added to cart`);
              setTimeout(() => setAddedMessage(""), 1500);
            }}
          />
        ))}
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
