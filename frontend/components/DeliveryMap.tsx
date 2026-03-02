"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type DeliveryMapProps = {
  bakeryLocation?: { lat: number; lng: number } | null;
  deliveryLocation?: { lat: number; lng: number } | null;
};

export default function DeliveryMap({ bakeryLocation, deliveryLocation }: DeliveryMapProps) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  const center = deliveryLocation || bakeryLocation || { lat: 17.385, lng: 78.4867 };

  return (
    <div className="h-72 overflow-hidden rounded-lg border">
      <MapContainer center={[center.lat, center.lng]} zoom={13} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bakeryLocation && (
          <Marker position={[bakeryLocation.lat, bakeryLocation.lng]}>
            <Popup>Bakery location</Popup>
          </Marker>
        )}
        {deliveryLocation && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]}>
            <Popup>Delivery location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
