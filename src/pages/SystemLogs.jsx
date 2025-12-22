import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';

export default function SystemLogs() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['systemLogs'],
    enabled: !!user && user.role === 'admin',
    queryFn: () => base44.entities.SystemLog.list('-created_date', 100)
  });

  if (!user || user.role !== 'admin') {
    return <div className="py-8 text-center text-red-600">Accesso negato</div>;
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">System Logs</h1>
      <p className="text-slate-600 mb-6">Ultimi eventi applicativi (solo admin).</p>

      {isLoading && <div>Caricamento…</div>}

      <div className="grid gap-3">
        {logs.map((l) => (
          <Card key={l.id}>
            <CardContent className="p-4 text-sm">
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-white ${l.level === 'error' ? 'bg-red-600' : l.level === 'warn' ? 'bg-yellow-600' : 'bg-slate-600'}`}>{l.level}</span>
                <div className="flex-1">
                  <div className="font-medium">{l.message}</div>
                  <div className="text-slate-600 text-xs mt-1">{new Date(l.created_date).toLocaleString()} • {l.path || '/'} • {l.userId || 'anon'}</div>
                  {l.details && (
                    <pre className="mt-2 bg-slate-50 border rounded p-2 overflow-x-auto text-xs whitespace-pre-wrap">{l.details}</pre>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {logs.length === 0 && !isLoading && (
          <div className="text-slate-500">Nessun log disponibile.</div>
        )}
      </div>
    </div>
  );
}