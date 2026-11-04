import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { SocialLink } from '../types/bio';

interface Props {
  links: SocialLink[];
}

export const SocialLinks: React.FC<Props> = ({ links }) => {
  const getIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'telegram':
        return (
          <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.942z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-5 h-5 text-[#25F4EE] [filter:drop-shadow(-1px_-1px_0px_#25F4EE)_drop-shadow(1px_1px_0px_#FE2C55)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.33 6.33 0 0 0 9.33 22a6.33 6.33 0 0 0 6.33-6.33V9a8.16 8.16 0 0 0 4.71 1.48v-3.79a4.85 4.85 0 0 1-.78 0z" />
          </svg>
        );
      case 'snapchat':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.002 2c-3.882 0-6.19 2.85-6.19 6.223 0 1.258.334 2.68.73 3.633.155.372.235.636.084.851-.158.227-.58.351-1.07.49-.661.189-1.488.425-1.928.981-.365.46-.275 1.05.215 1.442.502.402 1.341.527 2.067.636.219.033.435.066.623.104.223.045.367.143.434.331.096.269-.033.722-.224 1.388-.231.808-.557 1.948.243 2.583.438.348 1.026.417 1.745.205.811-.239 1.838-.937 3.27-1.121.282-.036.568-.054.852-.054.284 0 .57.018.852.054 1.432.184 2.459.882 3.27 1.121.719.212 1.307.143 1.745-.205.8-.635.474-1.775.243-2.583-.191-.666-.32-1.119-.224-1.388.067-.188.211-.286.434-.331.188-.038.404-.071.623-.104.726-.109 1.565-.234 2.067-.636.49-.392.58-.982.215-1.442-.44-.556-1.267-.792-1.928-.981-.49-.139-.912-.263-1.07-.49-.151-.215-.071-.479.084-.851.396-.953.73-2.375.73-3.633C18.192 4.85 15.884 2 12.002 2z" />
          </svg>
        );
      case 'github':
        return (
          <svg className="w-5 h-5 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        );
      case 'twitter':
      default:
        return (
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  if (!links || links.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          সোশ্যাল লিংক ও প্ল্যাটফর্ম
        </h2>
        <span className="text-[10px] text-cyan-400/80 font-mono">Official Links</span>
      </div>

      <div className="space-y-2">
        {links.filter(l => l.enabled).map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link-card group w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 ease-out hover:scale-[1.025] hover:-translate-y-0.5 hover:shadow-xl neon-border active:scale-[0.98]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                {getIcon(link.platform)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                  {link.title}
                </h3>
                <p className="text-[11px] text-slate-400 truncate">
                  {link.subtitle}
                </p>
              </div>
            </div>

            <div className="shrink-0 pl-2">
              <span className="social-btn-badge inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl bg-white/10 group-hover:bg-cyan-500 group-hover:text-slate-950 text-white transition-all shadow-sm">
                <span>{link.buttonText}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
