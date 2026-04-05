import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(Boolean(chatId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setError(null);

    // Reset if no chatId
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);

    // Initial fetch
    (async () => {
      try {
        const list = await base44.entities.ChatMessage.filter({ chatId }, 'created_date');
        if (active) setMessages(list || []);
      } catch (_) {
        if (active) setError('Errore nel caricamento');
      } finally {
        if (active) setLoading(false);
      }
    })();

    // Real-time updates
    const unsubscribe = base44.entities.ChatMessage.subscribe((e) => {
      if (!e?.data || e.data.chatId !== chatId) return;
      setMessages((prev) => {
        if (e.type === 'create') {
          const next = [...prev, e.data];
          next.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
          return next;
        }
        if (e.type === 'update') return prev.map((m) => (m.id === e.id ? e.data : m));
        if (e.type === 'delete') return prev.filter((m) => m.id !== e.id);
        return prev;
      });
    });

    // Fallback polling (ensures delivery for users with flaky realtime)
    const poller = setInterval(async () => {
      try {
        const list = await base44.entities.ChatMessage.filter({ chatId }, 'created_date');
        if (active) setMessages(list || []);
      } catch (_) {
        // ignore polling errors silently
      }
    }, 5000);

    return () => {
      active = false;
      clearInterval(poller);
      unsubscribe?.();
    };
  }, [chatId]);

  return { messages, loading, error };
};