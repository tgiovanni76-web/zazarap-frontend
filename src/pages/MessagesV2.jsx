import React from 'react';
import { useMessages } from '../hooks/useMessages';

export default function MessagesV2() {
  const urlParams = new URLSearchParams(window.location.search);
  const chatId = urlParams.get('chatId') || '';
  const { messages, loading, error } = useMessages(chatId);

  return (
    <div className="min-h-[60vh] p-4 md:p-6">
      <h1 className="text-xl font-semibold mb-3">Messaggi</h1>

      {!chatId && (
        <div className="text-sm text-slate-600">Nessuna chat selezionata. Aggiungi ?chatId=... all'URL per caricare i messaggi.</div>
      )}

      {chatId && (
        <div className="mb-2 text-xs text-slate-500">Chat ID: {chatId}</div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          Caricamento...
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{String(error)}</div>
      )}

      {!loading && chatId && messages?.length === 0 && (
        <div className="text-sm text-slate-600">Nessun messaggio trovato.</div>
      )}

      {!loading && messages?.length > 0 && (
        <ul className="space-y-2">
          {messages.map((m) => (
            <li key={m.id} className="rounded-md border bg-white p-3">
              <div className="text-xs text-slate-500 mb-1">
                {m.senderId} → {m.receiverId} • {new Date(m.created_date).toLocaleString()}
              </div>
              {m.imageUrl && (
                <img src={m.imageUrl} alt="allegato" className="max-h-48 rounded mb-2" />
              )}
              {m.text && <div className="text-sm whitespace-pre-wrap break-words">{m.text}</div>}
              {typeof m.price === 'number' && (
                <div className="mt-1 text-green-700 font-medium">€ {m.price}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}