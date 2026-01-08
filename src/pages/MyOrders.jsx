import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, FileText, Truck, CheckCircle2, XCircle, Clock, Download, MapPin, Star } from 'lucide-react';
import OrderDetails from '../components/orders/OrderDetails';
import RealTimeTrackingMap from '../components/orders/RealTimeTrackingMap';
import DeliveryFeedbackModal from '../components/orders/DeliveryFeedbackModal';
import { format } from 'date-fns';

export default function MyOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [feedbackOrder, setFeedbackOrder] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ userId: user.email }, '-created_date'),
    enabled: !!user
  });

  const { data: shippings = [] } = useQuery({
    queryKey: ['shippings'],
    queryFn: () => base44.entities.Shipping.list(),
    enabled: !!user
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['deliveryFeedbacks', user?.email],
    queryFn: () => base44.entities.DeliveryFeedback.filter({ userId: user.email }),
    enabled: !!user
  });

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'In attesa' },
    processing: { icon: Package, color: 'bg-blue-100 text-blue-800', label: 'In lavorazione' },
    shipped: { icon: Truck, color: 'bg-purple-100 text-purple-800', label: 'Spedito' },
    delivered: { icon: CheckCircle2, color: 'bg-green-100 text-green-800', label: 'Consegnato' },
    cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Annullato' },
    refunded: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Rimborsato' }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await base44.functions.invoke('generateInvoice', { orderId });
      if (response.data?.pdfUrl) {
        window.open(response.data.pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Invoice download error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (selectedOrder) {
    return <OrderDetails order={selectedOrder} onBack={() => setSelectedOrder(null)} />;
  }

  if (trackingOrder) {
    const shipping = shippings.find(s => s.orderId === trackingOrder.id);
    return (
      <div className="py-8 max-w-5xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => setTrackingOrder(null)}
          className="mb-4"
        >
          ← Torna agli ordini
        </Button>
        <RealTimeTrackingMap shipping={shipping} order={trackingOrder} />
      </div>
    );
  }

  return (
    <div className="py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">I miei ordini</h2>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {orders.length} ordini
        </Badge>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <Input
            placeholder="Cerca ordine per numero o stato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold mb-2">Nessun ordine trovato</h3>
            <p className="text-slate-600">
              {searchTerm ? 'Prova con un altro termine di ricerca' : 'Non hai ancora effettuato ordini'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusInfo = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">Ordine #{order.orderNumber}</h3>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {format(new Date(order.created_date), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {order.totalAmount.toFixed(2)}€
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.paymentStatus === 'paid' ? 'Pagato' : 'In attesa'}
                      </p>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Tracking: {order.trackingNumber}</p>
                          {order.carrier && (
                            <p className="text-xs text-blue-700">Corriere: {order.carrier}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {order.shippingAddress && (
                    <div className="text-sm text-slate-600 mb-4">
                      <p className="font-medium">Indirizzo di spedizione:</p>
                      <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      className="col-span-2"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Dettagli ordine
                    </Button>
                    
                    {(order.status === 'shipped' || order.status === 'delivered') && (
                      <Button
                        variant="outline"
                        onClick={() => setTrackingOrder(order)}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Traccia
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadInvoice(order.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Fattura
                    </Button>

                    {order.status === 'delivered' && !feedbacks.find(f => f.orderId === order.id) && (
                      <Button
                        variant="outline"
                        className="col-span-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                        onClick={() => setFeedbackOrder(order)}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Valuta consegna
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {feedbackOrder && (
        <DeliveryFeedbackModal
          open={!!feedbackOrder}
          onClose={() => setFeedbackOrder(null)}
          order={feedbackOrder}
          shipping={shippings.find(s => s.orderId === feedbackOrder.id)}
        />
      )}
    </div>
  );
}