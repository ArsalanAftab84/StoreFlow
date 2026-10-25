// frontend/app/components/AIChatWidget.tsx
"use client";

import { useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am your AI shopping guide. What are you looking for?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AI_API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: userMessage.content,
          conversation_history: messages.slice(1),
          session_id: sessionId,
          channel: 'web',
        }),
      });
      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection failed.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="chat-panel bg-white w-96 h-[500px] rounded-2xl shadow-xl flex flex-col overflow-hidden border">
          <div className="bg-blue-600 p-4 flex justify-between text-white">
            <h3 className="font-semibold">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-xs text-gray-500">Thinking...</div>}
          </div>
          <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 px-3 py-2 bg-gray-100 rounded-lg outline-none" placeholder="Ask something..." />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Send</button>
          </form>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl">
          💬
        </button>
      )}
    </div>
  );
}