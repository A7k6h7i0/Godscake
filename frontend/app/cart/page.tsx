"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";

function CartInnerPage() {
  const router = useRouter();
  const { items, total, removeFromCart, updateQuantity, clearCart, bakeryId } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [sendToOther, setSendToOther] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!bakeryId || items.length === 0) return;
    setPlacing(true);
    setError("");
    try {
      // Transform cart items to include both cakeId and menuItemId
      const orderItems = items.map((item) => ({
        cakeId: item.cakeId || undefined,
        menuItemId: item.menuItemId || undefined,
        quantity: item.quantity,
      }));
      
      const res = await api.post("/orders", {
        bakeryId,
        deliveryAddress,
        recipientName: sendToOther ? recipientName : "",
        recipientPhone: sendToOther ? recipientPhone : "",
        items: orderItems,
      });
      const orderId = res.data.data._id as string;
      clearCart();
      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  // Helper to get unique identifier for cart item
  const getItemId = (item: { cakeId?: string; menuItemId?: string }) => item.cakeId || item.menuItemId || "";

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold">Cart</h1>
        {items.length === 0 ? (
          <p className="mt-3 text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const itemId = getItemId(item);
              return (
                <div key={itemId} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Rs. {item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      className="w-16 rounded border px-2 py-1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(itemId, Number(e.target.value))}
                    />
                    <button type="button" className="text-sm text-red-600" onClick={() => removeFromCart(itemId)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">Checkout</h2>
        <p className="mt-1 text-sm text-gray-600">Total: Rs. {total}</p>
        <form className="mt-4 space-y-3" onSubmit={placeOrder}>
          <textarea
            className="w-full rounded-md border px-3 py-2"
            placeholder="Delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sendToOther} onChange={(e) => setSendToOther(e.target.checked)} />
            Send to someone else
          </label>
          {sendToOther && (
            <>
              <input
                className="w-full rounded-md border px-3 py-2"
                placeholder="Recipient name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
              <input
                className="w-full rounded-md border px-3 py-2"
                placeholder="Recipient phone"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                required
              />
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={placing || items.length === 0}
            className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placing ? "Placing order..." : "Place order"}
          </button>
        </form>
      </aside>
    </section>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartInnerPage />
    </ProtectedRoute>
  );
}
