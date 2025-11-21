import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function ShippingTracker({ shipping, payment, onConfirmReceipt }) {
  const statusConfig = {
    'pending': { 
      icon: Clock, 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      label: 'In attesa di spedizione',
      step: 1
    },
    'shipped': { 
      icon: Package, 
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      label: 'Spedito',
      step: 2
    },
    'in_transit': { 
      icon: Truck, 
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      label: 'In transito',
      step: 3
    },
    'delivered': { 
      icon: CheckCircle, 
      color: 'bg-green-100 text-green-800 border-green-300',
      label: 'Consegnato',
      step: 4
    },
    'failed': { 
      icon: AlertCircle, 
      color: 'bg-red-100 text-red-800 border-red-300',
      label: 'Problema spedizione',
      step: 0
    }
  };

  const config = statusConfig[shipping.status] || statusConfig['pending'];
  const Icon = config.icon;

  const shippingSteps = [
    { label: 'In preparazione', step: 1 },
    { label: 'Spedito', step: 2 },
    { label: 'In transito', step: 3 },
    { label: 'Consegnato', step: 4 }
  ];

  const showConfirmButton = shipping.status === 'delivered' && 
                           payment?.status === 'held_in_escrow' && 
                           !payment?.buyerConfirmedReceipt;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-red-600" />
          Tracking Spedizione
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={`${config.color} border px-3 py-1`}>
            <Icon className="h-4 w-4 mr-2" />
            {config.label}
          </Badge>
          {shipping.carrier && (
            <span className="text-sm text-slate-600">
              via {shipping.carrier}
            </span>
          )}
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            {shippingSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    config.step >= step.step 
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {config.step >= step.step ? <CheckCircle className="h-4 w-4" /> : step.step}
                </div>
                <span className="text-xs mt-1 text-center">{step.label}</span>
              </div>
            ))}
          </div>
          <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 -z-10">
            <div 
              className="h-full bg-green-600 transition-all duration-500"
              style={{ width: `${(config.step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Shipping Info */}
        <div className="space-y-2 text-sm">
          {shipping.trackingNumber && (
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span className="text-slate-600">Numero tracking:</span>
              <span className="font-mono font-bold">{shipping.trackingNumber}</span>
            </div>
          )}
          
          {shipping.estimatedDelivery && (
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span className="text-slate-600">Consegna stimata:</span>
              <span className="font-semibold">{format(new Date(shipping.estimatedDelivery), 'dd/MM/yyyy')}</span>
            </div>
          )}

          {shipping.actualDelivery && (
            <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
              <span className="text-green-700">Consegnato il:</span>
              <span className="font-semibold text-green-800">
                {format(new Date(shipping.actualDelivery), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          )}

          {shipping.address && shipping.method !== 'ritiro_persona' && (
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-slate-600 text-xs mb-1">Indirizzo:</p>
              <p className="font-medium">{shipping.address}</p>
            </div>
          )}

          {shipping.trackingUrl && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(shipping.trackingUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Traccia su {shipping.carrier}
            </Button>
          )}
        </div>

        {/* Escrow Info */}
        {payment?.status === 'held_in_escrow' && (
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-2">💰 Fondi in Escrow</p>
            <p className="text-xs text-blue-700 mb-2">
              I fondi sono trattenuti in sicurezza e verranno rilasciati al venditore dopo la conferma di ricezione.
            </p>
            {payment.escrowReleaseDate && (
              <p className="text-xs text-blue-600">
                Rilascio automatico: {format(new Date(payment.escrowReleaseDate), 'dd/MM/yyyy')}
              </p>
            )}
          </div>
        )}

        {/* Confirm Receipt Button */}
        {showConfirmButton && (
          <Button 
            onClick={onConfirmReceipt}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Conferma Ricezione e Rilascia Fondi
          </Button>
        )}

        {payment?.buyerConfirmedReceipt && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
            <p className="text-sm text-green-800 font-semibold">✅ Ricezione confermata</p>
            <p className="text-xs text-green-700">Fondi rilasciati al venditore</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}