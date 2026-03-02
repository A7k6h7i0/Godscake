"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";

type AdminOrder = {
  _id: string;
  status: "Placed" | "Accepted" | "Preparing" | "Out for Delivery" | "Delivered";
  totalPrice: number;
  createdAt: string;
  deliveryAddress: string;
  bakeryId?: { name?: string };
  userId?: { name?: string; email?: string };
};

const statuses = ["All", "Placed", "Accepted", "Preparing", "Out for Delivery", "Delivered"] as const;

function AdminPageInner() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = status === "All" ? {} : { status };
      const res = await api.get("/orders", { params });
      setOrders(res.data.data || []);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [status]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
        <h1 className="text-2xl font-bold">Admin Operations</h1>
        <p className="text-sm text-slate-200">Manage live orders and delivery progression.</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Filter:</span>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-gray-600">Loading orders...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-3">
        {orders.map((order) => (
          <article key={order._id} className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">Order #{order._id.slice(-8)}</h2>
                <p className="text-sm text-gray-600">{order.bakeryId?.name || "Unknown bakery"}</p>
                <p className="text-sm text-gray-600">{order.userId?.name || order.userId?.email || "Unknown user"}</p>
                <p className="text-sm text-gray-500">{order.deliveryAddress}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="mb-2 text-sm font-semibold text-red-600">{order.status}</p>
                <p className="mb-3 text-sm">Rs. {order.totalPrice}</p>
                <Link href={`/orders/${order._id}`} className="rounded-full bg-red-600 px-4 py-2 text-sm text-white">
                  Open Order
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowRoles={["admin"]}>
      <AdminPageInner />
    </ProtectedRoute>
  );
}
