import React from 'react';
import { useMessages } from '@/hooks/useMessages';

export default function MessagesV2() {
  const sp = new URLSearchParams(window.location.search);
  const chatId = sp.get('chatId') || sp.get('chatid') || null;

  const { messages, loading, error } = useMessages(chatId);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="rounded-full h-12 w-12 border-b-2 border-[var(--z-primary)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center text-red-600">{error}</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {messages?.length > 0 ? (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-xl border bg-white p-3 text-sm">
              {msg.text || (msg.imageUrl ? '📷 Immagine' : 'Messaggio')}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500">Nessun messaggio presente.</p>
      )}
    </div>
  );
}