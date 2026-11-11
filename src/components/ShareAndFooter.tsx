import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
  themeStyle?: string;
}

export const ShareAndFooter: React.FC<Props> = ({ onShowToast, themeStyle }) => {
  const [copied, setCopied] = useState(false);
  const isIgnitronSpace = themeStyle === 'ignitron_cyber_space';
  const getShareUrl = () => {
    if (typeof window !== 'undefined' && window.location.href.startsWith('http')) {
      return window.location.origin + window.location.pathname;
    }
    return 'https://shuvopkofficial.github.io/biodata.com/';
  };
  const shareUrl = getShareUrl();

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        onShowToast('🔗 শেয়ার লিংক কপি হয়েছে!');
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const el = document.createElement('textarea');
    el.value = shareUrl;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      onShowToast('🔗 শেয়ার লিংক কপি হয়েছে!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('লিংক: ' + shareUrl);
    }
    document.body.removeChild(el);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Share Box */}
      <div
        id="btnShareProfile"
        data-cad-id="cad_share_card"
        data-cad-label="[SHARE_NODE]"
        data-cad-color="#ff2a85"
        className={`share-profile-card p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md ${
          isIgnitronSpace
            ? 'bg-slate-950 border-2 border-cyan-400/70 shadow-[0_0_25px_rgba(0,240,255,0.2)] relative overflow-hidden'
            : 'bg-slate-900/70 border border-slate-800/80'
        }`}
      >
        {isIgnitronSpace && (
          <div className="absolute top-1 left-2 text-cyan-400/70 text-[9px] font-bold">+</div>
        )}

        <div className="space-y-0.5 min-w-0 flex-1">
          <h4 className={`share-title text-xs font-bold truncate ${
            isIgnitronSpace ? 'text-cyan-300' : 'text-white'
          }`}>
            {isIgnitronSpace ? '[05] SHARE_SYSTEM_LINK' : 'বন্ধুদের সাথে শেয়ার করুন'}
          </h4>
          <p className="share-sub text-[11px] text-slate-400 truncate font-sans">
            এই বায়ো পেজের লিংক এক ক্লিকে কপি করুন
          </p>
          <p className="text-[10px] font-mono text-pink-400 truncate opacity-90 font-bold">
            {shareUrl}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`share-action-btn px-3 py-2 active:scale-95 border text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            copied
              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
              : isIgnitronSpace
              ? 'bg-cyan-400 hover:bg-pink-500 text-slate-950 hover:text-white border-cyan-300'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
          }`}
          title="লিংক কপি করুন"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-slate-950" />
              <span>[ COPIED ]</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-950 group-hover:text-white" />
              <span>{isIgnitronSpace ? '[ COPY_URL ]' : 'শেয়ার লিংক'}</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="pt-3 pb-2 text-center border-t border-slate-900/90 font-mono">
        <p className="text-[11px] text-cyan-400/90 font-bold tracking-wider">
          © 2026 // IGNITRON CYBER SPACE MATRIX • ⚡ 乂 ＳＨＵＶＯ 乂 ⚡
        </p>
        <p className="text-[10px] text-slate-500 mt-1">
          Controlled via Telegram Bot • @djhakar007ff
        </p>
      </div>
    </div>
  );
};
