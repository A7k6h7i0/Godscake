"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { bakeryOwnerApi } from "@/lib/bakeryOwnerApi";
import {
  BakeryOwnerUser,
  clearBakeryOwnerToken,
  clearStoredBakeryOwner,
  getBakeryOwnerToken,
  getStoredBakeryOwner,
  setBakeryOwnerToken,
  setStoredBakeryOwner,
} from "@/lib/bakeryOwnerAuth";

type BakeryOwnerAuthContextValue = {
  owner: BakeryOwnerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
};

const BakeryOwnerAuthContext = createContext<BakeryOwnerAuthContextValue | undefined>(undefined);

export const BakeryOwnerAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [owner, setOwner] = useState<BakeryOwnerUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setOwner(getStoredBakeryOwner());
    setTokenState(getBakeryOwnerToken());
  }, []);

  const login = async (email: string, password: string) => {
    const response = await bakeryOwnerApi.post("/bakery-owners/login", { email, password });
    const nextToken = response.data.data.token as string;
    const nextOwner = response.data.data.owner as BakeryOwnerUser;
    setBakeryOwnerToken(nextToken);
    setStoredBakeryOwner(nextOwner);
    setTokenState(nextToken);
    setOwner(nextOwner);
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const response = await bakeryOwnerApi.post("/bakery-owners/register", payload);
    const nextToken = response.data.data.token as string;
    const nextOwner = response.data.data.owner as BakeryOwnerUser;
    setBakeryOwnerToken(nextToken);
    setStoredBakeryOwner(nextOwner);
    setTokenState(nextToken);
    setOwner(nextOwner);
  };

  const logout = () => {
    clearBakeryOwnerToken();
    clearStoredBakeryOwner();
    setTokenState(null);
    setOwner(null);
  };

  const value = useMemo(
    () => ({
      owner,
      token,
      isAuthenticated: Boolean(token && owner),
      login,
      register,
      logout,
    }),
    [owner, token]
  );

  return <BakeryOwnerAuthContext.Provider value={value}>{children}</BakeryOwnerAuthContext.Provider>;
};

export const useBakeryOwnerAuth = () => {
  const context = useContext(BakeryOwnerAuthContext);
  if (!context) throw new Error("useBakeryOwnerAuth must be used inside BakeryOwnerAuthProvider");
  return context;
};
