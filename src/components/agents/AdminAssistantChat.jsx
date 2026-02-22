import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminAssistantChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: "zazarap_admin_assistent" });
        let conv = Array.isArray(list) && list.length > 0 ? list[0] : null;
        if (!conv) {
          conv = await base44.agents.createConversation({
            agent_name: "zazarap_admin_assistent",
            metadata: { name: "Admin Assistant", description: "Console Admin" },
          });
        }
        if (!mounted) return;
        setConversation(conv);
        setMessages(conv?.messages || []);
        unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data?.messages || []);
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!conversation || !text.trim()) return;
    await base44.agents.addMessage(conversation, { role: "user", content: text.trim() });
    setText("");
  };

  return (
    <div className="w-full border rounded-lg bg-white">
      <div className="px-3 py-2 border-b text-sm font-medium">Admin Assistant</div>
      <div className="p-3">
        <div className="h-72 overflow-y-auto bg-[var(--z-bg)] rounded-md p-2 space-y-2">
          {loading && (
            <div className="text-center text-xs text-slate-500 py-8">Caricamento…</div>
          )}
          {!loading && messages.length === 0 && (
            <div className="text-center text-xs text-slate-500 py-8">
              Inizia a scrivere qui sotto per parlare con l'assistente.
            </div>
          )}
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`${isUser ? "bg-slate-800 text-white" : "bg-white border"} max-w-[80%] px-3 py-2 rounded-2xl text-sm`}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="mt-3 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Scrivi un messaggio (es. 'Mostra inserzioni in attesa di approvazione')"
          />
          <Button type="submit" disabled={!conversation || !text.trim()}>
            Invia
          </Button>
        </form>
      </div>
    </div>
  );
}