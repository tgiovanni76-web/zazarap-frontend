import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, CheckCircle2, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetails({ order, onBack }) {
  const { data: orderItems = [], isLoading } = useQuery({
    queryKey: ['orderItems', order.id],
    queryFn: () => base44.entities.OrderItem.filter({ orderId: order.id }),
    enabled: !!order
  });

  const statusSteps = [
    { key: 'pending', label: 'Ordine ricevuto', icon: Package },
    { key: 'processing', label: 'In lavorazione', icon: Package },
    { key: 'shipped', label: 'Spedito', icon: Truck },
    { key: 'delivered', label: 'Consegnato', icon: CheckCircle2 }
  ];

  const statusIndex = statusSteps.findIndex(s => s.key === order.status);

  const handleDownloadInvoice = async () => {
    try {
      const response = await base44.functions.invoke('generateInvoice', { orderId: order.id });
      if (response.data?.pdfUrl) {
        window.open(response.data.pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Invoice download error:', error);
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Torna agli ordini
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Stato ordine #{order.orderNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= statusIndex;
                  const isCurrent = index === statusIndex;

                  return (
                    <div key={step.key} className="flex items-center gap-4">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                        isCompleted ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        <StepIcon className={`h-5 w-5 ${
                          isCompleted ? 'text-green-600' : 'text-slate-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isCurrent ? 'text-green-600' : ''}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-slate-600">In corso</p>
                        )}
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>

              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Tracking spedizione</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Numero: <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                      {order.carrier && (
                        <p className="text-sm text-blue-700">Corriere: {order.carrier}</p>
                      )}
                      {order.estimatedDelivery && (
                        <p className="text-sm text-blue-700">
                          Consegna stimata: {format(new Date(order.estimatedDelivery), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Articoli ordinati</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                      {item.listingImage && (
                        <Link to={createPageUrl('ListingDetail') + '?id=' + item.listingId}>
                          <img 
                            src={item.listingImage} 
                            alt={item.listingTitle}
                            className="w-20 h-20 object-cover rounded"
                          />
                        </Link>
                      )}
                      <div className="flex-1">
                        <Link to={createPageUrl('ListingDetail') + '?id=' + item.listingId}>
                          <h4 className="font-semibold hover:text-red-600">{item.listingTitle}</h4>
                        </Link>
                        <p className="text-sm text-slate-600">Venduto da: {item.sellerId}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">Quantità: {item.quantity}</span>
                          <span className="text-sm">Prezzo: {item.price.toFixed(2)}€</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{item.subtotal.toFixed(2)}€</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Riepilogo ordine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotale</span>
                <span className="font-medium">{order.subtotal?.toFixed(2)}€</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Sconto</span>
                  <span>-{order.discountAmount.toFixed(2)}€</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Spedizione</span>
                <span className="font-medium">
                  {order.shippingCost > 0 ? `${order.shippingCost.toFixed(2)}€` : 'Gratuita'}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Totale</span>
                  <span className="text-red-600">{order.totalAmount.toFixed(2)}€</span>
                </div>
              </div>
              <Button 
                onClick={handleDownloadInvoice}
                variant="outline" 
                className="w-full mt-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica fattura
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Indirizzo di spedizione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-slate-600 mt-1">{order.shippingAddress.street}</p>
                <p className="text-sm text-slate-600">
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-sm text-slate-600 mt-2">Tel: {order.shippingAddress.phone}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Metodo</span>
                  <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Stato</span>
                  <Badge className={
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {order.paymentStatus === 'paid' ? 'Pagato' : 'In attesa'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Data</span>
                  <span className="font-medium">
                    {format(new Date(order.created_date), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}