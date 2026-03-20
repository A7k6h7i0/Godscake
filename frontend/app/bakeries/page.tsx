"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import BakeryCard from "@/components/BakeryCard";
import Skeleton from "@/components/Skeleton";
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
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;
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

  const skeletonCount = Math.min(Math.max(limit, 6), 12);
  const radiusSteps = [10, 25, 50, 80];

    useEffect(() => {
      if (typeof window === "undefined") return;
      const raw = sessionStorage.getItem(SEARCH_STATE_KEY);
      if (!raw) {
        // Try to get user's current location on first load
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              // Reverse geocode to get address for display/storage
              api.get("/bakeries/geocode", { 
                params: { 
                  lat: latitude, 
                  lng: longitude 
                } 
              }).then((geoRes) => {
                const { address } = geoRes.data.data || {};
                if (address) {
                  setAddress(address);
                }
                // Search for nearby bakeries using coordinates directly
                searchNearbyWithCoords(1, latitude, longitude);
              }).catch(() => {
                // If reverse geocoding fails, still search with coordinates
                searchNearbyWithCoords(1, latitude, longitude);
              });
            },
            (error) => {
              console.warn("Geolocation not available or denied", error);
              // Fall back to session storage or empty state
              const raw = sessionStorage.getItem(SEARCH_STATE_KEY);
              if (raw) {
                try {
                  const saved = JSON.parse(raw);
                  if (typeof saved.address === "string") setAddress(saved.address);
                  if (typeof saved.search === "string") setSearch(saved.search);
                  if (typeof saved.minRating === "number") setMinRating(saved.minRating);
                  if (typeof saved.page === "number") setPage(saved.page);
                  if (Array.isArray(saved.bakeries)) setBakeries(saved.bakeries);
                  if (saved.pagination) setPagination(saved.pagination);
                  if (typeof saved.hasSearched === "boolean") setHasSearched(saved.hasSearched);
                } catch {
                  // Ignore corrupted session state
                }
              }
            }
          );
        } else {
          // Geolocation not supported, fall back to session storage
          const raw = sessionStorage.getItem(SEARCH_STATE_KEY);
          if (raw) {
            try {
              const saved = JSON.parse(raw);
              if (typeof saved.address === "string") setAddress(saved.address);
              if (typeof saved.search === "string") setSearch(saved.search);
              if (typeof saved.minRating === "number") setMinRating(saved.minRating);
              if (typeof saved.page === "number") setPage(saved.page);
              if (Array.isArray(saved.bakeries)) setBakeries(saved.bakeries);
              if (saved.pagination) setPagination(saved.pagination);
              if (typeof saved.hasSearched === "boolean") setHasSearched(saved.hasSearched);
            } catch {
              // Ignore corrupted session state
            }
          }
        }
      } else {
        // Load from session storage as before
        try {
          const saved = JSON.parse(raw);
          if (typeof saved.address === "string") setAddress(saved.address);
          if (typeof saved.search === "string") setSearch(saved.search);
          if (typeof saved.minRating === "number") setMinRating(saved.minRating);
          if (typeof saved.page === "number") setPage(saved.page);
          if (Array.isArray(saved.bakeries)) setBakeries(saved.bakeries);
          if (saved.pagination) setPagination(saved.pagination);
          if (typeof saved.hasSearched === "boolean") setHasSearched(saved.hasSearched);
        } catch {
          // Ignore corrupted session state and continue fresh.
        }
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
        minRating,
        page: next.nextPage,
        limit,
        bakeries: next.nextBakeries,
        pagination: next.nextPagination,
        hasSearched: true,
      })
    );
  };

   const fetchNearbyWithFallback = async (args: {
     latitude: number;
     longitude: number;
     nextPage: number;
     searchLocation: string;
   }) => {
     let finalResponse: any = null;
     for (const radiusKm of radiusSteps) {
       const nearRes = await api.get("/bakeries/nearby", {
         params: {
           latitude: args.latitude,
           longitude: args.longitude,
           radiusKm,
           searchLocation: args.searchLocation,
           page: args.nextPage,
           limit,
           category: "bakery",
         },
       });
       finalResponse = nearRes;
       const nearby = nearRes.data.data || [];
       if (nearby.length >= limit) break;
     }
     return finalResponse;
   };

   const searchNearbyWithCoords = async (nextPage = page, latitude: number, longitude: number, e?: FormEvent) => {
     if (e) e.preventDefault();
     setLoading(true);
     setError("");
     setHasSearched(true);
     try {
       const nearRes = await fetchNearbyWithFallback({
         latitude,
         longitude,
         nextPage,
         searchLocation: `${latitude},${longitude}`,
       });
       const nearby = nearRes?.data?.data || [];
       const filtered = search.trim()
         ? nearby.filter(
             (b: Bakery) =>
               b.name.toLowerCase().includes(search.toLowerCase()) || b.address.toLowerCase().includes(search.toLowerCase())
           )
         : nearby;
       setBakeries(filtered);
       const nextPagination = nearRes?.data?.pagination || null;
       setPagination(nextPagination);
       persistState({ nextBakeries: filtered, nextPagination, nextPage });
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

   const searchNearby = async (nextPage = page, e?: FormEvent) => {
     if (e) e.preventDefault();
     setLoading(true);
     setError("");
     setHasSearched(true);
     try {
       if (address.trim()) {
         const geoRes = await api.get("/bakeries/geocode", { params: { address } });
         const { lat, lng } = geoRes.data.data as { lat: number; lng: number };
         const nearRes = await fetchNearbyWithFallback({
           latitude: lat,
           longitude: lng,
           nextPage,
           searchLocation: address,
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
    <section className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Find Cakes from Nearby Bakeries
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Discover bakeries near your delivery location, browse their cakes, place orders, and track status in real time.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={(e) => searchNearby(1, e)}
        className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery address (optional)</label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder="Enter your address for better results"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search name/address</label>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder="Search bakeries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            >
              <option value={0}>Any rating</option>
              <option value={3}>3.0+</option>
              <option value={3.5}>3.5+</option>
              <option value={4}>4.0+</option>
              <option value={4.5}>4.5+</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-brand-600 transition-colors transform hover:-translate-y-0.5 shadow-lg shadow-brand-500/20 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3"></circle>
                    <path d="M12 6v6M12 12l4-4"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Discover Bakeries
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Summary and Pagination */}
      <div className="flex items-center justify-between px-4">
        <p className="text-sm text-gray-600">{summary}</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canGoPrev || loading}
            onClick={() => searchNearby(page - 1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              !canGoPrev || loading
                ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="15" y1="12" x2="9" y2="12"></line>
              <polyline points="15 12 9 12 12 9"></polyline>
            </svg>
            Prev
          </button>
          <button
            type="button"
            disabled={!canGoNext || loading}
            onClick={() => searchNearby(page + 1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              !canGoNext || loading
                ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
            }`}
          >
            Next
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="9" y1="12" x2="15" y2="12"></line>
              <polyline points="9 12 15 12 12 15"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Results Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && bakeries.length === 0
          ? Array.from({ length: skeletonCount }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] w-2/3"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] w-5/6"></div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-28 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>
              </div>
            ))
          : bakeries.length > 0
            ? bakeries.map((bakery) => (
                <Link key={bakery._id} href={`/bakery/${bakery._id}`} className="group">
                  <BakeryCard bakery={bakery} />
                </Link>
              ))
            : (
              <div className="col-span-full text-center py-12">
                <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bakeries found</h3>
                <p className="text-sm text-gray-600">
                  Try adjusting your search filters or check your spelling.
                </p>
                {!hasSearched && (
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const { latitude, longitude } = position.coords;
                            searchNearbyWithCoords(1, latitude, longitude);
                          },
                          () => {
                            // Fallback to center of India if geolocation fails
                            searchNearbyWithCoords(1, 20.5937, 78.9629);
                          }
                        );
                      }
                    }}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
                  >
                    Use My Location
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l8.49 8.49a2 2 0 010 2.83l-6.34 6.35a2 2 0 01-2.83 0l-2.83-2.83-6.34 6.35a2 2 0 010-2.83l8.49-8.49z"></path>
                      <path d="M12 12a3 3 0 1000 6 3 3 0 000-6z"></path>
                    </svg>
                  </button>
                )}
              </div>
            )}
      </div>
    </section>
  );
}
