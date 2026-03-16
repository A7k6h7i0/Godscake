"use client";

import { AuthProvider } from "@/context/AuthContext";
import { BakeryOwnerAuthProvider } from "@/context/BakeryOwnerAuthContext";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BakeryOwnerAuthProvider>
        <CartProvider>{children}</CartProvider>
      </BakeryOwnerAuthProvider>
    </AuthProvider>
  );
}
