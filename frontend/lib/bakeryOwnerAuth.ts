const OWNER_TOKEN_KEY = "gods_cake_bakery_owner_token";
const OWNER_KEY = "gods_cake_bakery_owner";

export type BakeryOwnerUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bakeryId?: string | null;
};

export const getBakeryOwnerToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(OWNER_TOKEN_KEY) : null;

export const setBakeryOwnerToken = (token: string) => {
  if (typeof window !== "undefined") localStorage.setItem(OWNER_TOKEN_KEY, token);
};

export const clearBakeryOwnerToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem(OWNER_TOKEN_KEY);
};

export const getStoredBakeryOwner = (): BakeryOwnerUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(OWNER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BakeryOwnerUser;
  } catch {
    return null;
  }
};

export const setStoredBakeryOwner = (owner: BakeryOwnerUser) => {
  if (typeof window !== "undefined") localStorage.setItem(OWNER_KEY, JSON.stringify(owner));
};

export const clearStoredBakeryOwner = () => {
  if (typeof window !== "undefined") localStorage.removeItem(OWNER_KEY);
};
