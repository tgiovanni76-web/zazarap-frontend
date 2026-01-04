import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AddressManager({ user, selectedAddressId, onSelectAddress }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    province: '',
    phone: ''
  });

  const queryClient = useQueryClient();

  const { data: addresses = [] } = useQuery({
    queryKey: ['shippingAddresses', user?.email],
    queryFn: () => base44.entities.ShippingAddress.filter({ userId: user.email }),
    enabled: !!user
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data) => {
      if (addresses.length === 0 || data.isDefault) {
        await Promise.all(
          addresses.map(addr => 
            base44.entities.ShippingAddress.update(addr.id, { isDefault: false })
          )
        );
      }
      return base44.entities.ShippingAddress.create({
        ...data,
        userId: user.email,
        isDefault: addresses.length === 0 || data.isDefault
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippingAddresses'] });
      setShowForm(false);
      setFormData({
        label: '', fullName: '', street: '', city: '', 
        postalCode: '', province: '', phone: ''
      });
      toast.success('Indirizzo aggiunto');
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (addressId) => {
      await Promise.all(
        addresses.map(addr => 
          base44.entities.ShippingAddress.update(addr.id, { 
            isDefault: addr.id === addressId 
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippingAddresses'] });
      toast.success('Indirizzo predefinito impostato');
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId) => base44.entities.ShippingAddress.delete(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippingAddresses'] });
      toast.success('Indirizzo eliminato');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.street || !formData.city || !formData.postalCode) {
      toast.error('Compila i campi obbligatori');
      return;
    }
    addAddressMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button 
          variant="outline" 
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuovo indirizzo
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="Etichetta (Casa, Ufficio...)"
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
              />
              <Input
                placeholder="Nome completo *"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
              <Input
                placeholder="Via e numero civico *"
                value={formData.street}
                onChange={(e) => setFormData({...formData, street: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Città *"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                />
                <Input
                  placeholder="CAP *"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  required
                />
              </div>
              <Input
                placeholder="Provincia"
                value={formData.province}
                onChange={(e) => setFormData({...formData, province: e.target.value})}
              />
              <Input
                placeholder="Telefono"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={addAddressMutation.isPending} className="flex-1">
                  Salva indirizzo
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {addresses.map(addr => (
          <Card 
            key={addr.id}
            className={`cursor-pointer transition-all ${
              selectedAddressId === addr.id 
                ? 'border-2 border-green-500 bg-green-50' 
                : 'hover:border-slate-300'
            }`}
            onClick={() => onSelectAddress(addr.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span className="font-semibold">{addr.label || 'Indirizzo'}</span>
                    {addr.isDefault && (
                      <Badge variant="outline" className="text-xs">Predefinito</Badge>
                    )}
                    {selectedAddressId === addr.id && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{addr.fullName}</p>
                  <p className="text-sm text-slate-600">
                    {addr.street}, {addr.postalCode} {addr.city}
                  </p>
                  {addr.phone && (
                    <p className="text-sm text-slate-600">Tel: {addr.phone}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {!addr.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDefaultMutation.mutate(addr.id);
                      }}
                      disabled={setDefaultMutation.isPending}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddressMutation.mutate(addr.id);
                    }}
                    disabled={deleteAddressMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}