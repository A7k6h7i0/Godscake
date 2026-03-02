"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import BakeryCard from "@/components/BakeryCard";
import { api } from "@/lib/api";

type Bakery = {
  _id: string;
  name: string;
  address: string;
  rating?: number;
  distance?: number | null;
  imageUrl?: string;
};

type Pagination = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const SEARCH_STATE_KEY = "gods_cake_bakery_search_state_v2";

export default function BakeriesPage() {
  const [address, setAddress] = useState("");
  const [search, setSearch] = useState("");
  const [radiusKm, setRadiusKm] = useState(10);
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const canGoPrev = Boolean(pagination?.hasPrevPage);
  const canGoNext = Boolean(pagination?.hasNextPage);

  const summary = useMemo(() => {
    if (!hasSearched) return "Enter delivery location to discover nearby bakeries";
    if (loading) return "Fetching bakeries near you...";
    if (!bakeries.length) return "No bakeries found for current filters";
    const total = pagination?.totalItems ?? bakeries.length;
    return `${total} bakery${total === 1 ? "" : "ies"} available`;
  }, [hasSearched, loading, bakeries.length, pagination?.totalItems]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(SEARCH_STATE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (typeof saved.address === "string") setAddress(saved.address);
      if (typeof saved.search === "string") setSearch(saved.search);
      if (typeof saved.radiusKm === "number") setRadiusKm(saved.radiusKm);
      if (typeof saved.minRating === "number") setMinRating(saved.minRating);
      if (typeof saved.page === "number") setPage(saved.page);
      if (typeof saved.limit === "number") setLimit(saved.limit);
      if (Array.isArray(saved.bakeries)) setBakeries(saved.bakeries);
      if (saved.pagination) setPagination(saved.pagination);
      if (typeof saved.hasSearched === "boolean") setHasSearched(saved.hasSearched);
    } catch {
      // Ignore corrupted session state and continue fresh.
    }
  }, []);

  const persistState = (next: {
    nextBakeries: Bakery[];
    nextPagination: Pagination | null;
    nextPage: number;
  }) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(
      SEARCH_STATE_KEY,
      JSON.stringify({
        address,
        search,
        radiusKm,
        minRating,
        page: next.nextPage,
        limit,
        bakeries: next.nextBakeries,
        pagination: next.nextPagination,
        hasSearched: true,
      })
    );
  };

  const searchNearby = async (nextPage = page, e?: FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      if (address.trim()) {
        const geoRes = await api.get("/bakeries/geocode", { params: { address } });
        const { lat, lng } = geoRes.data.data as { lat: number; lng: number };
        const nearRes = await api.get("/bakeries/nearby", {
          params: {
            latitude: lat,
            longitude: lng,
            radiusKm,
            searchLocation: address,
            page: nextPage,
            limit,
            category: "bakery",
          },
        });
        const nearby = nearRes.data.data || [];
        const filtered = search.trim()
          ? nearby.filter(
              (b: Bakery) =>
                b.name.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase())
            )
          : nearby;
        setBakeries(filtered);
        const nextPagination = nearRes.data.pagination || null;
        setPagination(nextPagination);
        persistState({ nextBakeries: filtered, nextPagination, nextPage });
      } else {
        const listRes = await api.get("/bakeries", {
          params: {
            page: nextPage,
            limit,
            search,
            min_rating: minRating > 0 ? minRating : undefined,
            category: "bakery",
          },
        });
        const nextBakeries = listRes.data.data || [];
        const nextPagination = listRes.data.pagination || null;
        setBakeries(nextBakeries);
        setPagination(nextPagination);
        persistState({ nextBakeries, nextPagination, nextPage });
      }
      setPage(nextPage);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to fetch nearby bakeries");
      setBakeries([]);
      setPagination(null);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SEARCH_STATE_KEY);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-orange-500 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Find cakes from nearby bakeries</h1>
        <p className="mt-1 text-sm text-red-50">Location-first discovery, distance-ranked results, and quick ordering.</p>
      </div>

      <form
        onSubmit={(e) => searchNearby(1, e)}
        className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-6"
      >
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 lg:col-span-2"
          placeholder="Delivery address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2 lg:col-span-2"
          placeholder="Search name/address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="rounded-lg border border-gray-300 px-3 py-2"
          type="number"
          value={radiusKm}
          min={1}
          max={50}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          title="Radius (km)"
        />
        <button className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700" disabled={loading}>
          {loading ? "Searching..." : "Discover"}
        </button>
        <select
          className="rounded-lg border border-gray-300 px-3 py-2"
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
        >
          <option value={0}>Any rating</option>
          <option value={3}>3.0+</option>
          <option value={3.5}>3.5+</option>
          <option value={4}>4.0+</option>
          <option value={4.5}>4.5+</option>
        </select>
        <select className="rounded-lg border border-gray-300 px-3 py-2" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          <option value={12}>12 per page</option>
          <option value={20}>20 per page</option>
          <option value={30}>30 per page</option>
        </select>
      </form>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{summary}</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canGoPrev || loading}
            onClick={() => searchNearby(page - 1)}
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded-full border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canGoNext || loading}
            onClick={() => searchNearby(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bakeries.map((bakery) => (
          <BakeryCard key={bakery._id} bakery={bakery} />
        ))}
      </div>
    </section>
  );
}
