import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, RefreshCw, Loader2 } from 'lucide-react';
import { getGeminiResponse, ChatMessage } from '../services/geminiService';

const QUICK_PROMPTS = [
  "What's the safest way to walk home after 10pm?",
  'I feel followed — what should I do right now?',
  'Tips for a solo cab ride at night',
  'How do I set up discreet SOS triggers?',
];

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  text: "Hi — I'm your SafeSafar AI companion. Ask me anything about getting home safely, choosing routes, or using SOS features.",
};

export const AiCompanionPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsgText = text.trim();
    const newHistory: ChatMessage[] = [...messages, { role: 'user', text: userMsgText }];
    
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      // Fetch response from Gemini API (or fallback if offline/no key)
      const aiResponseText = await getGeminiResponse(userMsgText, messages);
      setMessages([...newHistory, { role: 'assistant', text: aiResponseText }]);
    } catch (err) {
      console.error('[AiCompanionPage] Error getting response:', err);
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          text: 'I had trouble connecting to the AI server. Please check your internet connection or try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#7CA982] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Companion · Powered by Google Gemini</span>
        </div>
        <h1 className="text-3xl font-black text-[#202D2D] leading-tight">
          Someone to think out loud with.
        </h1>
      </div>

      {/* Quick Prompts */}
      <div className="px-8 pb-4 shrink-0">
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              disabled={isLoading}
              onClick={() => sendMessage(prompt)}
              className="px-3.5 py-1.5 rounded-full border border-[#D4E2D5] bg-white text-[12px] text-[#30433F] font-medium hover:bg-[#EEF3EE] hover:border-[#24504F] transition-all disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="max-w-xl w-full bg-[#EEF3EE] border border-[#D4E2D5] rounded-2xl px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7CA982] mb-1">SafeSafar AI</p>
                <p className="text-[14px] text-[#202D2D] leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            )}
            {msg.role === 'user' && (
              <div className="max-w-sm bg-[#24504F] rounded-2xl px-5 py-3">
                <p className="text-[14px] text-white/90 leading-relaxed">{msg.text}</p>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xl w-full bg-[#EEF3EE] border border-[#D4E2D5] rounded-2xl px-5 py-4 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#24504F] animate-spin" />
              <span className="text-[13px] text-[#30433F] font-medium">SafeSafar AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-8 pb-8 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white border border-[#D4E2D5] rounded-2xl px-4 py-3 shadow-sm">
          <input
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about safety, routes, SOS..."
            className="flex-1 text-[14px] text-[#202D2D] placeholder-[#9AACA8] bg-transparent outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-[#9AACA8] hover:text-[#30433F] hover:bg-[#F0F2F0] transition-all disabled:opacity-50"
            title="Reset conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-[#C85D67] hover:bg-[#B85060] flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </form>
      </div>
    </div>
  );
};

