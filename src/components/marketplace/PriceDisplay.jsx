import React from 'react';

export default function PriceDisplay({ price, showVAT = true, className = '' }) {
  const vatRate = 0.19; // 19% MwSt. Deutschland
  const priceWithVAT = price * (1 + vatRate);
  const vatAmount = price * vatRate;

  return (
    <div className={className}>
      <div className="text-2xl font-bold text-red-600">
        {priceWithVAT.toFixed(2)}€
      </div>
      {showVAT && (
        <div className="text-xs text-slate-600">
          inkl. {(vatRate * 100).toFixed(0)}% MwSt. ({vatAmount.toFixed(2)}€)
        </div>
      )}
    </div>
  );
}

export function formatPriceDE(price, includeVAT = true) {
  const vatRate = 0.19;
  const finalPrice = includeVAT ? price * (1 + vatRate) : price;
  return `${finalPrice.toFixed(2)}€`;
}