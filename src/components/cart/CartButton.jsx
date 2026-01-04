import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Check, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CartButton({ listing, className = "", showSaveOption = true }) {
  const [justAdded, setJustAdded] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: cart } = useQuery({
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

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      let activeCart = cart;
      
      // Create cart if doesn't exist
      if (!activeCart) {
        activeCart = await base44.entities.Cart.create({
          userId: user.email,
          status: 'active',
          totalAmount: 0,
          discountAmount: 0
        });
      }

      // Check if item already in cart
      const existingItems = await base44.entities.CartItem.filter({
        cartId: activeCart.id,
        listingId: listing.id
      });

      if (existingItems.length > 0) {
        // Update quantity
        const item = existingItems[0];
        await base44.entities.CartItem.update(item.id, {
          quantity: item.quantity + 1
        });
      } else {
        // Add new item
        await base44.entities.CartItem.create({
          cartId: activeCart.id,
          listingId: listing.id,
          listingTitle: listing.title,
          listingImage: listing.images?.[0] || '',
          price: listing.offerPrice || listing.price,
          quantity: 1,
          sellerId: listing.created_by
        });
      }

      // Update cart total
      const allItems = await base44.entities.CartItem.filter({ cartId: activeCart.id });
      const total = allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      await base44.entities.Cart.update(activeCart.id, {
        totalAmount: total
      });

      return activeCart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      setJustAdded(true);
      toast.success('Articolo aggiunto al carrello');
      setTimeout(() => setJustAdded(false), 2000);
    },
    onError: (error) => {
      toast.error('Errore nell\'aggiunta al carrello');
      console.error('Add to cart error:', error);
    }
  });

  const saveForLaterMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.SavedItem.create({
        userId: user.email,
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.images?.[0] || '',
        price: listing.offerPrice || listing.price
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedItems'] });
      toast.success('Articolo salvato per dopo');
    }
  });

  if (!user) return null;
  if (listing.created_by === user.email) return null;
  if (listing.status === 'sold') return null;

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => addToCartMutation.mutate()}
        disabled={addToCartMutation.isPending || justAdded}
        className={className}
      >
        {addToCartMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : justAdded ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <ShoppingCart className="h-4 w-4 mr-2" />
        )}
        {justAdded ? 'Aggiunto!' : 'Aggiungi al carrello'}
      </Button>
      {showSaveOption && (
        <Button
          onClick={() => saveForLaterMutation.mutate()}
          disabled={saveForLaterMutation.isPending}
          variant="outline"
          className="px-3"
        >
          <Heart className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}