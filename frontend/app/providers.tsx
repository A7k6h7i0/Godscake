"use client";

import { AuthProvider } from "@/context/AuthContext";
import { BakeryOwnerAuthProvider } from "@/context/BakeryOwnerAuthContext";
import { CartProvider } from "@/context/CartContext";
import { LocationProvider } from "@/context/LocationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BakeryOwnerAuthProvider>
        <LocationProvider>
          <CartProvider>{children}</CartProvider>
        </LocationProvider>
      </BakeryOwnerAuthProvider>
    </AuthProvider>
  );
}
