import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SavedItems({ user }) {
  const queryClient = useQueryClient();

  const { data: savedItems = [] } = useQuery({
    queryKey: ['savedItems', user?.email],
    queryFn: () => base44.entities.SavedItem.filter({ userId: user.email }),
    enabled: !!user
  });

  const moveToCartMutation = useMutation({
    mutationFn: async (item) => {
      const carts = await base44.entities.Cart.filter({ userId: user.email, status: 'active' });
      let cart = carts[0];
      
      if (!cart) {
        cart = await base44.entities.Cart.create({
          userId: user.email,
          status: 'active',
          totalAmount: 0
        });
      }

      await base44.entities.CartItem.create({
        cartId: cart.id,
        listingId: item.listingId,
        listingTitle: item.listingTitle,
        listingImage: item.listingImage,
        price: item.price,
        quantity: 1
      });

      await base44.entities.SavedItem.delete(item.id);

      const allItems = await base44.entities.CartItem.filter({ cartId: cart.id });
      const total = allItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      await base44.entities.Cart.update(cart.id, { totalAmount: total });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedItems'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      toast.success('Articolo spostato nel carrello');
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId) => base44.entities.SavedItem.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedItems'] });
      toast.success('Articolo rimosso');
    }
  });

  if (savedItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Heart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
          <p className="text-slate-500">Nessun articolo salvato</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {savedItems.map(item => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex gap-4">
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
                <p className="text-lg font-bold text-red-600">{item.price.toFixed(2)}€</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => moveToCartMutation.mutate(item)}
                    disabled={moveToCartMutation.isPending}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Aggiungi al carrello
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItemMutation.mutate(item.id)}
                    disabled={removeItemMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}