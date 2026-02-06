import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatBotProps {
  apiKeyReady: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ apiKeyReady }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hey! I'm the Editor-in-Chief here. Want the scoop on the latest comics or need me to explain a joke?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKeyReady) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Get previous messages excluding the new one for history context
      const responseText = await sendChatMessage(messages, userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I spilled coffee on the server. Try again later.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!apiKeyReady) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={`bg-white border-4 border-black w-80 sm:w-96 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] transition-all duration-300 transform origin-bottom-right mb-4 pointer-events-auto flex flex-col ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 h-0 overflow-hidden'}`}
        style={{ maxHeight: '500px' }}
      >
        {/* Header */}
        <div className="bg-yellow-400 border-b-4 border-black p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1 rounded-full">
              <Bot size={18} />
            </div>
            <h3 className="font-bold text-lg">The Editor</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-yellow-500 rounded p-1">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[300px]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 border-2 border-black text-sm font-sans ${
                  msg.role === 'user' 
                    ? 'bg-blue-100 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' 
                    : 'bg-white rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-gray-200 p-2 rounded-full flex gap-1 animate-pulse">
                 <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t-4 border-black bg-white flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the news..."
            className="flex-1 border-2 border-gray-300 focus:border-black p-2 outline-none font-sans text-sm"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="bg-black text-white p-2 hover:bg-gray-800 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-black text-yellow-400 p-4 rounded-full border-4 border-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform flex items-center justify-center group"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} className="group-hover:animate-bounce" />}
      </button>
    </div>
  );
};

export default ChatBot;
