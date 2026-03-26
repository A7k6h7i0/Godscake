"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function PartnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login/partner");
      return;
    }

    if (user?.role && user.role !== "partner") {
      router.replace("/");
    }
  }, [isAuthenticated, router, user?.role]);

  if (!isAuthenticated) return <p className="p-6 text-sm text-gray-600">Redirecting to delivery partner login...</p>;
  if (user?.role && user.role !== "partner") {
    return <p className="p-6 text-sm text-gray-600">Access restricted...</p>;
  }

  return <>{children}</>;
}
