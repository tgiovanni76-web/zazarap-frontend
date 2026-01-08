import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Package, MapPin, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 10);
    }
  }, [center, map]);
  return null;
}

export default function RealTimeTrackingMap({ shipping, order }) {
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [estimatedPosition, setEstimatedPosition] = useState(null);

  useEffect(() => {
    loadTrackingData();
    const interval = setInterval(loadTrackingData, 60000); // Refresh ogni minuto
    return () => clearInterval(interval);
  }, [shipping?.id]);

  const loadTrackingData = async () => {
    if (!shipping?.trackingNumber) return;

    try {
      setIsLoading(true);
      
      // Simula tracciamento real-time con geocoding
      const origin = shipping.origin || 'Milano, Italia';
      const destination = order.shippingAddress?.city || 'Roma, Italia';

      // Geocodifica origine
      const originRes = await base44.functions.invoke('geocodeCity', { 
        city: origin 
      });

      // Geocodifica destinazione
      const destRes = await base44.functions.invoke('geocodeCity', { 
        city: destination 
      });

      if (originRes.data?.found && destRes.data?.found) {
        const originCoords = [originRes.data.lat, originRes.data.lon];
        const destCoords = [destRes.data.lat, destRes.data.lon];

        // Simula posizione corrente basata su stato
        let currentPosition = originCoords;
        let progress = 0;

        if (shipping.status === 'shipped') {
          // Calcola posizione intermedia basata sul tempo
          const shipDate = new Date(shipping.updated_date);
          const now = new Date();
          const estimatedDelivery = shipping.estimatedDelivery ? 
            new Date(shipping.estimatedDelivery) : 
            new Date(shipDate.getTime() + 3 * 24 * 60 * 60 * 1000);

          const totalTime = estimatedDelivery - shipDate;
          const elapsed = now - shipDate;
          progress = Math.min(elapsed / totalTime, 1);

          currentPosition = [
            originCoords[0] + (destCoords[0] - originCoords[0]) * progress,
            originCoords[1] + (destCoords[1] - originCoords[1]) * progress
          ];
        } else if (shipping.status === 'delivered') {
          currentPosition = destCoords;
          progress = 1;
        }

        setEstimatedPosition(currentPosition);
        setTrackingData({
          origin: originCoords,
          destination: destCoords,
          current: currentPosition,
          progress: progress * 100,
          route: [originCoords, currentPosition, destCoords]
        });
      }

    } catch (error) {
      console.error('Tracking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (shipping?.status) {
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'shipped':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'in_transit':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (shipping?.status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!shipping) {
    return (
      <Alert>
        <AlertDescription>Nessuna spedizione disponibile</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Tracciamento Real-Time
          </span>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-2">{shipping.status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shipping.trackingNumber && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Tracking Number</p>
            <p className="font-mono font-bold text-lg">{shipping.trackingNumber}</p>
            {shipping.carrier && (
              <p className="text-xs text-slate-500 mt-1">Corriere: {shipping.carrier}</p>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="h-96 flex items-center justify-center bg-slate-100 rounded-lg">
            <p className="text-slate-600">Caricamento mappa...</p>
          </div>
        ) : trackingData ? (
          <>
            <div className="h-96 rounded-lg overflow-hidden mb-4 border">
              <MapContainer
                center={estimatedPosition || trackingData.current}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <MapUpdater center={estimatedPosition || trackingData.current} />
                
                {/* Marker origine */}
                <Marker position={trackingData.origin}>
                  <Popup>
                    <strong>Punto di partenza</strong>
                    <br />Spedito da qui
                  </Popup>
                </Marker>

                {/* Marker posizione corrente */}
                {trackingData.current && shipping.status !== 'delivered' && (
                  <Marker position={trackingData.current}>
                    <Popup>
                      <strong>📦 Posizione Stimata</strong>
                      <br />Progresso: {trackingData.progress.toFixed(0)}%
                    </Popup>
                  </Marker>
                )}

                {/* Marker destinazione */}
                <Marker position={trackingData.destination}>
                  <Popup>
                    <strong>Destinazione</strong>
                    <br />{order.shippingAddress?.street}
                    <br />{order.shippingAddress?.city}
                  </Popup>
                </Marker>

                {/* Linea rotta */}
                <Polyline
                  positions={trackingData.route}
                  color="#3b82f6"
                  weight={3}
                  opacity={0.7}
                />
              </MapContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-600">Progresso</p>
                <div className="mt-2">
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${trackingData.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {trackingData.progress.toFixed(0)}% completato
                  </p>
                </div>
              </div>

              {shipping.estimatedDelivery && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-slate-600">Consegna Stimata</p>
                  <p className="font-bold text-lg text-green-700 mt-1">
                    {new Date(shipping.estimatedDelivery).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Impossibile caricare i dati di tracciamento
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}