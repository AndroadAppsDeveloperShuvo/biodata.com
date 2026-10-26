import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { ContactInfo } from '../types/bio';

interface Props {
  contact: ContactInfo | null;
}

export const DirectContact: React.FC<Props> = ({ contact }) => {
  if (!contact || !contact.enabled) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
          সরাসরি যোগাযোগ করুন
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">Direct Message</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(contact.whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 group"
        >
          <MessageCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span>হোয়াটসঅ্যাপ মেসেজ</span>
        </a>

        {/* Email Button */}
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all active:scale-95 group"
        >
          <Mail className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>ইমেইল পাঠান</span>
        </a>
      </div>

      {contact.customNote && (
        <p className="text-[10.5px] text-slate-400 italic text-center pt-1">
          &ldquo;{contact.customNote}&rdquo;
        </p>
      )}
    </div>
  );
};
