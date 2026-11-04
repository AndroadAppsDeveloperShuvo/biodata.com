import React, { useState } from 'react';
import { MoreVertical, X, Home, User, Share2, Wrench, MessageCircle, QrCode, Sparkles, Layers } from 'lucide-react';
import { PersonalInfo } from '../types/bio';

interface Props {
  profile: PersonalInfo | null;
  themeStyle?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  layoutStyle?: string;
}

export const NavigationDrawer: React.FC<Props> = ({
  profile,
  themeStyle,
  activeTab,
  setActiveTab,
  layoutStyle
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isGlass = themeStyle === 'dark_glassmorphism';
  const isPopArt = themeStyle === 'bold_flat_popart';
  const isOrganic = themeStyle === 'organic_nature';
  const isUltraGlass = themeStyle === 'ultra_cyber_glass';

  const scrollToSection = (id: string, tabName: string) => {
    setActiveTab(tabName);
    setIsOpen(false);
    if (tabName === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { id: 'all', label: 'হোম (All)', icon: Home, sectionId: 'sec-header' },
    { id: 'bio', label: 'বায়ো & প্রোফাইল', icon: User, sectionId: 'sec-header' },
    { id: 'social', label: 'সোশ্যাল মিডিয়া', icon: Share2, sectionId: 'sec-social' },
    { id: 'services', label: 'সাভিস & টুলস', icon: Wrench, sectionId: 'sec-services' },
    { id: 'contact', label: 'সরাসরি যোগাযোগ', icon: MessageCircle, sectionId: 'sec-contact' },
    { id: 'share', label: 'শেয়ার & QR Code', icon: QrCode, sectionId: 'sec-share' },
  ];

  return (
    <header className="sticky top-2 w-full max-w-[620px] mb-4 z-40 font-sans">
      {/* Top Main App Header Bar */}
      <div className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all duration-300 backdrop-blur-2xl shadow-2xl ${
        isPopArt
          ? 'bg-[#fef08a] border-2 border-black text-black shadow-[4px_4px_0px_0px_#000]'
          : isOrganic
          ? 'bg-[#e2ece0]/95 border border-[#9cb09a] text-[#1e3323] shadow-md'
          : isUltraGlass
          ? 'bg-zinc-950/90 border border-cyan-500/40 text-white shadow-[0_0_25px_rgba(34,211,238,0.3)]'
          : isGlass
          ? 'bg-white/90 border border-white/90 text-slate-900 shadow-md'
          : 'bg-slate-900/90 border border-slate-700/80 text-white shadow-xl'
      }`}>
        {/* Left Avatar & Name Brand */}
        <div 
          onClick={() => scrollToSection('sec-header', 'all')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-cyan-400/80 shadow-md">
            <img
              src={profile?.avatarUrl || 'https://i.ibb.co/bRWhx1Lf/4880.jpg'}
              alt="Avatar"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm tracking-tight leading-tight flex items-center gap-1">
              <span>{profile?.name || 'Bio Data'}</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </h3>
            <p className="text-[10px] opacity-75 font-mono">
              {profile?.handle || '@official'}
            </p>
          </div>
        </div>

        {/* Right Action Icons & 3-Dot Button */}
        <div className="flex items-center gap-2">
          {/* Layout Model Badge */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
            layoutStyle === 'app_drawer_3dot'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 animate-pulse'
              : 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-400'
          }`}>
            <Layers className="w-3 h-3 text-cyan-400" />
            {layoutStyle === 'app_drawer_3dot' ? '⋮ 3-Dot App' : layoutStyle === 'bento_box_grid' ? '🍱 Bento' : layoutStyle === 'split_sidebar_grid' ? '⚡ Split' : '📱 Standard'}
          </span>

          {/* 3-Dot Menu Button (⋮) with Pulsing Glow Indicator */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle 3-Dot Menu"
            className={`relative p-2.5 rounded-xl transition-all flex items-center justify-center font-bold gap-1 ${
              isOpen
                ? 'bg-rose-500 text-white shadow-lg ring-2 ring-rose-400'
                : layoutStyle === 'app_drawer_3dot'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] ring-2 ring-cyan-400 animate-pulse'
                : isPopArt
                ? 'bg-black text-white hover:bg-yellow-400 hover:text-black border border-black'
                : isUltraGlass
                ? 'bg-cyan-500/30 text-cyan-200 hover:bg-cyan-500/50 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                : isGlass
                ? 'bg-sky-100 text-sky-900 hover:bg-sky-200 border border-sky-300'
                : 'bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <>
                <MoreVertical className="w-5 h-5" />
                <span className="text-[10px] hidden sm:inline-block font-mono">MENU</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Filter Pills Bar (Quick Navigation Bar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 px-1 mt-1 font-mono text-[11px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.sectionId, item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? isPopArt
                    ? 'bg-black text-yellow-300 font-bold shadow-[2px_2px_0px_0px_#000]'
                    : isUltraGlass
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-105'
                    : isGlass
                    ? 'bg-sky-600 text-white font-bold shadow'
                    : 'bg-cyan-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/30'
                  : isPopArt
                  ? 'bg-yellow-100 text-black border border-black'
                  : isOrganic
                  ? 'bg-[#dce6d8] text-[#1e3323] hover:bg-[#c8d8c3]'
                  : isGlass
                  ? 'bg-white/60 text-slate-700 hover:bg-white'
                  : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3-Dot Drawer Overlay Menu */}
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
          />

          {/* Sliding Glass Drawer Panel */}
          <div className={`fixed top-4 right-4 bottom-4 w-72 sm:w-80 rounded-3xl p-5 z-50 flex flex-col justify-between backdrop-blur-2xl transition-all duration-300 shadow-2xl animate-slideLeft ${
            isPopArt
              ? 'bg-[#fef08a] border-4 border-black text-black shadow-[8px_8px_0px_0px_#000]'
              : isOrganic
              ? 'bg-[#e2ece0] border-2 border-[#9cb09a] text-[#1e3323]'
              : isUltraGlass
              ? 'bg-zinc-950/95 border-2 border-cyan-400/60 text-white shadow-[0_0_40px_rgba(34,211,238,0.4)]'
              : isGlass
              ? 'bg-white/95 border-2 border-white text-slate-900 shadow-2xl'
              : 'bg-slate-950/95 border-2 border-cyan-500/50 text-white shadow-2xl'
          }`}>
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-current/15 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400">
                    <img
                      src={profile?.avatarUrl || 'https://i.ibb.co/bRWhx1Lf/4880.jpg'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{profile?.name}</h4>
                    <p className="text-xs opacity-75">{profile?.handle}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.sectionId, item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? isPopArt
                            ? 'bg-black text-yellow-300 font-bold'
                            : isUltraGlass
                            ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-bold'
                            : 'bg-cyan-500 text-slate-950 font-extrabold'
                          : 'hover:bg-white/10 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Info */}
            <div className="pt-4 border-t border-current/15 text-center text-xs opacity-70 space-y-1">
              <p className="font-mono">⚡ SHUVO BIO APP v3.0</p>
              <p className="text-[10px]">Powered by Live Telegram & Firebase</p>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
