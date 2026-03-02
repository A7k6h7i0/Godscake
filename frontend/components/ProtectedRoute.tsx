"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthUser } from "@/lib/auth";

export default function ProtectedRoute({
  children,
  allowRoles,
}: {
  children: React.ReactNode;
  allowRoles?: AuthUser["role"][];
}) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (allowRoles?.length && user && !allowRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [isAuthenticated, user, allowRoles, router]);

  if (!isAuthenticated) return <p className="p-6 text-sm text-gray-600">Redirecting to login...</p>;
  if (allowRoles?.length && user && !allowRoles.includes(user.role)) {
    return <p className="p-6 text-sm text-gray-600">Access restricted...</p>;
  }
  return <>{children}</>;
}
