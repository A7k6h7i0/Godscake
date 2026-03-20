"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "@/context/LocationContext";
import { geocodeAddress, reverseGeocode } from "@/lib/api";

// Types for our modal
type LocationSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLocationConfirmed: (lat: number, lng: number, address: string) => void;
};

type ConfirmedLocationDetails = {
  lat: number;
  lng: number;
  address: string;
};

export const LocationSelectionModal = ({
  isOpen,
  onClose,
  onLocationConfirmed,
}: LocationSelectionModalProps) => {
  const { location, setLocation } = useLocation();
  const [method, setMethod] = useState<"current" | "manual" | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [locationPhase, setLocationPhase] = useState<"detecting" | "improving" | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [accuracyWarning, setAccuracyWarning] = useState<number | null>(null);
  const [confirmedLocation, setConfirmedLocation] = useState<{
    lat: number | null;
    lng: number | null;
    address: string | null;
  } | null>(null);
  const accuracyThresholdMeters = 100;
  const latestRequestId = useRef(0);
  const confirmedDetails: ConfirmedLocationDetails | null =
    confirmedLocation &&
    confirmedLocation.lat !== null &&
    confirmedLocation.lng !== null &&
    confirmedLocation.address !== null
      ? {
          lat: confirmedLocation.lat,
          lng: confirmedLocation.lng,
          address: confirmedLocation.address,
        }
      : null;

  // If location is already set from context, use it as initial confirmed location
  useEffect(() => {
    if (location.lat !== null && location.lng !== null && location.address !== null) {
      setConfirmedLocation({
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      });
    }
  }, [location]);

  useEffect(() => {
    if (!isOpen) {
      setMethod(null);
      setManualAddress("");
      setGeocodeError(null);
      setLocationError(null);
      setLocationPhase(null);
      setGeocoding(false);
      setAccuracyWarning(null);
    }
  }, [isOpen]);

  const handleUseCurrentLocation = useCallback(async () => {
    setLocationError(null);
    setGeocodeError(null);
    setAccuracyWarning(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    const requestId = ++latestRequestId.current;
    const getPosition = (options: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

    const handlePosition = async (position: GeolocationPosition) => {
      if (latestRequestId.current !== requestId) return;
      const { latitude, longitude, accuracy } = position.coords;
      if (accuracy && accuracy > accuracyThresholdMeters) {
        setAccuracyWarning(Math.round(accuracy));
        setLocationError(
          `Location accuracy is about ${Math.round(accuracy)} meters. Please retry or enter manually.`
        );
        return;
      }

      try {
        setAccuracyWarning(null);
        setLocationError(null);
        setGeocoding(true);
        setGeocodeError(null);
        const address = await reverseGeocode(latitude, longitude);
        if (address) {
          setConfirmedLocation({ lat: latitude, lng: longitude, address });
        } else {
          setGeocodeError("Unable to determine address from coordinates");
        }
      } catch (error) {
        setGeocodeError("Failed to get address from coordinates");
      } finally {
        setGeocoding(false);
      }
    };

    const handleLocationError = (error: GeolocationPositionError) => {
      if (latestRequestId.current !== requestId) return;
      setAccuracyWarning(null);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationError("Location permission denied");
          break;
        case error.POSITION_UNAVAILABLE:
          setLocationError("Location information is unavailable");
          break;
        case error.TIMEOUT:
          setLocationError("The request to get user location timed out");
          break;
        default:
          setLocationError("An unknown error occurred");
          break;
      }
    };

    const highAccuracyOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };
    const fallbackOptions: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 0,
    };

    try {
      setLocationPhase("detecting");
      const position = await getPosition(highAccuracyOptions);
      setLocationPhase(null);
      await handlePosition(position);
    } catch (error) {
      const geoError = error as GeolocationPositionError;
      if (geoError.code === geoError.PERMISSION_DENIED) {
        setLocationPhase(null);
        handleLocationError(geoError);
        return;
      }

      try {
        setLocationPhase("improving");
        const position = await getPosition(fallbackOptions);
        setLocationPhase(null);
        await handlePosition(position);
      } catch (fallbackError) {
        setLocationPhase(null);
        handleLocationError(fallbackError as GeolocationPositionError);
      }
    }
  }, []);

  const handleManualLocation = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim()) {
      setGeocodeError("Please enter an address");
      return;
    }

    setGeocoding(true);
    setGeocodeError(null);
    try {
      const coords = await geocodeAddress(manualAddress);
      if (coords) {
        setConfirmedLocation({
          lat: coords.lat,
          lng: coords.lng,
          address: manualAddress, // Use the entered address as the display address
        });
      } else {
        setGeocodeError("Unable to geocode the address. Please try a different one.");
      }
    } catch (error) {
      setGeocodeError("Failed to geocode address");
    } finally {
      setGeocoding(false);
    }
  }, [manualAddress]);

  const handleConfirmLocation = useCallback(() => {
    if (!confirmedDetails) return;

    // Update the context location
    setLocation({
      lat: confirmedDetails.lat,
      lng: confirmedDetails.lng,
      address: confirmedDetails.address,
      isFixed: true,
    });
    // Call the callback to proceed with order
    onLocationConfirmed(confirmedDetails.lat, confirmedDetails.lng, confirmedDetails.address);
    onClose();
  }, [confirmedDetails, onClose, onLocationConfirmed, setLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-auto px-4">
        {/* Modal Content */}
        <div className="page-transition glass-panel rounded-[28px] shadow-2xl w-full border border-almond/80">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-almond/70">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Delivery</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Select your location</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-almond bg-white/80 p-2 text-gray-500 transition hover:text-gray-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Location Method Selection */}
            {!method && (
              <div className="space-y-4">
                <p className="text-muted">How would you like to set your delivery location?</p>
                <div className="space-y-4">
                  {/* Use Current Location */}
                  <button
                    onClick={handleUseCurrentLocation}
                    className="w-full flex items-center justify-between rounded-2xl border border-almond bg-white/80 px-5 py-4 text-left transition hover:border-brand-300 hover:bg-brand-50"
                    disabled={locationPhase !== null}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4M12 16h.01"></path>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-ink">Use Current Location</h3>
                        <p className="text-sm text-muted">Detect with high accuracy GPS</p>
                      </div>
                    </div>
                    {locationPhase ? (
                      <svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.3"></circle>
                        <path d="M12 6v6M12 12l4-4"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-gray-400 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    )}
                  </button>

                  {/* Enter Location Manually */}
                  <button
                    onClick={() => setMethod("manual")}
                    className="w-full flex items-center justify-between rounded-2xl border border-almond bg-white/80 px-5 py-4 text-left transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-ink">Enter Location Manually</h3>
                        <p className="text-sm text-muted">Search your address or landmark</p>
                      </div>
                    </div>
                    <svg className="h-4 w-4 text-gray-400 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
                {locationPhase && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"></circle>
                      <path d="M12 6v6M12 12l4-4"></path>
                    </svg>
                    <span>{locationPhase === "detecting" ? "Detecting location..." : "Improving accuracy..."}</span>
                  </div>
                )}
                {locationError && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span className="ml-3">{locationError}</span>
                  </div>
                )}
                {geocodeError && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span className="ml-3">{geocodeError}</span>
                  </div>
                )}
                {accuracyWarning && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleUseCurrentLocation}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Retry detection
                    </button>
                    <button
                      onClick={() => setMethod("manual")}
                      className="text-xs font-semibold text-ink hover:text-brand-700"
                    >
                      Enter manually
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manual Location Input */}
            {method === "manual" && (
              <>
                <button
                  onClick={() => setMethod(null)}
                  className="mb-4 flex items-center gap-2 text-sm text-muted hover:text-ink"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Back
                </button>
                <form onSubmit={handleManualLocation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-almond px-4 py-3 text-sm text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                      placeholder="Enter your area, landmark, or full address"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      required
                    />
                  </div>
                  {geocodeError && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                      <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span className="ml-3">{geocodeError}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={geocoding}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-medium text-white shadow-glow transition hover:bg-brand-600"
                  >
                    {geocoding ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeOpacity="0.3"></circle>
                          <path d="M12 6v6M12 12l4-4"></path>
                        </svg>
                        Finding location...
                      </>
                    ) : (
                      <>
                        Find Location
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Location Confirmation */}
            {confirmedDetails && (
              <>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-almond bg-white/80 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest/10 text-forest">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 8v4M12 16h.01"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted">Detected location</p>
                        <p className="mt-1 font-medium text-ink">{confirmedDetails.address}</p>
                        <p className="text-xs text-gray-400">
                          Lat: {confirmedDetails.lat.toFixed(4)}, Lng: {confirmedDetails.lng.toFixed(4)}
                        </p>
                      </div>
                      <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">Detected</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-almond pt-4">
                    <button
                      onClick={() => setMethod(null)}
                      className="flex items-center gap-2 text-sm text-muted hover:text-ink"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Change Location
                    </button>
                    <button
                      onClick={handleUseCurrentLocation}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Re-detect location
                    </button>
                    <button
                      onClick={handleConfirmLocation}
                      className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-medium text-white shadow-glow transition hover:bg-brand-600"
                    >
                      Confirm Location
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
