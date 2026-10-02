import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const QUICK_PROMPTS = [
  "What's the safest way to walk home after 10pm?",
  'I feel followed — what should I do right now?',
  'Tips for a solo cab ride at night',
  'How do I set up discreet SOS triggers?',
];

const AI_RESPONSES: Record<string, string> = {
  default:
    "Hi — I'm your SafeSafar companion. Ask me anything about getting home safely, choosing routes, or using SOS.",
  safe:
    '🌟 For walking home safely after 10pm: (1) Share your live location with a trusted contact. (2) Use SafeSafar\'s "Walk Me Home" mode — your guardian gets alerts. (3) Prefer lit main roads even if longer. (4) Keep your phone charged and SOS armed.',
  followed:
    '🚨 If you feel followed: (1) Do NOT go home directly. Head to a crowded public place (mall, shop, hospital). (2) Call someone and speak loudly about your location. (3) Activate Silent SOS in SafeSafar right now. (4) If danger is immediate, shout for help — bystanders will respond.',
  cab: '🚖 Solo cab safety tips: (1) Share the ride details (number plate, driver) via SafeSafar before leaving. (2) Sit behind the driver, not passenger side. (3) Keep the window slightly open. (4) Activate "Walk Me Home" so your guardian tracks the cab route in real time.',
  sos: '🔒 Discreet SOS options in SafeSafar: (1) **Shake SOS** — rapid phone shake sends silent alert. (2) **Fake Call → SOS** — say "reach soon" during the fake call to secretly dispatch emergency. (3) **Duress PIN (9999)** — opens a Calculator decoy while alerting your circle. (4) **Volume button** hold — silent SOS broadcast.',
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('walk') || lower.includes('10pm') || lower.includes('night') || lower.includes('safe'))
    return AI_RESPONSES.safe;
  if (lower.includes('follow') || lower.includes('danger') || lower.includes('scary'))
    return AI_RESPONSES.followed;
  if (lower.includes('cab') || lower.includes('ride') || lower.includes('auto') || lower.includes('uber'))
    return AI_RESPONSES.cab;
  if (lower.includes('sos') || lower.includes('trigger') || lower.includes('discreet') || lower.includes('silent'))
    return AI_RESPONSES.sos;
  return "That's a great safety question. In SafeSafar, you can always activate Walk Me Home for live guardian monitoring, use the Fake Call feature for covert distress, or shake your phone for a silent SOS. Stay aware, stay connected. 💙";
}

export const AiCompanionPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: AI_RESPONSES.default },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    const aiMsg: Message = { role: 'assistant', text: getResponse(text) };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([{ role: 'assistant', text: AI_RESPONSES.default }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      {/* Header */}
      <div className="px-8 pt-8 pb-4 shrink-0">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#7CA982] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Companion · Powered by SafeSafar</span>
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
              onClick={() => sendMessage(prompt)}
              className="px-3.5 py-1.5 rounded-full border border-[#D4E2D5] bg-white text-[12px] text-[#30433F] font-medium hover:bg-[#EEF3EE] hover:border-[#24504F] transition-all"
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7CA982] mb-1">SafeSafar</p>
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
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-8 pb-8 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white border border-[#D4E2D5] rounded-2xl px-4 py-3 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about safety, routes, SOS..."
            className="flex-1 text-[14px] text-[#202D2D] placeholder-[#9AACA8] bg-transparent outline-none"
          />
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg text-[#9AACA8] hover:text-[#30433F] hover:bg-[#F0F2F0] transition-all"
            title="Reset conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="submit"
            className="w-9 h-9 rounded-xl bg-[#C85D67] hover:bg-[#B85060] flex items-center justify-center transition-all shadow-sm"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
