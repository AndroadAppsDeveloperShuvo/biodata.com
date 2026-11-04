import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface Props {
  onShowToast: (msg: string) => void;
}

export const ShareAndFooter: React.FC<Props> = ({ onShowToast }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = 'https://androadappsdevelopershuvo.github.io/biodata.com';

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
    <div className="space-y-4">
      {/* Share Box */}
      <div id="btnShareProfile" className="share-profile-card p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between gap-3 shadow-md">
        <div className="space-y-0.5 min-w-0 flex-1">
          <h4 className="share-title text-xs font-bold text-white truncate">
            বন্ধুদের সাথে শেয়ার করুন
          </h4>
          <p className="share-sub text-[11px] text-slate-400 truncate">
            এই বায়ো পেজের লিংক এক ক্লিকে কপি করুন
          </p>
          <p className="text-[10px] font-mono text-cyan-400 truncate opacity-85">
            {shareUrl}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`share-action-btn px-3 py-1.5 active:scale-95 border text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
            copied
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
          }`}
          title="লিংক কপি করুন"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>কপি হয়েছে</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>শেয়ার লিংক</span>
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="pt-3 pb-2 text-center border-t border-slate-900/90">
        <p className="text-[11px] text-slate-500 font-medium">
          © 2026 ⚡ 乂 ＳＨＵＶＯ 乂 ⚡ • All Rights Reserved
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">
          Controlled via Telegram Bot • @djhakar007ff
        </p>
      </div>
    </div>
  );
};
