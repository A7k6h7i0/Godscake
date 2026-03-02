"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";

type UserOrder = {
  _id: string;
  status: "Placed" | "Accepted" | "Preparing" | "Out for Delivery" | "Delivered";
  totalPrice: number;
  createdAt: string;
  deliveryAddress: string;
  bakeryId?: { name?: string };
};

const ACTIVE_STATUSES: UserOrder["status"][] = ["Placed", "Accepted", "Preparing", "Out for Delivery"];

function OrdersPageInner() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders", { params: { page: 1, limit: 50 } });
      const data = (res.data.data || []) as UserOrder[];
      const filtered = data.filter((order) => ACTIVE_STATUSES.includes(order.status));
      setOrders(filtered);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, 10000);
    return () => clearInterval(timer);
  }, []);

  const totalActive = useMemo(() => orders.length, [orders.length]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">My Active Orders</h1>
        <p className="text-sm text-gray-600">
          Track order progress in real time. Delivered orders are automatically hidden.
        </p>
        <p className="mt-2 text-sm font-medium text-red-600">Active: {totalActive}</p>
      </div>

      {loading && <p className="text-sm text-gray-600">Refreshing orders...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-3">
        {orders.length === 0 ? (
          <article className="rounded-lg border bg-white p-4 text-sm text-gray-600">
            No active orders right now.
          </article>
        ) : (
          orders.map((order) => (
            <article key={order._id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">Order #{order._id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">{order.bakeryId?.name || "Bakery"}</p>
                  <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-sm font-semibold text-red-600">{order.status}</p>
                  <p className="mb-3 text-sm">Rs. {order.totalPrice}</p>
                  <Link href={`/orders/${order._id}`} className="rounded-full bg-red-600 px-4 py-2 text-xs text-white">
                    Track
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowRoles={["user"]}>
      <OrdersPageInner />
    </ProtectedRoute>
  );
}
