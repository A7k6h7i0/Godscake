"use client";

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";

export type Location = {
  lat: number | null;
  lng: number | null;
  address: string | null;
  isFixed: boolean; // true if user manually entered or confirmed location
};

type LocationContextValue = {
  location: Location;
  setLocation: (loc: Location) => void;
  isLocationConfirmed: boolean;
  confirmLocation: () => void;
  resetLocation: () => void;
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location>({
    lat: null,
    lng: null,
    address: null,
    isFixed: false,
  });

  // Load from localStorage on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gods_cake_location");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLocation(parsed);
        } catch {
          // ignore invalid JSON
        }
      }
    }
  }, []);

  // Save to localStorage whenever location changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gods_cake_location", JSON.stringify(location));
    }
  }, [location]);

  const isLocationConfirmed = location.isFixed && location.lat !== null && location.lng !== null && location.address !== null;

  const confirmLocation = () => {
    setLocation((prev) => ({ ...prev, isFixed: true }));
  };

  const resetLocation = () => {
    setLocation({
      lat: null,
      lng: null,
      address: null,
      isFixed: false,
    });
  };

  const value = useMemo(
    () => ({
      location,
      setLocation,
      isLocationConfirmed,
      confirmLocation,
      resetLocation,
    }),
    [location, isLocationConfirmed]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within LocationProvider");
  return context;
};