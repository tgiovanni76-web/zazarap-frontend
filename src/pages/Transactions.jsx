import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

export default function Transactions() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me().catch(() => null) });

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Transaction.filter({ userId: user.email }, '-created_date', 100);
    },
    enabled: !!user
  });

  if (!user) return <div className="py-10">Bitte anmelden.</div>;
  if (isLoading) return <div className="py-10">Lädt...</div>;

  const statusColor = (s) => ({
    pending: 'bg-slate-100 text-slate-700',
    authorized: 'bg-blue-100 text-blue-800',
    held_in_escrow: 'bg-amber-100 text-amber-800',
    paid: 'bg-green-100 text-green-800',
    captured: 'bg-green-100 text-green-800',
    refunded: 'bg-purple-100 text-purple-800',
    failed: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-200 text-gray-700'
  }[s] || 'bg-slate-100 text-slate-700');

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Transaktionen</h1>
      <div className="bg-white rounded-lg border divide-y">
        {txs.length === 0 && (
          <div className="p-6 text-slate-600">Noch keine Transaktionen.</div>
        )}
        {txs.map((tx) => (
          <div key={tx.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-500">{new Date(tx.created_date).toLocaleString()}</div>
              <div className="font-medium">
                {tx.kind === 'promotion' && 'Anzeige-Boost'}
                {tx.kind === 'purchase' && 'Kauf / Escrow'}
                {tx.kind === 'subscription' && 'Abo'}
                {' • '} {tx.provider?.toUpperCase()}
              </div>
              <div className="text-sm text-slate-600">{tx.description || '-'}</div>
              {tx.relatedEntity && (
                <div className="text-xs text-slate-500 mt-1">Ref: {tx.relatedEntity} #{tx.relatedId}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{(tx.amount ?? 0).toFixed(2)} {tx.currency || 'EUR'}</div>
              <div className="mt-1">
                <Badge className={statusColor(tx.status)}>{tx.status}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}