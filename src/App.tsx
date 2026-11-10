/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BioHeader } from './components/BioHeader';
import { SocialLinks } from './components/SocialLinks';
import { HighlightsServices } from './components/HighlightsServices';
import { DirectContact } from './components/DirectContact';
import { ShareAndFooter } from './components/ShareAndFooter';
import { CyberSpaceCanvas } from './components/CyberSpaceCanvas';
import { BoidsWireframeCanvas } from './components/BoidsWireframeCanvas';
import { HighlightService, SocialLink, ContactInfo, PersonalInfo, Badge } from './types/bio';

const CACHE_KEY = 'shuvo_bio_live_cache_v2';
const FIREBASE_FALLBACK_URL = 'https://biodata-fd087-default-rtdb.asia-southeast1.firebasedatabase.app/bio.json';

interface CachedBioData {
  profile?: PersonalInfo | null;
  badges?: Badge[];
  services?: HighlightService[];
  socialLinks?: SocialLink[];
  contact?: ContactInfo | null;
  themeStyle?: string;
  layoutStyle?: string;
}

function getLocalCache(): CachedBioData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading bio cache:', e);
  }
  return null;
}

function setLocalCache(data: Partial<CachedBioData>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCache() || {};
    const updated = { ...current, ...data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error writing bio cache:', e);
  }
}

