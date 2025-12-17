import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';

export default function MapView({ markers = [], userLocation = null, height = 380 }) {
  // Compute map center
  const center = useMemo(() => {
    if (markers.length > 0) return [markers[0].lat, markers[0].lng];
    if (userLocation) return [userLocation.lat, userLocation.lng];
    return [52.52, 13.405]; // Berlin fallback
  }, [markers, userLocation]);

  return (
    <div className="w-full rounded-xl overflow-hidden border" style={{ height }}>
      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={8} pathOptions={{ color: '#2563eb' }}>
            <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent>
              You
            </Tooltip>
          </CircleMarker>
        )}
        {markers.map((m) => (
          <CircleMarker key={m.id} center={[m.lat, m.lng]} radius={6} pathOptions={{ color: '#d62828' }}>
            <Tooltip>
              {m.title} • €{m.price}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}