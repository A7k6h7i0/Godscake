"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LocationSelectionModal } from "@/components/LocationSelectionModal";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

function CartInnerPage() {
  const router = useRouter();
  const { items, total, removeFromCart, updateQuantity, clearCart, bakeryId } = useCart();
  const { location, isLocationConfirmed } = useLocation();
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [sendToOther, setSendToOther] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const { toast } = useToast();

  const resolvedDeliveryAddress =
    isLocationConfirmed && location.address
      ? `${location.address}${deliveryNotes ? `, ${deliveryNotes}` : ""}`
      : "";

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!bakeryId || items.length === 0) return;
    if (!isLocationConfirmed) {
      setError("Please confirm a delivery location before placing your order.");
      setLocationModalOpen(true);
      return;
    }
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
        deliveryAddress: resolvedDeliveryAddress,
        recipientName: sendToOther ? recipientName : "",
        recipientPhone: sendToOther ? recipientPhone : "",
        items: orderItems,
      });
      const orderId = res.data.data._id as string;
      clearCart();
      toast({
        title: "Order placed!",
        description: "Your order has been successfully placed.",
      });
      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to place order");
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  };

  // Helper to get unique identifier for cart item
  const getItemId = (item: { cakeId?: string; menuItemId?: string }) => item.cakeId || item.menuItemId || "";

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_10%_20%,rgba(226,55,68,0.07)_0,transparent_30%),radial-gradient(circle_at_90%_10%,rgba(255,149,0,0.08)_0,transparent_30%),var(--z-bg)]">
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <img src="/gods-cake-logo.svg" alt="God's Cake" className="h-8 w-8 rounded-full object-cover" />
              <span>God's Cake</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/cart" className="relative">
                <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M20.49 7.99a2 2 0 00-.93-2.41L16 3h-3.5a2 2 0 00-1.41.59l-.83 2.17H6a2 2 0 00-2 2v1h1.25a2 2 0 001.6.59l.75 2H2v2a2 2 0 002 2h12a2 2 0 002-2v-1.59"></path>
                </svg>
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {items.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-4xl w-full space-y-8">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-600">
                  Add some delicious treats to your cart to get started!
                </p>
                <Link href="/bakeries" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors">
                  Explore Bakeries
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-bold text-gray-900">Your Cart ({items.length})</h2>
                      <Link href="/bakeries" className="text-sm text-brand-500 hover:text-brand-600">
                        Continue shopping
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {items.map((item) => {
                        const itemId = getItemId(item);
                        return (
                          <div key={itemId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-16 w-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                                  if (fallback) fallback.style.display = "block";
                                }}
                              />
                            ) : (
                              <div className="h-16 w-16 bg-gradient-to-br from-orange-500 via-rose-500 to-red-600 flex items-center justify-center rounded-lg">
                                <svg className="h-8 w-8 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 2l8.49 8.49a2 2 0 010 2.83l-6.34 6.35a2 2 0 01-2.83 0l-2.83-2.83-6.34 6.35a2 2 0 010-2.83l8.49-8.49z"></path>
                                  <path d="M12 12a3 3 0 1000 6 3 3 0 000-6z"></path>
                                </svg>
                              </div>
                            )}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {item.description || "Freshly made with love"}
                                  </p>
                                </div>
                                <span
                                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    true ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                  }`}
                                >
                                  In Stock
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(itemId, Math.max(1, (item.quantity || 1) - 1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                                  >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                  </button>
                                  <span className="font-medium text-gray-900">{item.quantity || 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(itemId, (item.quantity || 1) + 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                                  >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <line x1="12" y1="5" x2="12" y2="19"></line>
                                      <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                  </button>
                                </div>
                                <span className="text-2xl font-bold text-red-600">Rs. {item.price * (item.quantity || 1)}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(itemId)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:text-red-700"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Checkout Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
                    <p className="text-sm text-gray-600">Total: Rs. {total}</p>
                    <form className="mt-4 space-y-4" onSubmit={placeOrder}>
                      <div className="rounded-xl border border-almond bg-cream/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted">Delivery location</p>
                            {isLocationConfirmed ? (
                              <p className="mt-2 text-sm font-medium text-ink">{location.address}</p>
                            ) : (
                              <p className="mt-2 text-sm text-red-600">
                                Please confirm your delivery location to continue.
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setLocationModalOpen(true)}
                            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-600"
                          >
                            {isLocationConfirmed ? "Change location" : "Select location"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery notes (optional)</label>
                        <textarea
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                          placeholder="Apartment, floor, gate code, instructions..."
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={sendToOther}
                            onChange={(e) => setSendToOther(e.target.checked)}
                            className="h-4 w-4 text-brand-500 rounded border-gray-300 focus:ring-brand-500"
                          />
                          Send to someone else
                        </label>
                      </div>
                      
                      {sendToOther && (
                        <>
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient name</label>
                            <input
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                              placeholder="Enter recipient name"
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient phone</label>
                            <input
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                              placeholder="Enter recipient phone"
                              value={recipientPhone}
                              onChange={(e) => setRecipientPhone(e.target.value)}
                              required
                              pattern="[0-9]{10}"
                            />
                          </div>
                        </>
                      )}
                      
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
                      
                      <button
                        type="submit"
                        disabled={placing || items.length === 0 || !isLocationConfirmed}
                        className="w-full bg-brand-500 text-white font-medium px-5 py-3 rounded-lg hover:bg-brand-600 transition-colors transform hover:-translate-y-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                      >
                        {placing ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" strokeOpacity="0.3"></circle>
                              <path d="M12 6v6M12 12l4-4"></path>
                            </svg>
                            Placing order...
                          </>
                        ) : (
                          <>
                            Place order
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        <LocationSelectionModal
          isOpen={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          onLocationConfirmed={(_lat, _lng, _address) => {
            setError("");
          }}
        />

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{items.length} item(s) in cart</span>
              </div>
            </div>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Continue shopping
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartInnerPage />
    </ProtectedRoute>
  );
}