export default function App() {
  const initialCache = getLocalCache();

  // All state is purely driven by Bot / Database with instant defaults to prevent white screen
  const [profile, setProfile] = useState<PersonalInfo | null>(initialCache?.profile || {
    name: "⚡ 乂 ＳＨＵＶＯ 乂 ⚡",
    handle: "@shuvo_bhai_444",
    title: "💻 Full-Stack Developer & Tech Enthusiast",
    location: "Natore, Bangladesh",
    bio: "🚀 Building modern web apps with React, Node.js & TypeScript. Open source contributor, tech writer and gamer in free time!",
    avatarUrl: "https://i.ibb.co/bRWhx1Lf/4880.jpg",
    bannerUrl: "https://simpleprogrammer.com/wp-content/uploads/2023/05/Coding-Desk.jpg"
  });
  const [badges, setBadges] = useState<Badge[]>(initialCache?.badges || [
    { id: "b2", text: "🔥 Shuvo Official" },
    { id: "b3", text: "💻 Developer" },
    { id: "b4", text: "🎧 Music Lover" },
    { id: "b5", text: "🇧🇩 Bangladesh" },
    { id: "b6", text: "💥 Free Fire Lover" },
    { id: "b_1793006434361", text: "⚡ Pro Gamer" }
  ]);
  const [services, setServices] = useState<HighlightService[]>(initialCache?.services || [
    {
      id: "h1",
      title: "⚡ Shuvo Official image Uploader",
      subtitle: "Web Image Uploader",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10",
      linkUrl: "https://androadappsdevelopershuvo.github.io/web_image_uploader/WEB%20IMAGE%20UPLOAS.html"
    },
    {
      id: "h_1789432893967mf6",
      title: "Image to PDF Converter",
      subtitle: "ফটো ও মেমোরিজ",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0WKD8w5ijwQjZ9Kud4DBymrTdPbChGcgVb1HzbEBxMw&s",
      linkUrl: "https://androadappsdevelopershuvo.github.io/pdf/genaratore.html"
    }
  ]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialCache?.socialLinks || [
    {
      id: "s_1793007777906",
      platform: "facebook",
      title: "Facebook Profile",
      subtitle: "অফিসিয়াল ফেসবুক প্রোফাইল",
      buttonText: "যুক্ত হোন",
      url: "https://www.facebook.com/share/1c63KeYHxt/",
      enabled: true
    },
    {
      id: "s_1793007904903",
      platform: "telegram",
      title: "Telegram Channel / Group",
      subtitle: "টেলিগ্রাম চ্যানেল",
      buttonText: "যুক্ত হোন",
      url: "https://t.me/djhakar007ff",
      enabled: true
    }
  ]);
  const [contact, setContact] = useState<ContactInfo | null>(initialCache?.contact || {
    enabled: true,
    whatsappNumber: "+8801778526313",
    whatsappMessage: "𝐻𝐼々ᗪᴇᴠʟᴏᴘᴇʀ—͟͞Sʜᴜᴠᴏ...𝐼 𝐜𝐚𝐦𝐞 𝐟𝐫𝐨𝐦 𝐘𝐨𝐮𝐫 𝘄𝗲𝗯𝘀𝗶𝘁𝗲...𝐼 𝘄𝗮𝗻𝘁  𝗧𝗼 𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝘄𝗶𝘁𝗵 𝐘𝐨𝐮 👨‍💻",
    email: "freefirelover2111887942@gmail.com",
    telegramUsername: "djhakar007ff",
    customNote: "যেকোনো প্রজেক্ট, কলাবোরেশন বা যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন।"
  });
  const [themeStyle, setThemeStyle] = useState<string>(initialCache?.themeStyle || 'dark_glassmorphism');
  const [layoutStyle, setLayoutStyle] = useState<string>(initialCache?.layoutStyle || 'classic_stacked');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Layout View State (Active Tab & Three-Dot Drawer Toggle)
  const [activeTab, setActiveTab] = useState<'all' | 'bio' | 'social' | 'services' | 'contact'>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 2500);
  };

  const getApiBase = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      return 'https://ais-pre-ll677qupqrzjjnbmkbnpfl-12329983830.asia-east1.run.app';
    }
    return '';
  };

  // Apply fetched data to state & cache
  const applyData = useCallback((data: any) => {
    if (!data) return;
    if (data.themeStyle) {
      setThemeStyle(data.themeStyle);
    }
    if (data.layoutStyle) {
      setLayoutStyle(data.layoutStyle);
    }
    if (data.profile) {
      setProfile(data.profile);
    }
    if (Array.isArray(data.badges)) {
      setBadges(data.badges);
    }
    if (Array.isArray(data.services)) {
      setServices(data.services);
    }
    if (Array.isArray(data.socialLinks)) {
      setSocialLinks(data.socialLinks);
    }
    if (data.contact) {
      setContact(data.contact);
    }
    setLocalCache({
      profile: data.profile,
      badges: Array.isArray(data.badges) ? data.badges : undefined,
      services: Array.isArray(data.services) ? data.services : undefined,
      socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : undefined,
      contact: data.contact,
      themeStyle: data.themeStyle,
      layoutStyle: data.layoutStyle
    });
    setIsLoading(false);
  }, []);

  // Fetch from backend API with automatic Firebase fallback
  const fetchData = useCallback(async () => {
    const apiBase = getApiBase();
    try {
      const res = await fetch(`${apiBase}/api/data`);
      if (res.ok) {
        const data = await res.json();
        applyData(data);
        return;
      }
    } catch (err) {
      console.warn('API fetch failed, falling back to Firebase:', err);
    }

    try {
      const fbRes = await fetch(FIREBASE_FALLBACK_URL);
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        applyData(fbData);
      }
    } catch (err) {
      console.error('Firebase fallback error:', err);
    }
  }, [applyData]);

  useEffect(() => {
    fetchData();

    // SSE Realtime Updates from Backend Bot
    let eventSource: EventSource | null = null;
    try {
      const apiBase = getApiBase();
      eventSource = new EventSource(`${apiBase}/api/events`);
      
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'profile_updated' && payload.data) {
            setProfile(payload.data);
            setLocalCache({ profile: payload.data });
          } else if (payload.type === 'badges_updated' && Array.isArray(payload.data)) {
            setBadges(payload.data);
            setLocalCache({ badges: payload.data });
          } else if (payload.type === 'services_updated' && Array.isArray(payload.data)) {
            setServices(payload.data);
            setLocalCache({ services: payload.data });
          } else if (payload.type === 'social_updated' && Array.isArray(payload.data)) {
            setSocialLinks(payload.data);
            setLocalCache({ socialLinks: payload.data });
          } else if (payload.type === 'contact_updated' && payload.data) {
            setContact(payload.data);
            setLocalCache({ contact: payload.data });
          } else if (payload.type === 'theme_updated' && payload.data) {
            setThemeStyle(payload.data);
            setLocalCache({ themeStyle: payload.data });
          } else if (payload.type === 'layout_updated' && payload.data) {
            setLayoutStyle(payload.data);
            setLocalCache({ layoutStyle: payload.data });
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };
    } catch (e) {
      console.warn('SSE unsupported or unavailable:', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchData]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', themeStyle);
      document.body.setAttribute('data-layout', layoutStyle);
      document.documentElement.setAttribute('data-theme', themeStyle);
      document.documentElement.setAttribute('data-layout', layoutStyle);
    }
  }, [themeStyle, layoutStyle]);

  const isWireframe = themeStyle === 'ignitron_wireframe';
  const isIgnitronSpace = themeStyle === 'ignitron_cyber_space';
  const isShuvoxLightning = themeStyle === 'shuvox_lightning_cyber';
  const isGlass = themeStyle === 'dark_glassmorphism';
  const isCyber = themeStyle === 'cyberpunk_neon';
  const isOrganic = themeStyle === 'organic_nature';
  const isPopArt = themeStyle === 'bold_flat_popart';
  const isUltraGlass = themeStyle === 'ultra_cyber_glass';

  // Layout Models
  const isDrawerDockNav = layoutStyle === 'drawer_dock_nav';
  const isGridDashboard = layoutStyle === 'grid_dashboard';
  const isTabbedApp = layoutStyle === 'tabbed_app_layout';
  const isServicesFirst = layoutStyle === 'services_first';

  return (
    <div
      data-theme={themeStyle}
      data-layout={layoutStyle}
      className={`min-h-screen transition-colors duration-500 flex flex-col items-center py-4 sm:py-8 px-3 sm:px-4 selection:bg-cyan-400 selection:text-black relative overflow-hidden ${
      isWireframe
        ? 'bg-[#050505] text-white font-mono'
        : isIgnitronSpace
        ? 'bg-[#010309] text-cyan-50'
        : isShuvoxLightning
        ? 'bg-[#020617] text-white'
        : isPopArt
        ? 'bg-[#facc15] text-black'
        : isOrganic
        ? 'bg-[#dce6d8] text-[#1e3323]'
        : isCyber
        ? 'bg-[#030712] text-slate-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.25),rgba(3,7,18,0.98))]'
        : isGlass
        ? 'bg-gradient-to-br from-sky-100 via-amber-50 via-pink-100 to-purple-100 text-slate-900'
        : isUltraGlass
        ? 'bg-[#09090b] text-slate-100'
        : 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-slate-100'
    }`}>

      {/* Wireframe Particles Canvas */}
      {isWireframe && <BoidsWireframeCanvas />}

      {/* Cyber Space Arrowhead Swarm Canvas Theme */}
      {isIgnitronSpace && <CyberSpaceCanvas />}
      
      {/* SHUVOX Lightning Cyber 3D Background Orbs & Lightning Bolts */}
      {isShuvoxLightning && (
        <>
          <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/40 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
            <div className="absolute top-[40%] right-[-10%] w-96 h-96 bg-cyan-600/40 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[150px] animate-blob" style={{ animationDelay: '4s' }} />
          </div>

          <div className="fixed inset-0 w-full h-full z-0 pointer-events-none mix-blend-screen lightning-bg-flash" />
          <div className="fixed top-0 left-[70%] md:left-[80%] -translate-x-1/2 w-32 h-[60vh] z-0 pointer-events-none flex justify-center">
            <svg className="lightning-bolt-svg w-full h-full text-cyan-300 opacity-0" viewBox="0 0 100 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M60 0 L20 120 L50 130 L10 230 L45 220 L25 300 L90 150 L55 160 L85 60 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="fixed top-0 left-[20%] md:left-[15%] -translate-x-1/2 w-20 h-[40vh] z-0 pointer-events-none flex justify-center" style={{ animationDelay: '0.5s' }}>
            <svg className="lightning-bolt-svg w-full h-full text-purple-300 opacity-0" viewBox="0 0 100 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ animationDelay: '0.2s' }}>
              <path d="M50 0 L10 90 L40 100 L0 180 L35 170 L15 250 L80 120 L45 130 L75 40 Z" fill="currentColor" />
            </svg>
          </div>
        </>
      )}

      {/* Ultra Cyber Glass Ambient Grid Background & Glowing Orbs */}
      {isUltraGlass && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="fixed inset-0 bg-grid opacity-100" />
          <div className="fixed top-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-purple-600/35 blur-[120px] animate-pulse-glow-orb" />
          <div className="fixed bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-cyan-400/35 blur-[120px] animate-float-orb" style={{ animationDelay: '1s' }} />
          <div className="fixed top-[35%] left-[15%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full bg-fuchsia-500/25 blur-[100px] animate-float-orb" style={{ animationDelay: '2s' }} />
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white border border-cyan-400 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md transition-all duration-300 flex items-center gap-2 ${
          toastMsg
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-4 pointer-events-none scale-95'
        }`}
      >
        <span>{toastMsg}</span>
      </div>



      {/* MULTI-TAB APP LAYOUT SEGMENTED TABS */}
      {isTabbedApp && (
        <nav className="w-full max-w-[620px] mb-4 z-30 flex items-center p-1 bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-xl gap-1">
          <button
            onClick={() => setActiveTab('bio')}
            className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bio' || activeTab === 'all'
                ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🏠 বায়ো
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
              activeTab === 'social'
                ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🌐 সোশ্যাল
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
              activeTab === 'services'
                ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🛠️ সার্ভিস
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
              activeTab === 'contact'
                ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            📞 কন্টাক্ট
          </button>
        </nav>
      )}

      {/* MAIN CONTAINER LAYOUT SWITCHER */}
      {isGridDashboard ? (
        /* BENTO GRID DASHBOARD LAYOUT */
        <main
          data-theme={themeStyle}
          className="w-full max-w-[980px] rounded-3xl transition-all duration-500 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5"
        >
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-5">
            <div className={`rounded-3xl p-1 transition-all ${
              isUltraGlass
                ? 'glass-premium rounded-[2rem]'
                : isPopArt
                ? 'bg-[#fef08a] border-4 border-black text-black shadow-[8px_8px_0px_0px_#000000]'
                : isOrganic
                ? 'bg-[#e2ece0] border border-[#9cb09a] text-[#1e3323]'
                : 'bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl'
            }`}>
              <BioHeader profile={profile} badges={badges} themeStyle={themeStyle} />
            </div>

            <div className={`p-4 rounded-3xl ${
              isUltraGlass ? 'glass-card' : 'bg-slate-900/80 border border-slate-800'
            }`}>
              <p className="text-xs font-bold text-cyan-400 mb-2">⚡ কুইক অ্যাকশন</p>
              <DirectContact contact={contact} themeStyle={themeStyle} />
            </div>
          </div>

          {/* Right Column: Services, Socials & Share */}
          <div className="lg:col-span-8 space-y-5">
            <div className={`p-5 rounded-3xl ${
              isUltraGlass ? 'glass-card' : 'bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl'
            }`}>
              <HighlightsServices services={services} themeStyle={themeStyle} />
            </div>

            <div className={`p-5 rounded-3xl ${
              isUltraGlass ? 'glass-card' : 'bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl'
            }`}>
              <SocialLinks links={socialLinks} themeStyle={themeStyle} />
            </div>

            <ShareAndFooter onShowToast={showToast} themeStyle={themeStyle} />
          </div>
        </main>
      ) : (
        /* STANDARD OR TABBED / DRAWER CONTAINER */
        <main
          data-theme={themeStyle}
          className={`w-full max-w-[620px] rounded-3xl transition-all duration-500 relative z-10 ${
            isIgnitronSpace
              ? 'bg-transparent text-cyan-50 border-0 shadow-none'
              : isShuvoxLightning
              ? 'bg-transparent text-white border-0 shadow-none'
              : isUltraGlass
              ? 'glass-premium rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.2)]'
              : isPopArt
              ? 'bg-[#fef08a] border-4 border-black text-black shadow-[8px_8px_0px_0px_#000000]'
              : isOrganic
              ? 'bg-[#e2ece0] border border-[#9cb09a] text-[#1e3323] shadow-xl shadow-[#587256]/20'
              : isCyber
              ? 'bg-[#080d1e] border-2 border-cyan-400/90 shadow-[0_0_40px_rgba(34,211,238,0.4)]'
              : isGlass
              ? 'bg-white/75 backdrop-blur-2xl border-2 border-white/90 shadow-[0_25px_60px_rgba(100,116,139,0.2)] text-slate-900'
              : 'bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl'
          }`}
        >
          {/* Profile Header & Avatar */}
          {(activeTab === 'all' || activeTab === 'bio') && (
            <BioHeader profile={profile} badges={badges} themeStyle={themeStyle} />
          )}

          {/* Content Sections */}
          <div className="px-4 sm:px-5 pb-6 space-y-5">
            {isServicesFirst ? (
              <>
                {(activeTab === 'all' || activeTab === 'services') && (
                  <HighlightsServices services={services} themeStyle={themeStyle} />
                )}
                {(activeTab === 'all' || activeTab === 'social') && (
                  <SocialLinks links={socialLinks} themeStyle={themeStyle} />
                )}
              </>
            ) : (
              <>
                {(activeTab === 'all' || activeTab === 'social') && (
                  <SocialLinks links={socialLinks} themeStyle={themeStyle} />
                )}
                {(activeTab === 'all' || activeTab === 'services') && (
                  <HighlightsServices services={services} themeStyle={themeStyle} />
                )}
              </>
            )}

            {(activeTab === 'all' || activeTab === 'contact') && (
              <DirectContact contact={contact} themeStyle={themeStyle} />
            )}

            {/* Skeleton placeholder during first visit */}
            {isLoading && !profile && (
              <div className="space-y-3 py-4 animate-pulse">
                <div className="h-10 bg-slate-900/80 rounded-xl border border-slate-800" />
                <div className="h-28 bg-slate-900/80 rounded-xl border border-slate-800" />
              </div>
            )}

            {/* QR Code & Share Box */}
            <ShareAndFooter onShowToast={showToast} themeStyle={themeStyle} />
          </div>
        </main>
      )}
    </div>
  );
}
