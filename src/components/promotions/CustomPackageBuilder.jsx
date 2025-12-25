import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Star, TrendingUp, Zap, Rocket, Award, Tag, CheckCircle } from 'lucide-react';

const PROMOTION_TYPES = [
  {
    id: 'featured',
    name: 'Hervorgehoben',
    icon: Star,
    basePrice: 5.99,
    description: 'Farblicher Rahmen + bessere Platzierung',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  {
    id: 'top',
    name: 'TOP-Anzeige',
    icon: TrendingUp,
    basePrice: 9.99,
    description: 'Ganz oben in der Kategorie',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    id: 'daily_highlight',
    name: 'Highlight des Tages',
    icon: Award,
    basePrice: 14.99,
    description: 'Tägliches Featured auf Startseite',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    id: 'premium_boost',
    name: 'Premium Boost',
    icon: Zap,
    basePrice: 19.99,
    description: 'Maximale Sichtbarkeit + Social Media',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  {
    id: 'turbo',
    name: 'Turbo Promotion',
    icon: Rocket,
    basePrice: 29.99,
    description: 'Alle Features + Newsletter-Erwähnung',
    color: 'bg-red-100 text-red-800 border-red-300'
  }
];

export default function CustomPackageBuilder({ listingId, onSuccess }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [duration, setDuration] = useState([7]);
  const [discountCode, setDiscountCode] = useState('');
  const [validatedDiscount, setValidatedDiscount] = useState(null);

  const validateCodeMutation = useMutation({
    mutationFn: async (code) => {
      if (!code) return null;
      const amount = calculateTotal();
      const res = await base44.functions.invoke('validateDiscountCode', { code, amount });
      return res.data;
    }
  });

  const createPackageMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('createCustomPromotion', {
        listingId,
        promotionTypes: selectedTypes,
        durationDays: duration[0],
        discountCode: discountCode || undefined
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Erstellen des Pakets');
    }
  });

  const handleValidateCode = async () => {
    if (!discountCode.trim()) {
      setValidatedDiscount(null);
      return;
    }
    const result = await validateCodeMutation.mutateAsync(discountCode);
    if (result?.valid) {
      setValidatedDiscount(result);
      toast.success(result.message);
    } else {
      setValidatedDiscount(null);
      toast.error(result?.message || 'Ungültiger Code');
    }
  };

  const toggleType = (typeId) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
    setValidatedDiscount(null);
  };

  const calculateTotal = () => {
    let total = 0;
    selectedTypes.forEach(typeId => {
      const type = PROMOTION_TYPES.find(t => t.id === typeId);
      total += type.basePrice * duration[0];
    });

    // Volume discount
    if (selectedTypes.length > 1) {
      total *= 0.85; // 15% off for multiple types
    }

    // Duration discount
    if (duration[0] >= 30) {
      total *= 0.80; // 20% off for 30+ days
    } else if (duration[0] >= 14) {
      total *= 0.90; // 10% off for 14+ days
    }

    return total;
  };

  const originalTotal = selectedTypes.reduce((sum, typeId) => {
    const type = PROMOTION_TYPES.find(t => t.id === typeId);
    return sum + (type.basePrice * duration[0]);
  }, 0);

  const baseTotal = calculateTotal();
  const finalTotal = validatedDiscount?.valid ? validatedDiscount.finalAmount : baseTotal;
  const totalSavings = originalTotal - finalTotal;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Erstelle dein Custom-Paket
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Promotion Types Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Wähle deine Promotion-Optionen:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PROMOTION_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <div
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={isSelected} />
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <Badge variant="outline">
                        €{type.basePrice}/Tag
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 ml-7">{type.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Dauer:</label>
              <Badge variant="secondary">{duration[0]} Tage</Badge>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={1}
              max={90}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>1 Tag</span>
              <span>90 Tage</span>
            </div>
            {duration[0] >= 30 && (
              <Badge className="bg-green-100 text-green-800 mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                20% Rabatt für 30+ Tage
              </Badge>
            )}
            {duration[0] >= 14 && duration[0] < 30 && (
              <Badge className="bg-blue-100 text-blue-800 mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                10% Rabatt für 14+ Tage
              </Badge>
            )}
          </div>

          {/* Discount Code */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              <Tag className="w-4 h-4 inline mr-1" />
              Rabattcode (optional):
            </label>
            <div className="flex gap-2">
              <Input
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value.toUpperCase());
                  setValidatedDiscount(null);
                }}
                placeholder="RABATTCODE"
                className="flex-1"
              />
              <Button
                onClick={handleValidateCode}
                variant="outline"
                disabled={!discountCode || validateCodeMutation.isPending}
              >
                {validateCodeMutation.isPending ? 'Prüfe...' : 'Anwenden'}
              </Button>
            </div>
            {validatedDiscount?.valid && (
              <Badge className="bg-green-100 text-green-800 mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                {validatedDiscount.message}
              </Badge>
            )}
          </div>

          {/* Price Summary */}
          {selectedTypes.length > 0 && (
            <Card className="bg-slate-50">
              <CardContent className="pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Originalpreis:</span>
                  <span>€{originalTotal.toFixed(2)}</span>
                </div>
                {selectedTypes.length > 1 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Mengenrabatt (15%):</span>
                    <span>-€{(originalTotal * 0.15).toFixed(2)}</span>
                  </div>
                )}
                {duration[0] >= 14 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Dauerrabatt:</span>
                    <span>-€{(originalTotal - baseTotal - (selectedTypes.length > 1 ? originalTotal * 0.15 : 0)).toFixed(2)}</span>
                  </div>
                )}
                {validatedDiscount?.valid && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Code-Rabatt ({validatedDiscount.discountPercent}%):</span>
                    <span>-€{validatedDiscount.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Gesamt:</span>
                  <span className="text-green-600">€{finalTotal.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="text-center text-sm text-green-600">
                    Du sparst €{totalSavings.toFixed(2)}!
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Create Button */}
          <Button
            onClick={() => createPackageMutation.mutate()}
            disabled={selectedTypes.length === 0 || createPackageMutation.isPending}
            className="w-full"
            size="lg"
          >
            {createPackageMutation.isPending
              ? 'Wird erstellt...'
              : `Paket buchen (€${finalTotal.toFixed(2)})`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}