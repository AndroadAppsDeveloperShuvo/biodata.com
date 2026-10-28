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
import { HighlightService, SocialLink, ContactInfo, PersonalInfo, Badge } from './types/bio';

const CACHE_KEY = 'shuvo_bio_live_cache_v2';
const FIREBASE_FALLBACK_URL = 'https://biodata-fd087-default-rtdb.asia-southeast1.firebasedatabase.app/bio.json';

interface CachedBioData {
  profile?: PersonalInfo | null;
  badges?: Badge[];
  services?: HighlightService[];
  socialLinks?: SocialLink[];
  contact?: ContactInfo | null;
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

  // All state is purely driven by Bot / Database (no hardcoded defaults)
  const [profile, setProfile] = useState<PersonalInfo | null>(initialCache?.profile || null);
  const [badges, setBadges] = useState<Badge[]>(initialCache?.badges || []);
  const [services, setServices] = useState<HighlightService[]>(initialCache?.services || []);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialCache?.socialLinks || []);
  const [contact, setContact] = useState<ContactInfo | null>(initialCache?.contact || null);
  const [themeStyle, setThemeStyle] = useState<string>('classic_dark');
  const [isLoading, setIsLoading] = useState<boolean>(!initialCache?.profile);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
      contact: data.contact
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

    // Direct Firebase fallback (for GitHub Pages or when API is cold)
    try {
      const fbRes = await fetch(FIREBASE_FALLBACK_URL);
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        if (fbData) {
          applyData(fbData);
        }
      }
    } catch (fbErr) {
      console.error('Firebase fallback also failed:', fbErr);
    } finally {
      setIsLoading(false);
    }
  }, [applyData]);

  useEffect(() => {
    fetchData();

    // Listen to real-time events via Server-Sent Events (SSE)
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

  const isGlass = themeStyle === 'dark_glassmorphism';
  const isCyber = themeStyle === 'cyberpunk_neon';
  const isOrganic = themeStyle === 'organic_nature';

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col items-center py-4 sm:py-8 px-3 sm:px-4 selection:bg-cyan-500 selection:text-black relative overflow-hidden ${
      isOrganic
        ? 'bg-[#dce6d8] text-[#1e3323]'
        : isCyber
        ? 'bg-[#030712] text-slate-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.25),rgba(3,7,18,0.98))]'
        : isGlass
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950/70 to-slate-950 text-slate-100'
        : 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-slate-100'
    }`}>
      
      {/* Organic Nature Ambient Leaf Silhouettes */}
      {isOrganic && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="absolute -top-10 -left-10 w-72 h-72 text-[#597762]/20 transform rotate-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17,8C8,10 5,16 3,22C5,22 13,22 19,16C21,14 22,9 17,8M16.5,14.5C13.5,16.5 9,17.5 5.5,18C6.5,15 9,12 14.5,10.5C16.5,12 16.5,13.5 16.5,14.5Z"/>
          </svg>
          <svg className="absolute -bottom-10 -right-10 w-80 h-80 text-[#c09367]/20 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17,8C8,10 5,16 3,22C5,22 13,22 19,16C21,14 22,9 17,8M16.5,14.5C13.5,16.5 9,17.5 5.5,18C6.5,15 9,12 14.5,10.5C16.5,12 16.5,13.5 16.5,14.5Z"/>
          </svg>
        </div>
      )}

      {/* Ambient Glassmorphism Glow Orbs */}
      {isGlass && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-24 -left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute -bottom-20 left-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
      )}

      {/* Cyberpunk Glow Orbs */}
      {isCyber && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
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

      {/* Main Responsive Bio Container */}
      <main className={`w-full max-w-[480px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 relative z-10 ${
        isOrganic
          ? 'bg-[#e2ece0] border border-[#9cb09a] text-[#1e3323] shadow-xl shadow-[#587256]/20'
          : isCyber
          ? 'bg-[#080d1e] border-2 border-cyan-400/90 shadow-[0_0_40px_rgba(34,211,238,0.4)]'
          : isGlass
          ? 'bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
          : 'bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl'
      }`}>
        {/* Profile Header & Avatar (Fully Dynamic from Bot) */}
        <BioHeader profile={profile} badges={badges} />

        {/* Content Sections */}
        <div className="px-4 sm:px-5 pb-6 space-y-5">
          {/* Social Links List (Live Controlled via Telegram Bot) */}
          <SocialLinks links={socialLinks} />

          {/* Highlights & Services Grid (Live Controlled via Telegram Bot) */}
          <HighlightsServices services={services} />

          {/* Direct Contact Buttons (Live Controlled via Telegram Bot) */}
          <DirectContact contact={contact} />

          {/* Skeleton placeholder during first visit if waiting for initial network load */}
          {isLoading && !profile && (
            <div className="space-y-3 py-4 animate-pulse">
              <div className="h-10 bg-slate-900/80 rounded-xl border border-slate-800" />
              <div className="h-28 bg-slate-900/80 rounded-xl border border-slate-800" />
            </div>
          )}

          {/* QR Code & Share Box */}
          <ShareAndFooter onShowToast={showToast} />
        </div>
      </main>
    </div>
  );
}
