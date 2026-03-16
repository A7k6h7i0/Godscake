"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBakeryOwnerAuth } from "@/context/BakeryOwnerAuthContext";

export default function BakeryOwnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useBakeryOwnerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login/bakery");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return <p className="p-6 text-sm text-gray-600">Redirecting to bakery login...</p>;
  return <>{children}</>;
}
