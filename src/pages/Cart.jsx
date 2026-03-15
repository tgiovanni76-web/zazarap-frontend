import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Heart, MapPin, Zap, X } from 'lucide-react';
import { toast } from 'sonner';
import SavedItems from '../components/cart/SavedItems';
import { useLanguage } from '../components/LanguageProvider';
import AddressManager from '../components/cart/AddressManager';

export default function Cart() {
  const { t } = useLanguage();
  const tr = (k, fb) => { const v = t(k); return v === k ? fb : v; };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [discountCodes, setDiscountCodes] = useState([]);
  const [currentCode, setCurrentCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart', user?.email],
    queryFn: async () => {
      const carts = await base44.entities.Cart.filter({ 
        userId: user.email, 
        status: 'active' 
      });
      return carts[0] || null;
    },
    enabled: !!user
  });

  const { data: cartItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['cartItems', cart?.id],
    queryFn: () => base44.entities.CartItem.filter({ cartId: cart.id }),
    enabled: !!cart
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, newQuantity }) => {
      if (newQuantity < 1) {
        await base44.entities.CartItem.delete(itemId);
      } else {
        await base44.entities.CartItem.update(itemId, { quantity: newQuantity });
      }
      
      // Update cart total
      const items = await base44.entities.CartItem.filter({ cartId: cart.id });
      const total = items.reduce((sum, item) => {
        if (item.id === itemId) {
          return newQuantity < 1 ? sum : sum + (item.price * newQuantity);
        }
        return sum + (item.price * item.quantity);
      }, 0);
      
      await base44.entities.Cart.update(cart.id, { 
        totalAmount: total 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      await base44.entities.CartItem.delete(itemId);
      
      // Update cart total
      const items = await base44.entities.CartItem.filter({ cartId: cart.id });
      const total = items
        .filter(i => i.id !== itemId)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      await base44.entities.Cart.update(cart.id, { 
        totalAmount: total 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Articolo rimosso');
    }
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['shippingAddresses', user?.email],
    queryFn: () => base44.entities.ShippingAddress.filter({ userId: user.email }),
    enabled: !!user
  });

  React.useEffect(() => {
    const defaultAddr = addresses.find(a => a.isDefault);
    if (defaultAddr && !selectedAddressId) {
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const addDiscountCodeMutation = useMutation({
    mutationFn: async (codes) => {
      const response = await base44.functions.invoke('optimizeDiscounts', {
        cartId: cart.id,
        codes
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    }
  });

  const handleAddCode = () => {
    if (!currentCode.trim()) return;
    const code = currentCode.toUpperCase();
    if (discountCodes.includes(code)) {
      toast.error('Codice già aggiunto');
      return;
    }
    const newCodes = [...discountCodes, code];
    setDiscountCodes(newCodes);
    setCurrentCode('');
    addDiscountCodeMutation.mutate(newCodes);
  };

  const handleRemoveCode = (code) => {
    const newCodes = discountCodes.filter(c => c !== code);
    setDiscountCodes(newCodes);
    if (newCodes.length > 0) {
      addDiscountCodeMutation.mutate(newCodes);
    } else {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  };

  const moveToSavedMutation = useMutation({
    mutationFn: async (item) => {
      await base44.entities.SavedItem.create({
        userId: user.email,
        listingId: item.listingId,
        listingTitle: item.listingTitle,
        listingImage: item.listingImage,
        price: item.price
      });
      await base44.entities.CartItem.delete(item.id);
      const items = await base44.entities.CartItem.filter({ cartId: cart.id });
      const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      await base44.entities.Cart.update(cart.id, { totalAmount: total });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      queryClient.invalidateQueries({ queryKey: ['savedItems'] });
      toast.success('Articolo salvato per dopo');
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const items = await base44.entities.CartItem.filter({ cartId: cart.id });
      await Promise.all(items.map(item => base44.entities.CartItem.delete(item.id)));
      await base44.entities.Cart.update(cart.id, { 
        totalAmount: 0,
        discountAmount: 0,
        discountCode: null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Carrello svuotato');
    }
  });

  const isLoading = cartLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="py-12 max-w-2xl mx-auto text-center">
        <ShoppingCart className="h-20 w-20 mx-auto mb-4 text-slate-300" />
        <h2 className="text-2xl font-bold mb-2">{tr('cart.emptyTitle','Il tuo carrello è vuoto')}</h2>
        <p className="text-slate-600 mb-6">{tr('cart.emptySubtitle','Aggiungi articoli per iniziare lo shopping')}</p>
        <Link to={createPageUrl('Marketplace')}>
          <Button className="bg-red-600 hover:bg-red-700">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Continua lo shopping
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cart.discountAmount || 0;
  const total = subtotal - discount;

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{tr('cart.title','Shopping')}</h2>

      <Tabs defaultValue="cart" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cart">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Carrello ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Heart className="h-4 w-4 mr-2" />
            Salvati
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cart">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.listingImage && (
                    <Link to={createPageUrl('ListingDetail') + '?id=' + item.listingId}>
                      <img 
                        src={item.listingImage} 
                        alt={item.listingTitle}
                        className="w-24 h-24 object-cover rounded"
                      />
                    </Link>
                  )}
                  <div className="flex-1">
                    <Link to={createPageUrl('ListingDetail') + '?id=' + item.listingId}>
                      <h3 className="font-semibold text-lg hover:text-red-600">
                        {item.listingTitle}
                      </h3>
                    </Link>
                    <p className="text-slate-600 text-sm mb-2">
                      Venduto da: {item.sellerId}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantityMutation.mutate({
                            itemId: item.id,
                            newQuantity: item.quantity - 1
                          })}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantityMutation.mutate({
                            itemId: item.id,
                            newQuantity: item.quantity + 1
                          })}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-red-600">
                          {(item.price * item.quantity).toFixed(2)}€
                        </div>
                        <div className="text-sm text-slate-500">
                          {item.price.toFixed(2)}€ cad.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => moveToSavedMutation.mutate(item)}
                      disabled={moveToSavedMutation.isPending}
                      title="Salva per dopo"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeItemMutation.mutate(item.id)}
                      disabled={removeItemMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

              <Button
                variant="outline"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Svuota carrello
              </Button>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Riepilogo ordine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotale</span>
                <span className="font-medium">{subtotal.toFixed(2)}€</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Sconto {cart.discountCode && `(${cart.discountCode})`}</span>
                  <span className="font-medium">-{discount.toFixed(2)}€</span>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Totale</span>
                  <span className="text-red-600">{total.toFixed(2)}€</span>
                </div>
              </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Codici sconto</p>
                    {discountCodes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {discountCodes.map(code => (
                          <Badge key={code} className="bg-green-100 text-green-800">
                            {code}
                            <button
                              onClick={() => handleRemoveCode(code)}
                              className="ml-1 hover:text-green-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Aggiungi codice"
                        value={currentCode}
                        onChange={(e) => setCurrentCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCode()}
                      />
                      <Button
                        variant="outline"
                        onClick={handleAddCode}
                        disabled={!currentCode || addDiscountCodeMutation.isPending}
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      💡 Aggiungi più codici: troveremo la combinazione migliore!
                    </p>
                  </div>

                  {addresses.length > 0 && selectedAddressId && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      size="lg"
                      disabled={!selectedAddressId}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Checkout rapido
                    </Button>
                  )}

                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700" 
                    size="lg"
                    disabled={!selectedAddressId}
                  >
                    Procedi al checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <Link to={createPageUrl('Marketplace')}>
                    <Button variant="outline" className="w-full">
                      Continua lo shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Indirizzo di spedizione
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressManager 
                    user={user} 
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={setSelectedAddressId}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <SavedItems user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}