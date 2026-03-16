"use client";

import { useEffect, useMemo, useState } from "react";
import BakeryOwnerProtectedRoute from "@/components/BakeryOwnerProtectedRoute";
import { bakeryOwnerApi } from "@/lib/bakeryOwnerApi";
import { useBakeryOwnerAuth } from "@/context/BakeryOwnerAuthContext";
import { useRouter } from "next/navigation";

const STATUS_FLOW = ["Placed", "Accepted", "Preparing", "Out for Delivery", "Delivered"] as const;
const OWNER_STATUS_FLOW = ["Placed", "Accepted", "Preparing"] as const;

type BakeryProfile = {
  _id: string;
  name: string;
  address: string;
  contactEmail?: string;
  phone?: string;
  imageUrl?: string;
  images?: string[];
  timings?: {
    opensAt?: string;
    closesAt?: string;
    daysOpen?: string[];
  };
  location?: {
    coordinates?: [number, number];
  };
};

type MenuItem = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  imageUrls?: string[];
  isAvailable: boolean;
};

type BakeryOrder = {
  _id: string;
  status: (typeof STATUS_FLOW)[number];
  createdAt: string;
  deliveryAddress: string;
  recipientName?: string;
  recipientPhone?: string;
  totalPrice: number;
  items: Array<{ name: string; quantity: number; price: number; lineTotal: number }>;
  userId?: { name?: string; email?: string };
};

const nextOwnerStatusFor = (current: BakeryOrder["status"]) => {
  const index = OWNER_STATUS_FLOW.indexOf(current as (typeof OWNER_STATUS_FLOW)[number]);
  if (index === -1 || index === OWNER_STATUS_FLOW.length - 1) return null;
  return OWNER_STATUS_FLOW[index + 1];
};

export default function BakeryOwnerPage() {
  return (
    <BakeryOwnerProtectedRoute>
      <BakeryOwnerDashboard />
    </BakeryOwnerProtectedRoute>
  );
}

