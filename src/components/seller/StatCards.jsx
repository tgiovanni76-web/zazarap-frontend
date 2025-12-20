import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, MousePointer, HandCoins, DollarSign } from 'lucide-react';

export default function StatCards({ summary, salesTotals }) {
  const items = [
    { label: 'Visualizzazioni', value: summary.totalViews || 0, icon: Eye, color: 'text-blue-600' },
    { label: 'Click', value: summary.totalClicks || 0, icon: MousePointer, color: 'text-emerald-600' },
    { label: 'Offerte', value: summary.totalOffers || 0, icon: HandCoins, color: 'text-amber-600' },
    { label: 'Ricavi totali', value: (salesTotals?.revenue || 0).toFixed(2) + '€', icon: DollarSign, color: 'text-violet-600' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-100 ${color}`}><Icon className="h-5 w-5"/></div>
            <div>
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-xl font-bold">{value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}