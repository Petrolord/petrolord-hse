import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Minimize2, 
  Trash2, 
  Loader2, 
  Bot,
  User,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHSE } from '@/context/HSEContext';
import { chatbotService } from '@/services/chatbotService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ChatBot() {
  const { currentUser, currentOrganization } = useHSE();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    const history = chatbotService.loadHistoryFromLocal();
    if (history && history.length > 0) {
      setMessages(history);
    } else {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: `Hello ${currentUser?.name || 'there'}! I'm your Petrolord HSE assistant. I can help you with safety procedures, incident reporting, or finding information within the platform. How can I help you today?`
      }]);
    }
  }, [currentUser]);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      chatbotService.saveHistoryToLocal(messages);
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { role: 'user', content: inputValue.trim() };
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      if (navigator.onLine) {
        const response = await chatbotService.sendMessage(
          newHistory, 
          currentUser?.id, 
          currentOrganization?.id
        );
        setMessages(prev => [...prev, response]);
      } else {
        // Offline Fallback
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm currently offline. Your message has been queued and I'll respond once you're back online.",
          isOffline: true
        }]);
      }
    } catch (error) {
      console.error("Chatbot Error in UI:", error);
      // Display a more specific error if available to help with debugging
      const errorMessage = error.message && error.message.includes('API Key') 
        ? "Configuration Error: " + error.message
        : "I apologize, but I encountered an error connecting to the server. Please try again later.";
        
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    chatbotService.clearHistory();
    setMessages([{
      role: 'assistant',
      content: "Conversation cleared. How else can I assist you?"
    }]);
  };

  return (
    /* 
      Updated Positioning:
      - bottom-14 (mobile) / bottom-16 (desktop) to clear map attribution and footers
      - z-[9999] to ensure it sits above all other layers including Leaflet maps
      - pointer-events-none on container to allow clicking through empty space
    */
    <div className="fixed bottom-14 right-6 md:bottom-16 md:right-10 z-[9999] flex flex-col items-end pointer-events-none gap-4">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[90vw] sm:w-[400px] h-[60vh] sm:h-[500px] bg-[#1a1a2e] border border-[#3a3a5a] rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto ring-1 ring-black/50"
          >
            {/* Header */}
            <div className="p-4 bg-[#252541] border-b border-[#3a3a5a] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-[#FFC107] p-1.5 rounded-lg">
                  <Bot className="h-4 w-4 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Petrolord Assistant</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={handleClear} title="Clear Chat">
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => setIsMinimized(true)} title="Minimize">
                  <Minimize2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => setIsOpen(false)} title="Close">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 bg-[#151525]">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10",
                      msg.role === 'user' ? "bg-blue-600" : "bg-[#FFC107]"
                    )}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-black" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg text-sm shadow-sm",
                      msg.role === 'user' 
                        ? "bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-tr-none" 
                        : "bg-[#252541] text-gray-200 border border-[#3a3a5a] rounded-tl-none",
                      msg.isError && "border-red-500/50 bg-red-900/20 text-red-200"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-[#FFC107] flex items-center justify-center shrink-0 border border-white/10">
                      <Bot className="h-4 w-4 text-black" />
                    </div>
                    <div className="bg-[#252541] p-3 rounded-lg rounded-tl-none border border-[#3a3a5a] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 bg-[#252541] border-t border-[#3a3a5a] shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about safety..."
                  className="bg-[#151525] border-[#3a3a5a] text-white focus:border-[#FFC107] placeholder:text-gray-500"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-[#FFC107] hover:bg-[#FFD54F] text-black shrink-0"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <Button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg shadow-[#FFC107]/20 pointer-events-auto transition-all duration-300 ring-2 ring-black/20",
          isOpen && !isMinimized ? "scale-0 opacity-0" : "scale-100 opacity-100 bg-[#FFC107] hover:bg-[#FFD54F] text-black"
        )}
        title="Open Chat Assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}