/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BioHeader } from './components/BioHeader';
import { SocialLinks } from './components/SocialLinks';
import { HighlightsServices } from './components/HighlightsServices';
import { DirectContact } from './components/DirectContact';
import { ShareAndFooter } from './components/ShareAndFooter';
import {
  INITIAL_SERVICES,
  PROFILE_INFO,
  BADGES,
  SOCIAL_LINKS,
  CONTACT_INFO
} from './data/defaultServices';
import { HighlightService, SocialLink, ContactInfo } from './types/bio';

export default function App() {
  const [services, setServices] = useState<HighlightService[]>(INITIAL_SERVICES);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(SOCIAL_LINKS);
  const [contact, setContact] = useState<ContactInfo>(CONTACT_INFO);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Show Toast feedback
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 2500);
  };

  // Fetch all live data from backend
  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data.services && Array.isArray(data.services)) {
          setServices(data.services);
        }
        if (data.socialLinks && Array.isArray(data.socialLinks)) {
          setSocialLinks(data.socialLinks);
        }
        if (data.contact) {
          setContact(data.contact);
        }
      }
    } catch (err) {
      console.warn('Backend fetch fallback to initial data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to real-time events via Server-Sent Events (SSE)
    // Whenever Shuvo uses the Telegram Bot to update Social Links, Contact, or Services,
    // the website instantly updates live!
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'services_updated' && Array.isArray(payload.data)) {
            setServices(payload.data);
          } else if (payload.type === 'social_updated' && Array.isArray(payload.data)) {
            setSocialLinks(payload.data);
          } else if (payload.type === 'contact_updated' && payload.data) {
            setContact(payload.data);
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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-slate-100 flex flex-col items-center py-4 sm:py-8 px-3 sm:px-4 selection:bg-cyan-500 selection:text-black">
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

      {/* Main Responsive Bio Container (Phone Mockup Frame in Center) */}
      <main className="w-full max-w-[480px] bg-slate-950/80 border border-slate-800/80 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 relative">
        {/* Profile Header & Avatar */}
        <BioHeader
          profile={PROFILE_INFO}
          badges={BADGES}
        />

        {/* Content Sections */}
        <div className="px-4 sm:px-5 pb-6 space-y-5">
          {/* Social Links List (Live Controlled via Telegram Bot) */}
          <SocialLinks links={socialLinks} />

          {/* Highlights & Services Grid (Live Controlled via Telegram Bot) */}
          <HighlightsServices services={services} />

          {/* Direct Contact Buttons (Live Controlled via Telegram Bot) */}
          <DirectContact contact={contact} />

          {/* QR Code & Share Box */}
          <ShareAndFooter onShowToast={showToast} />
        </div>
      </main>
    </div>
  );
}
