import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { ContactInfo } from '../types/bio';

interface Props {
  contact: ContactInfo | null;
  themeStyle?: string;
}

export const DirectContact: React.FC<Props> = ({ contact, themeStyle }) => {
  const isIgnitronSpace = themeStyle === 'ignitron_cyber_space';

  if (!contact || !contact.enabled) return null;

  return (
    <div
      id="contactContainer"
      className={`contact-card p-4 rounded-2xl space-y-3 shadow-lg ${
        isIgnitronSpace
          ? 'bg-slate-950 border-2 border-cyan-400/70 shadow-[0_0_25px_rgba(0,240,255,0.2)] font-mono relative overflow-hidden'
          : 'bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800'
      }`}
    >
      {isIgnitronSpace && (
        <div className="absolute top-1 left-2 text-cyan-400/70 text-[9px] font-bold">+</div>
      )}

      <div className="flex items-center justify-between">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${
          isIgnitronSpace ? 'text-cyan-300' : 'text-cyan-400'
        }`}>
          {isIgnitronSpace ? '[04] DIRECT_COMMUNICATION // MSG_HUB' : 'সরাসরি যোগাযোগ করুন'}
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">[DIRECT_NODE]</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(contact.whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 group ${
            isIgnitronSpace
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono tracking-wider'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>{isIgnitronSpace ? '[ WHATSAPP_NODE ]' : 'হোয়াটসঅ্যাপ মেসেজ'}</span>
        </a>

        {/* Email Button */}
        <a
          href={`mailto:${contact.email}`}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs border transition-all active:scale-95 group ${
            isIgnitronSpace
              ? 'bg-slate-900 hover:bg-slate-800 border-cyan-400 text-cyan-300 font-mono tracking-wider'
              : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
          }`}
        >
          <Mail className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>{isIgnitronSpace ? '[ EMAIL_DISPATCH ]' : 'ইমেইল পাঠান'}</span>
        </a>
      </div>

      {contact.customNote && (
        <p className="text-[10.5px] text-slate-400 italic text-center pt-1 font-sans">
          &ldquo;{contact.customNote}&rdquo;
        </p>
      )}
    </div>
  );
};
