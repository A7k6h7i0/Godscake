"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Order = {
  _id: string;
  status: "Placed" | "Accepted" | "Preparing" | "Out for Delivery" | "Delivered";
  deliveryAddress: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  deliveryDistanceKm?: number;
  deliveryPayout?: number;
  recipientName?: string;
  recipientPhone?: string;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
  bakeryId?: { name: string; location?: { coordinates: [number, number] } };
  deliveryPartnerId?: { _id?: string; name?: string; email?: string };
  deliveryLocation?: { coordinates: [number, number] };
  statusHistory?: Array<{ status: string; at: string; note?: string }>;
};

const ORDER_STEPS: Order["status"][] = ["Placed", "Accepted", "Preparing", "Out for Delivery", "Delivered"];
const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), { ssr: false });

function OrderInnerPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [partnerNote, setPartnerNote] = useState("");

  const loadOrder = async (withLoading = false) => {
    if (withLoading) setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to fetch order");
    } finally {
      if (withLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadOrder(true);
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    if (order?.status === "Delivered") return undefined;
    const interval = setInterval(() => {
      loadOrder(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [id, order?.status]);

  const advanceStatus = async () => {
    if (!order) return;
    const currentIndex = ORDER_STEPS.indexOf(order.status);
    const nextStatus = ORDER_STEPS[currentIndex + 1];
    if (!nextStatus) return;

    setUpdating(true);
    try {
      await api.patch(`/orders/${order._id}/status`, { status: nextStatus, note: adminNote });
      setAdminNote("");
      await loadOrder(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to update status");
    } finally {
      setUpdating(false);
    }
  };

  const advancePartnerStatus = async () => {
    if (!order) return;
    let nextStatus: "Out for Delivery" | "Delivered" | null = null;
    if (order.status === "Accepted" || order.status === "Preparing") nextStatus = "Out for Delivery";
    if (order.status === "Out for Delivery") nextStatus = "Delivered";
    if (!nextStatus) return;

    setUpdating(true);
    try {
      await api.patch(`/orders/${order._id}/delivery/status`, { status: nextStatus, note: partnerNote });
      setPartnerNote("");
      await loadOrder(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to update delivery status");
    } finally {
      setUpdating(false);
    }
  };

  const acceptAsPartner = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.post(`/orders/${order._id}/delivery/accept`);
      await loadOrder(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to accept order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading order...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!order) return <p>Order not found.</p>;

  const activeStepIndex = ORDER_STEPS.indexOf(order.status);
  const nextStep = ORDER_STEPS[activeStepIndex + 1];
  const isAdmin = user?.role === "admin";
  const isPartner = user?.role === "partner";
  const canPartnerAccept = isPartner && order.status === "Placed" && !order.deliveryPartnerId;
  const nextPartnerStep =
    order.status === "Accepted" || order.status === "Preparing"
      ? "Out for Delivery"
      : order.status === "Out for Delivery"
        ? "Delivered"
        : null;
  const deliveryCoords = order.deliveryLocation?.coordinates;
  const bakeryCoords = order.bakeryId?.location?.coordinates;
  const deliveryLocation =
    deliveryCoords && deliveryCoords.length === 2 ? { lat: deliveryCoords[1], lng: deliveryCoords[0] } : null;
  const bakeryLocation = bakeryCoords && bakeryCoords.length === 2 ? { lat: bakeryCoords[1], lng: bakeryCoords[0] } : null;

  return (
    <section className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>
      <p>
        Status: <span className="font-semibold text-brand-700">{order.status}</span>
      </p>
      <p>Bakery: {order.bakeryId?.name || "N/A"}</p>
      <p>Delivery Address: {order.deliveryAddress}</p>
      {order.recipientName && <p>Recipient: {order.recipientName} ({order.recipientPhone})</p>}
      <p>Total: Rs. {order.totalPrice}</p>
      {isPartner && (
        <p>
          Partner payout: <span className="font-semibold text-emerald-700">Rs. {order.deliveryPayout || 0}</span> (
          {(order.deliveryDistanceKm || 0).toFixed(2)} km)
        </p>
      )}
      <p className="text-sm text-gray-600">Placed at: {new Date(order.createdAt).toLocaleString()}</p>
      <p className="text-sm text-gray-600">Last update: {new Date(order.updatedAt).toLocaleString()}</p>

      <div className="rounded-md border p-3">
        <h2 className="mb-3 text-lg font-semibold">Live Tracking</h2>
        <div className="grid gap-2 md:grid-cols-5">
          {ORDER_STEPS.map((step, index) => {
            const done = index <= activeStepIndex;
            return (
              <div
                key={step}
                className={`rounded-md px-3 py-2 text-center text-sm font-medium ${
                  done ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                }`}
              >
                {step}
              </div>
            );
          })}
        </div>
      </div>

      {(isAdmin || isPartner || order.status === "Out for Delivery" || order.status === "Delivered") && (
        <div className="rounded-md border p-3">
          <h2 className="mb-2 text-lg font-semibold">Delivery Map (Leaflet)</h2>
          <DeliveryMap bakeryLocation={bakeryLocation} deliveryLocation={deliveryLocation} />
        </div>
      )}

      {isAdmin && nextStep && (
        <div className="rounded-md border p-3">
          <h2 className="mb-2 text-lg font-semibold">Admin Control</h2>
          <p className="mb-2 text-sm text-gray-600">Move order to next step: {nextStep}</p>
          <textarea
            className="mb-2 w-full rounded-md border px-3 py-2"
            placeholder="Optional note for timeline"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
          <button
            type="button"
            disabled={updating}
            onClick={advanceStatus}
            className="rounded-md bg-brand-500 px-4 py-2 font-medium text-white"
          >
            {updating ? "Updating..." : `Mark as ${nextStep}`}
          </button>
        </div>
      )}

      {isPartner && nextPartnerStep && (
        <div className="rounded-md border p-3">
          <h2 className="mb-2 text-lg font-semibold">Delivery Partner Control</h2>
          <p className="mb-2 text-sm text-gray-600">Next update: {nextPartnerStep}</p>
          <textarea
            className="mb-2 w-full rounded-md border px-3 py-2"
            placeholder="Optional delivery note"
            value={partnerNote}
            onChange={(e) => setPartnerNote(e.target.value)}
          />
          <button
            type="button"
            disabled={updating}
            onClick={advancePartnerStatus}
            className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white"
          >
            {updating ? "Updating..." : `Mark as ${nextPartnerStep}`}
          </button>
        </div>
      )}

      {canPartnerAccept && (
        <div className="rounded-md border p-3">
          <h2 className="mb-2 text-lg font-semibold">Delivery Partner Control</h2>
          <p className="mb-2 text-sm text-gray-600">This order is unassigned. Accept it to start delivery workflow.</p>
          <button
            type="button"
            disabled={updating}
            onClick={acceptAsPartner}
            className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white"
          >
            {updating ? "Accepting..." : "Accept This Order"}
          </button>
        </div>
      )}

      <div className="rounded-md border p-3">
        <h2 className="mb-2 text-lg font-semibold">Status Timeline</h2>
        <div className="space-y-2">
          {(order.statusHistory || []).map((entry, idx) => (
            <div key={`${entry.status}-${entry.at}-${idx}`} className="rounded bg-gray-50 px-3 py-2 text-sm">
              <p className="font-medium">{entry.status}</p>
              <p className="text-gray-600">{new Date(entry.at).toLocaleString()}</p>
              {entry.note && <p className="text-gray-700">{entry.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border p-3">
        <h2 className="mb-2 text-lg font-semibold">Items</h2>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <p key={`${item.name}-${idx}`} className="text-sm">
              {item.name} x {item.quantity} = Rs. {item.lineTotal}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function OrderPage() {
  return (
    <ProtectedRoute>
      <OrderInnerPage />
    </ProtectedRoute>
  );
}