function BakeryOwnerDashboard() {
  const router = useRouter();
  const { isAuthenticated, logout } = useBakeryOwnerAuth();
  const [bakery, setBakery] = useState<BakeryProfile | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<BakeryOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bakeryForm, setBakeryForm] = useState({
    name: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    opensAt: "",
    closesAt: "",
    daysOpen: "Mon, Tue, Wed, Thu, Fri, Sat",
    lat: "",
    lng: "",
    coverImage: "",
    images: "",
  });

  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    imageUrls: "",
    isAvailable: true,
  });
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);

  const handleAuthFailure = (err: any) => {
    if (err?.response?.status === 401) {
      logout();
      router.replace("/login/bakery");
      return true;
    }
    return false;
  };

  const loadBakery = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await bakeryOwnerApi.get("/bakery-owners/bakery");
      const next = res.data.data as BakeryProfile | null;
      setBakery(next);
      if (next) {
        setBakeryForm({
          name: next.name || "",
          address: next.address || "",
          contactEmail: next.contactEmail || "",
          contactPhone: next.phone || "",
          opensAt: next.timings?.opensAt || "",
          closesAt: next.timings?.closesAt || "",
          daysOpen: (next.timings?.daysOpen || []).join(", ") || "",
          lat: next.location?.coordinates?.[1]?.toString() || "",
          lng: next.location?.coordinates?.[0]?.toString() || "",
          coverImage: next.imageUrl || "",
          images: (next.images || []).join(", ") || "",
        });
      }
    } catch (err: any) {
      if (handleAuthFailure(err)) return;
      if (err?.response?.status === 404) {
        setBakery(null);
        return;
      }
      throw err;
    }
  };

  const loadMenuItems = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await bakeryOwnerApi.get("/bakery-owners/menu-items");
      setMenuItems(res.data.data || []);
    } catch (err: any) {
      if (handleAuthFailure(err)) return;
      throw err;
    }
  };

  const loadOrders = async () => {
    if (!isAuthenticated) return;
    try {
      const params = statusFilter === "All" ? {} : { status: statusFilter };
      const res = await bakeryOwnerApi.get("/bakery-owners/orders", { params });
      setOrders(res.data.data || []);
    } catch (err: any) {
      if (handleAuthFailure(err)) return;
      throw err;
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError("");
    try {
      await loadBakery();
      await loadMenuItems();
      await loadOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to load bakery dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshAll();
  }, [isAuthenticated]);

  useEffect(() => {
    loadOrders().catch(() => undefined);
  }, [statusFilter, isAuthenticated]);

  const handleBakerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: bakeryForm.name,
        address: bakeryForm.address,
        contactEmail: bakeryForm.contactEmail,
        contactPhone: bakeryForm.contactPhone,
        opensAt: bakeryForm.opensAt,
        closesAt: bakeryForm.closesAt,
        daysOpen: bakeryForm.daysOpen.split(",").map((d) => d.trim()).filter(Boolean),
        lat: bakeryForm.lat ? Number(bakeryForm.lat) : undefined,
        lng: bakeryForm.lng ? Number(bakeryForm.lng) : undefined,
        coverImage: bakeryForm.coverImage,
        images: bakeryForm.images.split(",").map((i) => i.trim()).filter(Boolean),
      };
      if (bakery) {
        await bakeryOwnerApi.patch("/bakery-owners/bakery", payload);
      } else {
        await bakeryOwnerApi.post("/bakery-owners/bakery", payload);
      }
      await refreshAll();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save bakery profile");
    }
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: menuForm.name,
        description: menuForm.description,
        category: menuForm.category,
        price: Number(menuForm.price),
        imageUrls: menuForm.imageUrls.split(",").map((u) => u.trim()).filter(Boolean),
        isAvailable: menuForm.isAvailable,
      };

      if (editingMenuItem) {
        await bakeryOwnerApi.patch(`/bakery-owners/menu-items/${editingMenuItem._id}`, payload);
      } else {
        await bakeryOwnerApi.post("/bakery-owners/menu-items", payload);
      }

      setMenuForm({ name: "", description: "", category: "", price: "", imageUrls: "", isAvailable: true });
      setEditingMenuItem(null);
      await loadMenuItems();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save menu item");
    }
  };

  const handleMenuEdit = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      price: item.price.toString(),
      imageUrls: (item.imageUrls || []).join(", "),
      isAvailable: item.isAvailable,
    });
  };

  const handleMenuDelete = async (itemId: string) => {
    setError("");
    try {
      await bakeryOwnerApi.delete(`/bakery-owners/menu-items/${itemId}`);
      await loadMenuItems();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete menu item");
    }
  };

  const updateOrderStatus = async (order: BakeryOrder) => {
    const nextStatus = nextOwnerStatusFor(order.status);
    if (!nextStatus) return;
    try {
      await bakeryOwnerApi.patch(`/bakery-owners/orders/${order._id}/status`, { status: nextStatus });
      await loadOrders();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update order status");
    }
  };

  const stats = useMemo(() => {
    const placed = orders.filter((o) => o.status === "Placed").length;
    const preparing = orders.filter((o) => o.status === "Preparing").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const revenue = orders.filter((o) => o.status === "Delivered").reduce((sum, o) => sum + o.totalPrice, 0);
    return { placed, preparing, delivered, revenue };
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c1917] via-[#2a1f1b] to-[#0b0b0c] p-8 shadow-xl">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-200">Bakery Command Center</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Operate, track, and grow in real time.</h1>
            <p className="text-sm text-white/70">Live order visibility and full menu control - designed for production scale.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="New Orders" value={stats.placed} />
            <StatCard label="Preparing" value={stats.preparing} />
            <StatCard label="Delivered" value={stats.delivered} />
            <StatCard label="Revenue" value={`Rs. ${stats.revenue}`} />
          </div>
        </div>

        {loading && <p className="mt-6 text-sm text-white/60">Loading bakery data...</p>}
        {error && <p className="mt-6 text-sm text-red-300">{error}</p>}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Bakery Profile</h2>
            <p className="mt-1 text-sm text-white/60">
              {bakery ? "Update your public-facing details." : "Create your bakery profile to start accepting orders."}
            </p>
            <form className="mt-6 grid gap-4" onSubmit={handleBakerySubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Bakery name"
                  value={bakeryForm.name}
                  onChange={(value) => setBakeryForm((prev) => ({ ...prev, name: value }))}
                  placeholder="Golden Crust" 
                />
                <Field
                  label="Contact email"
                  value={bakeryForm.contactEmail}
                  onChange={(value) => setBakeryForm((prev) => ({ ...prev, contactEmail: value }))}
                  placeholder="orders@goldencrust.com"
                />
              </div>
              <Field
                label="Address"
                value={bakeryForm.address}
                onChange={(value) => setBakeryForm((prev) => ({ ...prev, address: value }))}
                placeholder="14 Lake View Road, Pune"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Contact phone"
                  value={bakeryForm.contactPhone}
                  onChange={(value) => setBakeryForm((prev) => ({ ...prev, contactPhone: value }))}
                  placeholder="+91 99887 66554"
                />
                <Field
                  label="Days open"
                  value={bakeryForm.daysOpen}
                  onChange={(value) => setBakeryForm((prev) => ({ ...prev, daysOpen: value }))}
                  placeholder="Mon, Tue, Wed"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Opens at"
                  value={bakeryForm.opensAt}
                  onChange={(value) => setBakeryForm((prev) => ({ ...prev, opensAt: value }))}
                  placeholder="08:00 AM"
                />
                <Field
                  label="Closes at"
                  value={bakeryForm.closesAt}
                  onChange={(value) => setBakeryForm((prev) => ({ ...prev, closesAt: value }))}
                  placeholder="10:00 PM"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Latitude"
                  value={bakeryForm.lat}
                  onChange={(value) => setBakeryForm((prev) => ({ ...prev, lat: value }))}
                  placeholder="18.5204"
                />
                <Field
                  label="Longitude"
                  value={bakeryForm.lng}
                  onChange={(value) => setBakeryForm((prev) => ({ ...prev, lng: value }))}
                  placeholder="73.8567"
                />
              </div>
              <Field
                label="Cover image URL"
                value={bakeryForm.coverImage}
                onChange={(value) => setBakeryForm((prev) => ({ ...prev, coverImage: value }))}
                placeholder="https://..."
              />
              <Field
                label="Gallery images (comma separated)"
                value={bakeryForm.images}
                onChange={(value) => setBakeryForm((prev) => ({ ...prev, images: value }))}
                placeholder="https://..., https://..."
              />
              <button className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black">
                {bakery ? "Update bakery profile" : "Create bakery profile"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h2 className="text-xl font-semibold">Menu Management</h2>
            <p className="mt-1 text-sm text-white/60">Create, update, and toggle availability instantly.</p>
            <form className="mt-6 grid gap-4" onSubmit={handleMenuSubmit}>
              <Field
                label="Item name"
                value={menuForm.name}
                onChange={(value) => setMenuForm((prev) => ({ ...prev, name: value }))}
                placeholder="Raspberry Tart"
              />
              <Field
                label="Description"
                value={menuForm.description}
                onChange={(value) => setMenuForm((prev) => ({ ...prev, description: value }))}
                placeholder="Butter crust, seasonal berries"
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Category"
                  value={menuForm.category}
                  onChange={(value) => setMenuForm((prev) => ({ ...prev, category: value }))}
                  placeholder="Pastry"
                />
                <Field
                  label="Price"
                  value={menuForm.price}
                  onChange={(value) => setMenuForm((prev) => ({ ...prev, price: value }))}
                  placeholder="220"
                />
              </div>
              <Field
                label="Image URLs (comma separated)"
                value={menuForm.imageUrls}
                onChange={(value) => setMenuForm((prev) => ({ ...prev, imageUrls: value }))}
                placeholder="https://..."
              />
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={menuForm.isAvailable}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, isAvailable: e.target.checked }))}
                />
                Available for ordering
              </label>
              <button className="rounded-xl bg-white/90 px-4 py-3 text-sm font-semibold text-black">
                {editingMenuItem ? "Update menu item" : "Add menu item"}
              </button>
              {editingMenuItem && (
                <button
                  type="button"
                  className="rounded-xl border border-white/20 px-4 py-3 text-sm text-white/70"
                  onClick={() => {
                    setEditingMenuItem(null);
                    setMenuForm({ name: "", description: "", category: "", price: "", imageUrls: "", isAvailable: true });
                  }}
                >
                  Cancel edit
                </button>
              )}
            </form>

            <div className="mt-6 space-y-3">
              {menuItems.length === 0 && <p className="text-sm text-white/60">No menu items yet.</p>}
              {menuItems.map((item) => (
                <div key={item._id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-white/60">{item.category || "Uncategorized"}</p>
                      <p className="mt-2 text-sm text-white/70">Rs. {item.price}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs ${item.isAvailable ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"}`}>
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                    {item.description || "No description"}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="rounded-full border border-white/20 px-3 py-1 text-xs"
                      onClick={() => handleMenuEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="rounded-full border border-red-400/40 px-3 py-1 text-xs text-red-200"
                      onClick={() => handleMenuDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Live Orders</h2>
              <p className="mt-1 text-sm text-white/60">Track and advance each order through the bakery workflow.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-white/50">Filter</span>
              <select
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {(["All", ...STATUS_FLOW] as const).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                className="rounded-xl border border-white/20 px-4 py-2 text-sm"
                onClick={loadOrders}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {orders.length === 0 && <p className="text-sm text-white/60">No orders found.</p>}
            {orders.map((order) => {
              const nextStatus = nextOwnerStatusFor(order.status);
              return (
                <article key={order._id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">Order #{order._id.slice(-8)}</h3>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{order.status}</span>
                      </div>
                      <p className="text-sm text-white/70">Customer: {order.userId?.name || "Guest"}</p>
                      <p className="text-sm text-white/70">Delivery: {order.deliveryAddress}</p>
                      <p className="text-xs text-white/50">Placed at {new Date(order.createdAt).toLocaleString()}</p>
                      <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm text-white/70">
                            <span>
                              {item.name} x {item.quantity}
                            </span>
                            <span>Rs. {item.lineTotal}</span>
                          </div>
                        ))}
                        <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm font-semibold">
                          <span>Total</span>
                          <span>Rs. {order.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {nextStatus ? (
                        <button
                          className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black"
                          onClick={() => updateOrderStatus(order)}
                        >
                          {nextStatus === "Accepted" ? "Accept order" : "Mark preparing"}
                        </button>
                      ) : order.status === "Preparing" ? (
                        <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                          Awaiting delivery partner pickup
                        </div>
                      ) : order.status === "Out for Delivery" ? (
                        <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                          Out for delivery
                        </div>
                      ) : (
                        <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                          Delivered
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="text-sm text-white/70">
      <span className="text-xs uppercase tracking-widest text-white/50">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
      />
    </label>
  );
}
