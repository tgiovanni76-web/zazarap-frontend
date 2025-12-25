import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Star, TrendingUp, Award, Zap, Rocket, CheckCircle, Tag, Sparkles } from 'lucide-react';

const PROMOTION_PACKAGES = [
  {
    id: 'featured',
    name: 'Hervorgehoben',
    icon: Star,
    basePrice: 5.99,
    description: 'Farblicher Rahmen + bessere Platzierung',
    features: ['Farbliche Hervorhebung', 'Bessere Platzierung', 'Sichtbarkeit +150%'],
    color: 'from-yellow-500 to-orange-500',
    popular: false
  },
  {
    id: 'top',
    name: 'TOP-Anzeige',
    icon: TrendingUp,
    basePrice: 9.99,
    description: 'Ganz oben in der Kategorie',
    features: ['Position 1-3 in Kategorie', 'Featured Badge', 'Sichtbarkeit +300%'],
    color: 'from-blue-500 to-cyan-500',
    popular: true
  },
  {
    id: 'daily_highlight',
    name: 'Highlight des Tages',
    icon: Award,
    basePrice: 14.99,
    description: 'Tägliches Featured auf Startseite',
    features: ['Startseiten-Feature', 'Social Media Push', 'Sichtbarkeit +500%'],
    color: 'from-purple-500 to-pink-500',
    popular: false
  },
  {
    id: 'premium_boost',
    name: 'Premium Boost',
    icon: Zap,
    basePrice: 19.99,
    description: 'Maximale Sichtbarkeit + Social Media',
    features: ['Alle TOP-Features', 'Social Media Posts', 'Newsletter-Erwähnung', 'Sichtbarkeit +800%'],
    color: 'from-orange-500 to-red-500',
    popular: false
  },
  {
    id: 'turbo',
    name: 'Turbo Promotion',
    icon: Rocket,
    basePrice: 29.99,
    description: 'Maximale Reichweite + VIP-Support',
    features: ['Alle Premium-Features', 'VIP-Support', 'Dedizierter Account Manager', 'Garantierte Sichtbarkeit'],
    color: 'from-red-500 to-pink-600',
    popular: false
  }
];

const DURATIONS = [
  { days: 1, label: '1 Tag', discount: 0 },
  { days: 3, label: '3 Tage', discount: 0 },
  { days: 7, label: '1 Woche', discount: 5 },
  { days: 14, label: '2 Wochen', discount: 10 },
  { days: 30, label: '1 Monat', discount: 20 }
];

export default function DirectPromotionModal({ listingId, listingTitle, isOpen, onClose }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [discountCode, setDiscountCode] = useState('');
  const [validatedDiscount, setValidatedDiscount] = useState(null);

  const validateCodeMutation = useMutation({
    mutationFn: async (code) => {
      if (!code || !selectedPackage) return null;
      const pkg = PROMOTION_PACKAGES.find(p => p.id === selectedPackage);
      const duration = DURATIONS.find(d => d.days === selectedDuration);
      let amount = pkg.basePrice * selectedDuration;
      amount *= (1 - duration.discount / 100);
      
      const res = await base44.functions.invoke('validateDiscountCode', { code, amount });
      return res.data;
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('purchaseDirectPromotion', {
        listingId,
        promotionType: selectedPackage,
        durationDays: selectedDuration,
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
      toast.error(error.message || 'Fehler beim Kauf');
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

  const calculatePrice = () => {
    if (!selectedPackage) return { total: 0, original: 0, saved: 0 };
    
    const pkg = PROMOTION_PACKAGES.find(p => p.id === selectedPackage);
    const duration = DURATIONS.find(d => d.days === selectedDuration);
    
    let original = pkg.basePrice * selectedDuration;
    let total = original * (1 - duration.discount / 100);
    
    if (validatedDiscount?.valid) {
      total = validatedDiscount.finalAmount;
    }
    
    return {
      total,
      original,
      saved: original - total,
      durationDiscount: duration.discount
    };
  };

  const price = calculatePrice();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Promotion für "{listingTitle}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Selection */}
          <div>
            <h3 className="font-semibold mb-3">Wähle dein Paket:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PROMOTION_PACKAGES.map((pkg) => {
                const Icon = pkg.icon;
                const isSelected = selectedPackage === pkg.id;
                return (
                  <Card
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`cursor-pointer transition-all relative ${
                      isSelected
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600">
                        Beliebt
                      </Badge>
                    )}
                    <CardContent className="pt-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-lg mb-1">{pkg.name}</h4>
                      <p className="text-sm text-slate-600 mb-3">{pkg.description}</p>
                      <div className="space-y-1 mb-3">
                        {pkg.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        €{pkg.basePrice}/Tag
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Duration Selection */}
          {selectedPackage && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Wähle die Dauer:</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {DURATIONS.map((duration) => (
                    <Button
                      key={duration.days}
                      variant={selectedDuration === duration.days ? 'default' : 'outline'}
                      onClick={() => setSelectedDuration(duration.days)}
                      className="relative"
                    >
                      {duration.label}
                      {duration.discount > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs">
                          -{duration.discount}%
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Discount Code */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Rabattcode (optional):
                </label>
                <div className="flex gap-2">
                  <Input
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setValidatedDiscount(null);
                    }}
                    placeholder="CODE"
                  />
                  <Button
                    onClick={handleValidateCode}
                    variant="outline"
                    disabled={!discountCode || validateCodeMutation.isPending}
                  >
                    {validateCodeMutation.isPending ? 'Prüfe...' : 'Prüfen'}
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
              <Card className="bg-gradient-to-br from-slate-50 to-blue-50">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {price.durationDiscount > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Originalpreis:</span>
                          <span className="line-through">€{price.original.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Dauerrabatt ({price.durationDiscount}%):</span>
                          <span>-€{(price.original * price.durationDiscount / 100).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {validatedDiscount?.valid && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Code-Rabatt ({validatedDiscount.discountPercent}%):</span>
                        <span>-€{validatedDiscount.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-bold text-lg">Gesamt:</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          €{price.total.toFixed(2)}
                        </div>
                        {price.saved > 0 && (
                          <div className="text-xs text-green-600">
                            Du sparst €{price.saved.toFixed(2)}!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Button */}
              <div className="flex gap-3">
                <Button
                  onClick={() => purchaseMutation.mutate()}
                  disabled={purchaseMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {purchaseMutation.isPending
                    ? 'Wird verarbeitet...'
                    : `Jetzt kaufen (€${price.total.toFixed(2)})`}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                >
                  Abbrechen
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}