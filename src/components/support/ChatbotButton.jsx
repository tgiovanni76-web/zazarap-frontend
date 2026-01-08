import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';
import AIChatbot from './AIChatbot';

export default function ChatbotButton() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {!showChat && (
        <Button
          onClick={() => setShowChat(true)}
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 z-40"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      
      {showChat && <AIChatbot onClose={() => setShowChat(false)} />}
    </>
  );
}