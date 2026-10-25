import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  RefreshCw,
  ExternalLink,
  Bot,
  Layers,
  History,
  Shield,
  MessageSquareCode,
  Sparkles
} from 'lucide-react';
import { BotLog, HighlightService } from '../types/bio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  botStatus: {
    active: boolean;
    botUsername: string;
    adminChatId: string;
    totalServices: number;
    logs: BotLog[];
  };
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
  onResetDefault: () => void;
}

export const TelegramBotModal: React.FC<Props> = ({
  isOpen,
  onClose,
  botStatus,
  onRefresh,
  onShowToast,
  onResetDefault
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'terminal' | 'instructions' | 'logs'>('status');
  const [simCommand, setSimCommand] = useState('');
  const [simHistory, setSimHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'আসসালামু আলাইকুম ⚡ 乂 ＳＨＵＶＯ 乂 ⚡! টেলিগ্রাম বট প্রস্তুত আছে। কমান্ড দিন যেমন: /start, /list, /add',
      time: 'Just now'
    }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSendingPing, setIsSendingPing] = useState(false);
  const [showToken, setShowToken] = useState(false);

  if (!isOpen) return null;

  const botToken = '8649772073:AAHvhPRNE5pZmWPN1qU68z0ug3isdP7fNPg';
  const chatId = botStatus.adminChatId || '5440151107';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`✅ ${label} কপি হয়েছে!`);
  };

  const handleSendRealPing = async () => {
    setIsSendingPing(true);
    try {
      const res = await fetch('/api/telegram/send-test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onShowToast('🚀 আপনার টেলিগ্রামে টেস্ট মেসেজ পাঠানো হয়েছে!');
      } else {
        onShowToast('❌ মেসেজ পাঠাতে ব্যর্থ হয়েছে: ' + (data.result?.description || 'Error'));
      }
    } catch {
      onShowToast('❌ সার্ভার যোগাযোগে সমস্যা!');
    } finally {
      setIsSendingPing(false);
    }
  };

  const handleRunCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return;
    const textToSend = cmdText.trim();
    setSimCommand('');

    setSimHistory(prev => [
      ...prev,
      { sender: 'user', text: textToSend, time: new Date().toLocaleTimeString() }
    ]);
    setIsSimulating(true);

    try {
      const res = await fetch('/api/telegram/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend })
      });
      const data = await res.json();
      setSimHistory(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.reply || 'বট রেসপন্স করেছে!',
          time: new Date().toLocaleTimeString()
        }
      ]);
      onRefresh();
    } catch (e) {
      setSimHistory(prev => [
        ...prev,
        {
          sender: 'bot',
          text: '❌ কমান্ড রান করতে ব্যর্থ হয়েছে',
          time: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>টেলিগ্রাম বট ম্যানেজার</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Polling
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                সাভিসসমূহ কন্ট্রোল করার সম্পূর্ণ ড্যাশবোর্ড
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/30 px-3 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'status'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>বট স্ট্যাটাস</span>
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3 py-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'instructions'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>বট কমান্ড গাইড</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terminal'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>লাইভ সিমুলেটর</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>লগ হিস্টোরি</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Bot Connection Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-950 border border-sky-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 -ml-4" />
                    <span className="font-bold text-white text-sm">
                      বট সফলভাবে কানেক্টেড & সক্রিয়
                    </span>
                  </div>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono">
                    24/7 Active
                  </span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">এডমিন চ্যাট আইডি:</span>
                    <span className="font-mono text-cyan-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {chatId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">টেলিগ্রাম বট টোকেন:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-slate-300 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {showToken ? botToken : `${botToken.substring(0, 10)}...${botToken.substring(botToken.length - 6)}`}
                      </span>
                      <button
                        onClick={() => setShowToken(!showToken)}
                        className="text-[10px] text-cyan-400 hover:underline px-1"
                      >
                        {showToken ? 'হাইড' : 'শো'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">ওয়েবসাইটে মোট সাভিস:</span>
                    <span className="font-bold text-white bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                      {botStatus.totalServices} টি লাইভ
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <a
                    href="https://t.me/botfather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>টেলিগ্রাম অ্যাপে খুলুন</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <button
                    onClick={handleSendRealPing}
                    disabled={isSendingPing}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSendingPing ? 'পাঠানো হচ্ছে...' : 'মোবাইলে টেস্ট পিং পাঠান'}</span>
                  </button>
                </div>
              </div>

              {/* Maintenance Tools */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">ডিফল্ট ১২টি সাভিস রিস্টোর</h4>
                  <p className="text-[11px] text-slate-400">
                    মূল ১২টি সার্ভিস (QR Generator সহ) ফিরিয়ে আনতে
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('আপনি কি নিশ্চিত ডিফল্ট ১২টি সাভিস রিস্টোর করতে চান?')) {
                      onResetDefault();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>রিস্টোর করুন</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <span>📱 টেলিগ্রাম বটের মাধ্যমে সাভিস নিয়ন্ত্রণ করার নিয়ম:</span>
                </h4>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  আপনার টেলিগ্রাম অ্যাপ থেকে এই বটে সরাসরি নিচের কমান্ডগুলো দিয়ে যেকোনো সাভিস নিয়ন্ত্রণ করতে পারবেন:
                </p>
              </div>

              {/* Command List */}
              <div className="space-y-2 font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">/start</span>
                    <button
                      onClick={() => handleCopy('/start', 'কমান্ড')}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      কপি
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 font-sans">
                    প্রধান ইন্টারঅ্যাক্টিভ মেন্যু এবং ইনলাইন বাটনগুলো দেখতে।
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">/list</span>
                    <button
                      onClick={() => handleCopy('/list', 'কমান্ড')}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      কপি
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 font-sans">
                    ওয়েবসাইটে বর্তমানে থাকা সমস্ত সাভিসের নম্বর ও লিংক দেখতে।
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">/add</span>
                    <button
                      onClick={() => handleCopy('/add', 'কমান্ড')}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      কপি
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 font-sans">
                    ধাপে ধাপে নাম, ক্যাটাগরি, ছবির লিংক ও ক্লিক লিংক দিয়ে নতুন সাভিস যোগ করার উইজার্ড।
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">/edit</span>
                    <button
                      onClick={() => handleCopy('/edit', 'কমান্ড')}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      কপি
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 font-sans">
                    যেকোনো সাভিসের নাম, ছবি, বা টার্গেট লিংক পরিবর্তন করতে।
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold">/delete</span>
                    <button
                      onClick={() => handleCopy('/delete', 'কমান্ড')}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      কপি
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 font-sans">
                    ওয়েবসাইট থেকে যেকোনো সাভিস কার্ড স্থায়ীভাবে মুছে ফেলতে।
                  </p>
                </div>

                {/* Quick Add Syntax */}
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                  <p className="text-cyan-300 font-bold text-[11px] font-sans">
                    ⚡ এক লাইনে দ্রুত সাভিস যোগ করার স্পেশাল কমান্ড:
                  </p>
                  <code className="block bg-slate-950 p-2 rounded text-[10.5px] text-emerald-300 mt-1">
                    /add নাম | ছবির_লিংক | ক্লিক_লিংক | ক্যাটাগরি
                  </code>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="space-y-3">
              <p className="text-slate-400 text-[11px]">
                টেলিগ্রাম বট কীভাবে কাজ করে তা সরাসরি ব্রাউজার থেকেই টেস্ট করুন:
              </p>

              {/* Chat Simulation Window */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 h-56 overflow-y-auto space-y-2.5 font-mono text-[11px]">
                {simHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-white leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-sky-600 rounded-tr-none'
                          : 'bg-slate-800 border border-slate-700/80 rounded-tl-none'
                      }`}
                    >
                      <pre className="font-sans whitespace-pre-wrap">{msg.text}</pre>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Quick Prompt Badges */}
              <div className="flex flex-wrap gap-1.5">
                {['/start', '/list', '/add', '/edit', '/delete'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => handleRunCommand(cmd)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[11px] transition-colors cursor-pointer"
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRunCommand(simCommand);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={simCommand}
                  onChange={(e) => setSimCommand(e.target.value)}
                  placeholder="কমান্ড লিখুন (যেমন: /start অথবা /list)..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={isSimulating || !simCommand.trim()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>পাঠান</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-400 font-semibold text-[11px]">
                  সাম্প্রতিক বটের কার্যক্রম লগ:
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {botStatus.logs?.length || 0} Events
                </span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {botStatus.logs && botStatus.logs.length > 0 ? (
                  botStatus.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase font-mono ${
                              log.action === 'add'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : log.action === 'edit'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : log.action === 'delete'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-slate-300 font-medium truncate">
                            {log.text}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 block">
                          দ্বারা: {log.user}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-6">কোনো লগ পাওয়া যায়নি।</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>টেলিগ্রাম বট স্ট্যাটাস: ওকে</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors cursor-pointer text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
