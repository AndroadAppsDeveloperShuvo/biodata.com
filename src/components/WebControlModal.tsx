import React, { useState, useEffect } from 'react';
import { PersonalInfo, Badge, HighlightService, SocialLink, ContactInfo } from '../types/bio';
import { ClientRecord } from '../clientTemplates';

interface ClientNotice {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  createdAt: string;
  active: boolean;
}

interface WebControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: PersonalInfo | null;
  currentBadges: Badge[];
  currentServices: HighlightService[];
  currentSocialLinks: SocialLink[];
  currentContact: ContactInfo | null;
  currentThemeStyle: string;
  onRefreshData: () => void;
  onShowToast: (msg: string) => void;
}

export const WebControlModal: React.FC<WebControlModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  currentBadges,
  currentServices,
  currentSocialLinks,
  currentContact,
  currentThemeStyle,
  onRefreshData,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'clients' | 'theme' | 'profile' | 'services' | 'contact'>('notices');
  const [notices, setNotices] = useState<ClientNotice[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // New Notice form state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeType, setNewNoticeType] = useState<'info' | 'warning' | 'success' | 'urgent'>('info');

  // New Client form state
  const [newClientChatId, setNewClientChatId] = useState('');
  const [newClientAppName, setNewClientAppName] = useState('');
  const [newClientShortName, setNewClientShortName] = useState('BIO DATA');
  const [newClientLogoUrl, setNewClientLogoUrl] = useState('');

  // Selected Client Editing
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

  // Profile Edit Form State
  const [profName, setProfName] = useState('');
  const [profHandle, setProfHandle] = useState('');
  const [profTitle, setProfTitle] = useState('');
  const [profLocation, setProfLocation] = useState('');
  const [profBio, setProfBio] = useState('');
  const [profAvatar, setProfAvatar] = useState('');
  const [profBanner, setProfBanner] = useState('');

  // Contact Edit Form State
  const [cntWhatsapp, setCntWhatsapp] = useState('');
  const [cntWhatsappMsg, setCntWhatsappMsg] = useState('');
  const [cntEmail, setCntEmail] = useState('');
  const [cntTelegram, setCntTelegram] = useState('');
  const [cntNote, setCntNote] = useState('');

  // Service Edit Form State
  const [srvTitle, setSrvTitle] = useState('');
  const [srvSubtitle, setSrvSubtitle] = useState('');
  const [srvImageUrl, setSrvImageUrl] = useState('');
  const [srvLinkUrl, setSrvLinkUrl] = useState('');

  // Social Edit Form State
  const [socTitle, setSocTitle] = useState('');
  const [socUrl, setSocUrl] = useState('');
  const [socPlatform, setSocPlatform] = useState<'facebook' | 'telegram' | 'youtube' | 'instagram' | 'tiktok' | 'snapchat' | 'twitter' | 'github' | 'custom'>('custom');
  const [socButtonText, setSocButtonText] = useState('যুক্ত হোন');

  useEffect(() => {
    if (isOpen) {
      fetchNotices();
      fetchClients();
      if (currentProfile) {
        setProfName(currentProfile.name || '');
        setProfHandle(currentProfile.handle || '');
        setProfTitle(currentProfile.title || '');
        setProfLocation(currentProfile.location || '');
        setProfBio(currentProfile.bio || '');
        setProfAvatar(currentProfile.avatarUrl || '');
        setProfBanner(currentProfile.bannerUrl || '');
      }
      if (currentContact) {
        setCntWhatsapp(currentContact.whatsappNumber || '');
        setCntWhatsappMsg(currentContact.whatsappMessage || '');
        setCntEmail(currentContact.email || '');
        setCntTelegram(currentContact.telegramUsername || '');
        setCntNote(currentContact.customNote || '');
      }
    }
  }, [isOpen, currentProfile, currentContact]);

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
      }
    } catch (e) {
      console.error('Failed to fetch notices:', e);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.clients)) {
          setClients(data.clients);
        }
      }
    } catch (e) {
      console.error('Failed to fetch clients:', e);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) {
      onShowToast('❌ নোটিশ শিরোনাম ও বিবরণ দিন');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNoticeTitle,
          content: newNoticeContent,
          type: newNoticeType
        })
      });
      if (res.ok) {
        onShowToast('✅ ক্লায়েন্ট নোটিশ সফলভাবে যুক্ত করা হয়েছে');
        setNewNoticeTitle('');
        setNewNoticeContent('');
        fetchNotices();
      }
    } catch (err) {
      onShowToast('❌ নোটিশ দিতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('আপনি কি এই নোটিশটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onShowToast('🗑️ নোটিশ মুছে ফেলা হয়েছে');
        fetchNotices();
      }
    } catch (err) {
      onShowToast('❌ ভুল হয়েছে');
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientChatId || !newClientAppName) {
      onShowToast('❌ Chat ID এবং App/Client নাম আবশ্যক');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: newClientChatId,
          appName: newClientAppName,
          shortName: newClientShortName,
          logoUrl: newClientLogoUrl
        })
      });
      if (res.ok) {
        onShowToast('✅ নতুন ক্লায়েন্ট সফলভাবে যুক্ত হয়েছে!');
        setNewClientChatId('');
        setNewClientAppName('');
        setNewClientLogoUrl('');
        fetchClients();
      }
    } catch (err) {
      onShowToast('❌ ক্লায়েন্ট তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`আপনি কি "${name}" ক্লায়েন্টটি চিরতরে ডিলিট করতে চান?`)) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onShowToast('🗑️ ক্লায়েন্ট ডিলিট করা হয়েছে');
        if (selectedClient?.id === id) setSelectedClient(null);
        fetchClients();
      }
    } catch (err) {
      onShowToast('❌ ডিলিট করতে ব্যর্থ হয়েছে');
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profName,
          handle: profHandle,
          title: profTitle,
          location: profLocation,
          bio: profBio,
          avatarUrl: profAvatar,
          bannerUrl: profBanner
        })
      });
      if (res.ok) {
        onShowToast('✅ প্রোফাইল আপডেট সফল হয়েছে!');
        onRefreshData();
      }
    } catch (err) {
      onShowToast('❌ আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTheme = async (themeStyle: string) => {
    try {
      const res = await fetch('/api/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeStyle })
      });
      if (res.ok) {
        onShowToast('🎨 থিম সফলভাবে পরিবর্তিত হয়েছে!');
        onRefreshData();
      }
    } catch (err) {
      onShowToast('❌ থিম পরিবর্তন করতে ব্যর্থ');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitle || !srvLinkUrl) {
      onShowToast('❌ সার্ভিসের শিরোনাম ও লিঙ্ক দিন');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: srvTitle,
          subtitle: srvSubtitle || 'অফিসিয়াল টুলস',
          imageUrl: srvImageUrl,
          linkUrl: srvLinkUrl
        })
      });
      if (res.ok) {
        onShowToast('✅ নতুন সার্ভিস যোগ করা হয়েছে!');
        setSrvTitle('');
        setSrvSubtitle('');
        setSrvImageUrl('');
        setSrvLinkUrl('');
        onRefreshData();
      }
    } catch (err) {
      onShowToast('❌ সার্ভিস যোগ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('সার্ভিসটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onShowToast('🗑️ সার্ভিস ডিলিট হয়েছে');
        onRefreshData();
      }
    } catch (err) {
      onShowToast('❌ সমস্যা হয়েছে');
    }
  };

  const handleAddSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socTitle || !socUrl) {
      onShowToast('❌ সোশ্যাল শিরোনাম ও URL দিন');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: socTitle,
          url: socUrl,
          platform: socPlatform,
          buttonText: socButtonText
        })
      });
      if (res.ok) {
        onShowToast('✅ সোশ্যাল লিঙ্ক যোগ করা হয়েছে!');
        setSocTitle('');
        setSocUrl('');
        onRefreshData();
      }
    } catch (err) {
      onShowToast('❌ সোশ্যাল লিঙ্ক যোগ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSocial = async (id: string) => {
    if (!confirm('সোশ্যাল লিঙ্কটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/social/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onShowToast('🗑️ সোশ্যাল লিঙ্ক ডিলিট হয়েছে');
        onRefreshData();
      }
    } catch (err) {
      onShowToast('❌ সমস্যা হয়েছে');
    }
  };

  const handleUpdateContact = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true,
          whatsappNumber: cntWhatsapp,
          whatsappMessage: cntWhatsappMsg,
          email: cntEmail,
          telegramUsername: cntTelegram,
          customNote: cntNote
        })
      });
      if (res.ok) {
        onShowToast('✅ কন্টাক্ট ইনফো আপডেট করা হয়েছে!');
        onRefreshData();
      }
    } catch (err) {
      onShowToast('❌ কন্টাক্ট আপডেট হতে পারেনি');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-100 relative">
        
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-extrabold text-lg">
              🌐
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>24/7 Web Control Dashboard</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">LIVE</span>
              </h2>
              <p className="text-xs text-slate-400">টেলিগ্রাম বট ছাড়াই সরাসরি ওয়েবে সব সময় আপনার সাইট কন্ট্রোল করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 overflow-x-auto shrink-0 scrollbar-none px-2">
          <button
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'notices'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📢 ক্লায়েন্ট নোটিশ</span>
            {notices.length > 0 && (
              <span className="bg-cyan-500 text-black text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {notices.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'clients'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👥 ক্লায়েন্ট সাইটসমূহ</span>
            {clients.length > 0 && (
              <span className="bg-purple-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {clients.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'theme'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎨 থিম ও লেআউট</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📝 প্রোফাইল ও বায়ো</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'services'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🛠️ সার্ভিস ও সোশ্যাল</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              activeTab === 'contact'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📞 কন্টাক্ট সেটিংস</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto grow space-y-6">

          {/* TAB 1: NOTICES BOARD */}
          {activeTab === 'notices' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                  <span>📢 নতুন ক্লায়েন্ট নোটিশ যোগ করুন</span>
                </h3>
                <form onSubmit={handleCreateNotice} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">নোটিশ টাইটেল (শিরোনাম)</label>
                    <input
                      type="text"
                      value={newNoticeTitle}
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      placeholder="যেমন: 📢 সার্ভার মেইনটেন্যান্স বা নতুন আপডেট নোটিশ"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">নোটিশের বিবরণ (মেসেজ)</label>
                    <textarea
                      value={newNoticeContent}
                      onChange={(e) => setNewNoticeContent(e.target.value)}
                      rows={3}
                      placeholder="ক্লায়েন্টদের উদ্দেশ্যে বার্তা বা নোটিশ লিখুন..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="grow">
                      <label className="text-xs text-slate-400 font-semibold mb-1 block">নোটিশের টাইপ</label>
                      <select
                        value={newNoticeType}
                        onChange={(e) => setNewNoticeType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="info">ℹ️ Info (সাধারণ তথ্য)</option>
                        <option value="success">✅ Success (সফল আপডেট)</option>
                        <option value="warning">⚠️ Warning (সতর্কবার্তা)</option>
                        <option value="urgent">🚨 Urgent (জরুরি বার্তা)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="self-end bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      {loading ? 'পাবলিশ হচ্ছে...' : '📢 নোটিশ পাবলিশ করুন'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Published Notices List */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">পাবলিশ করা সাম্প্রতিক নোটিশসমূহ ({notices.length})</h3>
                {notices.length === 0 ? (
                  <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 text-center text-slate-400 text-xs">
                    কোনো সক্রিয় নোটিশ প্রকাশ করা হয়নি।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notices.map((n) => (
                      <div key={n.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              n.type === 'urgent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                              n.type === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              n.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}>
                              {n.type.toUpperCase()}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-white">{n.title}</h4>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{n.content}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotice(n.id)}
                          className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 p-2 rounded-xl text-xs font-bold transition-colors shrink-0"
                          title="ডিলিট করুন"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT SITES MANAGEMENT */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              {/* Add Client Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <span>➕ নতুন ক্লায়েন্ট সাইট যুক্ত করুন (Create Client)</span>
                </h3>
                <form onSubmit={handleCreateClient} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">টেলিগ্রাম Chat ID (Client Chat ID)</label>
                    <input
                      type="text"
                      value={newClientChatId}
                      onChange={(e) => setNewClientChatId(e.target.value)}
                      placeholder="যেমন: 5440151107"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">অ্যাপ / ব্র্যান্ড নাম (App Name)</label>
                    <input
                      type="text"
                      value={newClientAppName}
                      onChange={(e) => setNewClientAppName(e.target.value)}
                      placeholder="যেমন: Tanvir Official Bio"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">সংক্ষিপ্ত নাম (Short Name)</label>
                    <input
                      type="text"
                      value={newClientShortName}
                      onChange={(e) => setNewClientShortName(e.target.value)}
                      placeholder="যেমন: TANVIR BIO"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">লোগো / ফটো URL</label>
                    <input
                      type="text"
                      value={newClientLogoUrl}
                      onChange={(e) => setNewClientLogoUrl(e.target.value)}
                      placeholder="https://i.ibb.co/.../logo.jpg"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      {loading ? 'তৈরি হচ্ছে...' : '⚡ ক্লায়েন্ট বায়ো সাইট তৈরি করুন'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Client List */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">রেজিস্টার্ড ক্লায়েন্ট বায়ো সাইট তালিকা ({clients.length})</h3>
                {clients.length === 0 ? (
                  <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 text-center text-slate-400 text-xs">
                    এখনো কোনো অতিরিক্ত ক্লায়েন্ট সাইট যোগ করা হয়নি।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clients.map((c) => (
                      <div key={c.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.logoUrl || c.profile.avatarUrl || 'https://via.placeholder.com/100'}
                            alt={c.appName}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                            onError={(e: any) => { e.target.src = 'https://via.placeholder.com/100'; }}
                          />
                          <div className="min-w-0 grow">
                            <h4 className="text-sm font-bold text-white truncate">{c.appName}</h4>
                            <p className="text-xs text-cyan-400 font-mono truncate">{c.profile.handle || '@official'}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">Chat ID: {c.chatId} • ID: {c.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px]">
                          <div className="flex gap-2">
                            <a
                              href={`/api/clients/${c.id}/files/index.html`}
                              download="index.html"
                              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1"
                              title="Download index.html"
                            >
                              📥 HTML
                            </a>
                            <a
                              href={`/api/clients/${c.id}/files/manifest.json`}
                              download="manifest.json"
                              className="bg-slate-800 hover:bg-slate-700 text-purple-300 px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1"
                              title="Download manifest.json"
                            >
                              📄 Manifest
                            </a>
                          </div>

                          <button
                            onClick={() => handleDeleteClient(c.id, c.appName)}
                            className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg font-bold transition-colors"
                          >
                            🗑️ ডিলিট
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THEME & LAYOUT SELECTION */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-2">লাইভ সাইট থিম সিলেক্ট করুন (Live Themes)</h3>
                <p className="text-xs text-slate-400 mb-4">যে কোনো থিমে ক্লিক করলেই আপনার সাইট সাথে সাথে নতুন লুকে আপডেট হবে।</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Theme 1: Ultra Cyber Glass */}
                  <div
                    onClick={() => handleUpdateTheme('ultra_cyber_glass')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      currentThemeStyle === 'ultra_cyber_glass'
                        ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-cyan-300">1. ⚡ Ultra Cyber Glass</span>
                      {currentThemeStyle === 'ultra_cyber_glass' && (
                        <span className="text-[10px] bg-cyan-400 text-black font-extrabold px-2 py-0.5 rounded-full">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">ডার্ক সাইবার গ্লাস মোড, গ্লোয়িং অর্বস ও স্পিনিং রিংস এফেক্ট সহ (অফিসিয়াল চয়েস)।</p>
                  </div>

                  {/* Theme 2: Liquid Glassmorphism */}
                  <div
                    onClick={() => handleUpdateTheme('dark_glassmorphism')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      currentThemeStyle === 'dark_glassmorphism'
                        ? 'bg-slate-900 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-sky-300">2. 💧 Liquid Crystal Glass</span>
                      {currentThemeStyle === 'dark_glassmorphism' && (
                        <span className="text-[10px] bg-sky-400 text-black font-extrabold px-2 py-0.5 rounded-full">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">ক্লিন হোয়াইট ফ্রস্টেড গ্লাস কালার, সফট ওয়াটারমিলন গ্র্যাডিয়েন্ট ব্যাকগ্রাউন্ড সহ।</p>
                  </div>

                  {/* Theme 3: Organic Nature */}
                  <div
                    onClick={() => handleUpdateTheme('organic_nature')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      currentThemeStyle === 'organic_nature'
                        ? 'bg-slate-900 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-emerald-300">3. 🍃 Organic Nature Green</span>
                      {currentThemeStyle === 'organic_nature' && (
                        <span className="text-[10px] bg-emerald-400 text-black font-extrabold px-2 py-0.5 rounded-full">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">ন্যাচারাল সেজ গ্রিন ও আর্থি উড ব্রাউন লাক্সারি অর্গানিক থিম।</p>
                  </div>

                  {/* Theme 4: Pop Art Comic */}
                  <div
                    onClick={() => handleUpdateTheme('bold_flat_popart')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      currentThemeStyle === 'bold_flat_popart'
                        ? 'bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-amber-300">4. 🎨 Bold Flat Pop-Art</span>
                      {currentThemeStyle === 'bold_flat_popart' && (
                        <span className="text-[10px] bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded-full">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">ব্রাইট ইয়েলো ও কমিক ডট ব্যাকগ্রাউন্ড বোল্ড ব্ল্যাক আউটলাইন শৈলী।</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & BIO EDIT */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-cyan-400">প্রোফাইল তথ্য এডিট করুন (Profile Details)</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">আপনার নাম (Name)</label>
                  <input
                    type="text"
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">ইউজারনেম / হ্যান্ডেল (Handle)</label>
                  <input
                    type="text"
                    value={profHandle}
                    onChange={(e) => setProfHandle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">পেশা / টাইটেল (Title)</label>
                  <input
                    type="text"
                    value={profTitle}
                    onChange={(e) => setProfTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">ঠিকানা / লোকেশন (Location)</label>
                  <input
                    type="text"
                    value={profLocation}
                    onChange={(e) => setProfLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">বায়ো বা বিবরণ (Bio Description)</label>
                  <textarea
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">অবতার / প্রোফাইল ছবি URL</label>
                  <input
                    type="text"
                    value={profAvatar}
                    onChange={(e) => setProfAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">ব্যানার / ব্যাকগ্রাউন্ড ছবি URL</label>
                  <input
                    type="text"
                    value={profBanner}
                    onChange={(e) => setProfBanner(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : '💾 প্রোফাইল সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES & SOCIAL LINKS */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Add Service Section */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-cyan-400 mb-3">➕ নতুন সার্ভিস যোগ করুন</h3>
                <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">সার্ভিসের নাম</label>
                    <input
                      type="text"
                      value={srvTitle}
                      onChange={(e) => setSrvTitle(e.target.value)}
                      placeholder="যেমন: Image Uploader Tool"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">সাবটাইটেল / ক্যাটাগরি</label>
                    <input
                      type="text"
                      value={srvSubtitle}
                      onChange={(e) => setSrvSubtitle(e.target.value)}
                      placeholder="যেমন: ওয়েবে ফটো কনভার্টার"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">ছবি URL (Icon/Image)</label>
                    <input
                      type="text"
                      value={srvImageUrl}
                      onChange={(e) => setSrvImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">লিঙ্ক URL (Destination Link)</label>
                    <input
                      type="text"
                      value={srvLinkUrl}
                      onChange={(e) => setSrvLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end mt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs px-5 py-2 rounded-xl transition-all"
                    >
                      + যোগ করুন
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Services List */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">বর্তমান সার্ভিসসমূহ ({currentServices.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentServices.map((s) => (
                    <div key={s.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={s.imageUrl || 'https://via.placeholder.com/50'} alt={s.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{s.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{s.subtitle}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="text-rose-400 hover:text-rose-300 p-2 rounded-lg bg-rose-500/10 text-xs font-bold shrink-0"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Social Section */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 pt-5">
                <h3 className="text-sm font-bold text-purple-400 mb-3">➕ নতুন সোশ্যাল লিঙ্ক যোগ করুন</h3>
                <form onSubmit={handleAddSocial} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">সোশ্যাল শিরোনাম</label>
                    <input
                      type="text"
                      value={socTitle}
                      onChange={(e) => setSocTitle(e.target.value)}
                      placeholder="যেমন: Facebook Profile"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">প্রোফাইল URL</label>
                    <input
                      type="text"
                      value={socUrl}
                      onChange={(e) => setSocUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">প্ল্যাটফর্ম টাইপ</label>
                    <select
                      value={socPlatform}
                      onChange={(e) => setSocPlatform(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="facebook">Facebook</option>
                      <option value="telegram">Telegram</option>
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="twitter">X / Twitter</option>
                      <option value="custom">Custom Link</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-semibold mb-1 block">বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={socButtonText}
                      onChange={(e) => setSocButtonText(e.target.value)}
                      placeholder="যেমন: যুক্ত হোন / সাবস্ক্রাইব"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end mt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all"
                    >
                      + যোগ করুন
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Social Links */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">বর্তমান সোশ্যাল লিঙ্কসমূহ ({currentSocialLinks.length})</h3>
                <div className="space-y-2">
                  {currentSocialLinks.map((sl) => (
                    <div key={sl.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{sl.title}</h4>
                        <p className="text-[10px] text-cyan-400 font-mono truncate">{sl.url}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSocial(sl.id)}
                        className="text-rose-400 hover:text-rose-300 p-2 rounded-lg bg-rose-500/10 text-xs font-bold shrink-0"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT SETTINGS */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-cyan-400">কন্টাক্ট সেটিংস (Direct Contact Setup)</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">WhatsApp নাম্বার (International format)</label>
                  <input
                    type="text"
                    value={cntWhatsapp}
                    onChange={(e) => setCntWhatsapp(e.target.value)}
                    placeholder="+8801700000000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">WhatsApp ডিফল্ট মেসেজ (Pre-filled Message)</label>
                  <textarea
                    value={cntWhatsappMsg}
                    onChange={(e) => setCntWhatsappMsg(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Email এড্রেস</label>
                  <input
                    type="email"
                    value={cntEmail}
                    onChange={(e) => setCntEmail(e.target.value)}
                    placeholder="yourmail@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">Telegram ইনবক্স ইউজারনেম</label>
                  <input
                    type="text"
                    value={cntTelegram}
                    onChange={(e) => setCntTelegram(e.target.value)}
                    placeholder="shuvo_developer"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-semibold mb-1 block">কাস্টম কন্টাক্ট নোট</label>
                  <input
                    type="text"
                    value={cntNote}
                    onChange={(e) => setCntNote(e.target.value)}
                    placeholder="যেকোনো তথ্যের জন্য সরাসরি যোগাযোগ করুন..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={handleUpdateContact}
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : '💾 কন্টাক্ট ইনফো সেভ করুন'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
