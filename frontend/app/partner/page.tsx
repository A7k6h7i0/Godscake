"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";

type PartnerOrder = {
  _id: string;
  status: "Placed" | "Accepted" | "Preparing" | "Arrived" | "Out for Delivery" | "Delivered";
  createdAt: string;
  deliveryAddress: string;
  totalPrice: number;
  deliveryDistanceKm?: number;
  deliveryPayout?: number;
  bakeryId?: { name?: string; address?: string };
  userId?: { name?: string; phone?: string };
};

function PartnerDashboardInner() {
  const [availableOrders, setAvailableOrders] = useState<PartnerOrder[]>([]);
  const [myOrders, setMyOrders] = useState<PartnerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [availableRes, mineRes] = await Promise.all([
        api.get("/orders/delivery/available", { params: { page: 1, limit: 50 } }),
        api.get("/orders/delivery/my", { params: { page: 1, limit: 50 } }),
      ]);
      setAvailableOrders(availableRes.data.data || []);
      setMyOrders(mineRes.data.data || []);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load delivery dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, []);

  const acceptOrder = async (orderId: string) => {
    try {
      await api.post(`/orders/${orderId}/delivery/accept`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to accept order");
    }
  };

  const totalDelivered = useMemo(() => myOrders.filter((o) => o.status === "Delivered").length, [myOrders]);
  const totalEarnings = useMemo(
    () => myOrders.filter((o) => o.status === "Delivered").reduce((sum, o) => sum + (o.deliveryPayout || 0), 0),
    [myOrders]
  );

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 p-6 text-white">
        <h1 className="text-2xl font-bold">Delivery Partner Panel</h1>
        <p className="text-sm text-emerald-100">Accept orders, navigate to delivery address, and complete deliveries.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-white/15 p-3">
            <p className="text-xs uppercase tracking-wide text-emerald-100">Delivered Orders</p>
            <p className="text-2xl font-bold">{totalDelivered}</p>
          </div>
          <div className="rounded-lg bg-white/15 p-3">
            <p className="text-xs uppercase tracking-wide text-emerald-100">Total Earnings</p>
            <p className="text-2xl font-bold">Rs. {totalEarnings}</p>
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-600">Refreshing orders...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold">Available Placed Orders</h2>
          {availableOrders.length === 0 && <p className="text-sm text-gray-500">No new orders available.</p>}
          {availableOrders.map((order) => (
            <article key={order._id} className="rounded-lg border p-3">
              <p className="font-semibold">Order #{order._id.slice(-8)}</p>
              <p className="text-sm text-gray-600">{order.bakeryId?.name || "Bakery"}</p>
              <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
              <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => acceptOrder(order._id)}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Accept Order
                </button>
                <Link href={`/orders/${order._id}`} className="rounded-full border px-4 py-2 text-sm">
                  View
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-3 rounded-xl border bg-white p-4">
          <h2 className="text-lg font-semibold">My Accepted / Active Orders</h2>
          {myOrders.length === 0 && <p className="text-sm text-gray-500">No assigned orders yet.</p>}
          {myOrders.map((order) => (
            <article key={order._id} className="rounded-lg border p-3">
               <div className="flex items-start justify-between">
                 <div>
                   <p className="font-semibold">Order #{order._id.slice(-8)}</p>
                   <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                   <p className="text-xs text-gray-500">Status: {order.status}</p>
                   <p className="text-xs text-gray-500">Distance: {order.deliveryDistanceKm?.toFixed(2) || "0.00"} km</p>
                   <p className="text-xs text-emerald-700">Payout: Rs. {order.deliveryPayout || 0}</p>
                 </div>
                 <div className="flex gap-2">
                   {order.status === "Arrived" || order.status === "Out for Delivery" ? (
                     <button
                       onClick={() => {
                         if (order.userId?.phone) {
                           window.location.href = `tel:${order.userId.phone}`;
                         }
                       }}
                       className={`rounded-full bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 ${
                         !order.userId?.phone ? "opacity-50 cursor-not-allowed" : ""
                       }`}
                       disabled={!order.userId?.phone}
                     >
                       📞 Call Customer
                     </button>
                   ) : null}
                   <Link href={`/orders/${order._id}`} className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white">
                     Manage
                   </Link>
                 </div>
               </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PartnerPage() {
  return (
    <ProtectedRoute allowRoles={["partner"]}>
      <PartnerDashboardInner />
    </ProtectedRoute>
  );
}
