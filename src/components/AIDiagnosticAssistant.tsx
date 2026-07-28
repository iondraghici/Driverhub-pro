import React, { useState } from 'react';
import { LaptopProfile } from '../types/driver';
import { 
  Bot, 
  Send, 
  Sparkles, 
  HelpCircle, 
  Terminal, 
  Copy, 
  Check, 
  AlertTriangle, 
  RefreshCw,
  Cpu,
  ShieldAlert
} from 'lucide-react';

interface AIDiagnosticAssistantProps {
  profile: LaptopProfile;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIDiagnosticAssistant: React.FC<AIDiagnosticAssistantProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello! I am **DriverHub Pro AI Diagnostic Assistant** (Powered by Gemini).

I can help you troubleshoot hardware errors, BSOD crash logs, driver conflicts (Device Manager Code 10, Code 28, Code 43), Intel VMD/RST drive detection issues during Windows setup, or specific driver installation order for **${profile.model}**.

What hardware problem would you like to solve?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const quickPrompts = [
    'Why is my NVMe SSD missing in Windows 11 setup?',
    'How to fix NVIDIA RTX 4060 Code 43 in Device Manager?',
    'Should I pick Game Ready or Studio driver for my laptop?',
    'Wi-Fi AX211 Code 10 (Device cannot start) fix',
    'What is the exact driver installation order for Acer Nitro?'
  ];

  const handleSendQuery = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          systemSpecs: {
            model: profile.model,
            cpu: profile.cpu,
            gpu: profile.gpu,
            bios: profile.biosVersion,
            vmdEnabled: profile.vmdEnabled
          }
        })
      });

      const data = await response.json();
      let aiText = '';

      if (data.success && data.answer) {
        aiText = data.answer;
      } else if (data.fallbackResponse) {
        aiText = data.fallbackResponse;
      } else {
        aiText = `An issue occurred while processing your query. Please check your network or try again.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Error connecting to Gemini AI Diagnostic Server: ${err.message}. Please verify process.env.GEMINI_API_KEY in server environment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Server-Side Gemini Engine
              </span>
              <span className="text-xs text-slate-400">
                Hardware & Driver Troubleshooting Assistant
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              AI Driver Diagnostic & Error Resolution Assistant
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Ask any technical question regarding Windows Device Manager errors, PnP driver signatures, Intel VMD/RST, or graphics driver performance.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono text-purple-300 flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Context Model:</div>
              <div className="font-bold">{profile.model}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Suggestions Chips */}
      <div className="flex items-center overflow-x-auto space-x-2 pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center space-x-1 pr-1">
          <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
          <span>Quick Diagnostics:</span>
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-xs font-medium text-purple-200 rounded-xl whitespace-nowrap transition active:scale-95 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[520px] overflow-hidden">
        
        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed shadow-md relative group ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {/* Header in message */}
                  <div className="flex items-center justify-between mb-2 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1.5">
                    <div className="flex items-center space-x-1.5 font-bold">
                      {isUser ? (
                        <span className="text-cyan-200">User Query</span>
                      ) : (
                        <div className="flex items-center space-x-1 text-purple-400">
                          <Bot className="h-3.5 w-3.5" />
                          <span>DriverHub AI Engineer</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          className="text-slate-400 hover:text-white transition"
                          title="Copy response"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message body text */}
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-2xl p-4 w-fit">
              <RefreshCw className="h-4 w-4 text-purple-400 animate-spin" />
              <span className="text-xs text-purple-300 font-medium animate-pulse">
                Analyzing hardware specs, PnP IDs & generating diagnostic solution...
              </span>
            </div>
          )}
        </div>

        {/* Query Input Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about a driver error code, VMD setup, BSOD, or graphics setting..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition active:scale-95 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Query</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
