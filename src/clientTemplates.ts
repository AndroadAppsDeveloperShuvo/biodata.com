export interface ClientRecord {
  id: string;
  chatId: string;
  appName: string;
  shortName: string;
  logoUrl: string;
  createdAt: string;
  profile: {
    name: string;
    handle: string;
    title: string;
    location: string;
    bio: string;
    avatarUrl: string;
    bannerUrl: string;
  };
  badges: { id: string; text: string }[];
  services: {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    linkUrl: string;
    createdAt?: string;
  }[];
  socialLinks: {
    id: string;
    platform: 'facebook' | 'telegram' | 'youtube' | 'instagram' | 'twitter' | 'github' | 'custom';
    title: string;
    url: string;
    subtitle: string;
    buttonText: string;
    enabled: boolean;
  }[];
  contact: {
    enabled: boolean;
    whatsappNumber: string;
    whatsappMessage: string;
    email: string;
    telegramUsername: string;
    customNote: string;
  };
  layoutStyle?: 'social_first' | 'services_first';
  themeStyle?: 'classic_dark' | 'dark_glassmorphism' | string;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateClientManifest(client: ClientRecord): string {
  const manifest = {
    id: "./",
    name: client.appName || "Bio Data",
    short_name: client.shortName || "BIO DATA",
    description: `Official Social Bio & Developer Portfolio of ${client.profile.name || client.appName}`,
    start_url: "./",
    scope: "./",
    display: "standalone",
    orientation: "portrait",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: client.logoUrl || "pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: client.logoUrl || "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: client.logoUrl || "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };

  return JSON.stringify(manifest, null, 2);
}

export function generateClientServiceWorker(client: ClientRecord): string {
  const safeId = client.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `// PWA Service Worker for ${client.appName}
const CACHE_NAME = 'biodata-pwa-${safeId}-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-First for Firebase or API requests
  if (url.origin.includes('firebase') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-First with Cache Fallback for static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
`;
}

export function generateClientIndexHtml(client: ClientRecord, firebaseDbUrl: string): string {
  const cleanFbBase = firebaseDbUrl.replace(/\/+$/, '');
  const clientEndpoint = `${cleanFbBase}/clients/${client.id}.json`;
  const initialDataJson = JSON.stringify({
    profile: client.profile,
    badges: client.badges,
    services: client.services,
    socialLinks: client.socialLinks,
    contact: client.contact,
    layoutStyle: client.layoutStyle || 'social_first',
    updatedAt: client.createdAt
  });

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(client.appName)}</title>
  <meta name="description" content="Official Social Bio & Portfolio of ${escapeHtml(client.profile.name)}">
  <meta property="og:title" content="${escapeHtml(client.appName)}">
  <meta property="og:description" content="Official Social Bio & Portfolio of ${escapeHtml(client.profile.name)}">
  <meta property="og:image" content="${escapeHtml(client.logoUrl)}">
  <link rel="icon" type="image/png" href="${escapeHtml(client.logoUrl)}">
  
  <!-- PWA & Mobile Web App Meta -->
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#09090b">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="${escapeHtml(client.shortName)}">
  <link rel="apple-touch-icon" href="${escapeHtml(client.logoUrl)}">
  
  <!-- Google Fonts & Tailwind CDN -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@600;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #09090b;
      color: #f4f4f5;
      -webkit-tap-highlight-color: transparent;
    }
    .font-tech {
      font-family: 'Orbitron', monospace, sans-serif;
    }
    .glass-card {
      background: rgba(18, 18, 24, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .neon-glow {
      box-shadow: 0 0 25px -5px rgba(6, 182, 212, 0.35);
    }
    .avatar-glow {
      box-shadow: 0 0 0 3px #09090b, 0 0 0 5px rgba(6, 182, 212, 0.6), 0 10px 25px -5px rgba(6, 182, 212, 0.4);
    }
    @keyframes pulseSlow {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.85; }
    }
    .animate-pulse-slow {
      animation: pulseSlow 3s ease-in-out infinite;
    }
  </style>
</head>
<body class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center selection:bg-cyan-500 selection:text-zinc-950">

  <!-- Offline Status Bar Indicator -->
  <div id="offlineIndicator" class="hidden fixed top-0 inset-x-0 bg-amber-500 text-zinc-950 text-xs font-bold py-1 text-center z-50 shadow-md">
    ⚠️ আপনি বর্তমানে অফলাইনে আছেন। সংরক্ষিত তথ্য দেখানো হচ্ছে।
  </div>

  <main class="w-full max-w-md mx-auto min-h-screen flex flex-col bg-zinc-950 border-x border-zinc-900/60 shadow-2xl relative pb-24">
    
    <!-- Profile Banner & Header -->
    <div class="relative w-full h-44 sm:h-48 overflow-hidden bg-zinc-900">
      <img id="profileBanner" src="${escapeHtml(client.profile.bannerUrl || 'https://simpleprogrammer.com/wp-content/uploads/2023/05/Coding-Desk.jpg')}" alt="Banner" class="w-full h-full object-cover opacity-80" onerror="this.src='https://simpleprogrammer.com/wp-content/uploads/2023/05/Coding-Desk.jpg'" />
      <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
    </div>

    <!-- Profile Info Box -->
    <div class="relative px-5 -mt-16 flex flex-col items-center text-center">
      <!-- Avatar with Live Indicator -->
      <div class="relative mb-3 group">
        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden avatar-glow bg-zinc-900 border-2 border-cyan-400/50">
          <img id="profileAvatar" src="${escapeHtml(client.profile.avatarUrl || client.logoUrl)}" alt="Avatar" class="w-full h-full object-cover" onerror="this.src='${escapeHtml(client.logoUrl)}'" />
        </div>
        <div class="absolute -bottom-1 -right-1 bg-emerald-500 text-zinc-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-zinc-950 flex items-center gap-1 shadow-lg">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
          <span>LIVE</span>
        </div>
      </div>

      <!-- Name & Verified Check -->
      <div class="flex items-center justify-center gap-1.5 mb-1">
        <h1 id="profileName" class="text-xl sm:text-2xl font-extrabold tracking-tight text-white">${escapeHtml(client.profile.name || client.appName)}</h1>
        <svg class="w-5 h-5 text-cyan-400 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      </div>

      <!-- Handle / Username -->
      <p id="profileHandle" class="text-xs font-mono font-medium text-cyan-400/90 mb-1.5 bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-800/40">${escapeHtml(client.profile.handle || '@official')}</p>

      <!-- Professional Title -->
      <p id="profileTitle" class="text-xs sm:text-sm font-semibold text-zinc-300 mb-1">${escapeHtml(client.profile.title || 'Developer & Creator')}</p>

      <!-- Location -->
      <div id="profileLocationWrapper" class="flex items-center gap-1 text-[11px] text-zinc-400 mb-3">
        <svg class="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        <span id="profileLocation">${escapeHtml(client.profile.location || 'Bangladesh')}</span>
      </div>

      <!-- Badges Pills Container -->
      <div id="badgesContainer" class="flex flex-wrap items-center justify-center gap-1.5 mb-3.5"></div>

      <!-- Bio Paragraph -->
      <div class="glass-card rounded-2xl p-3.5 w-full text-left mb-6">
        <p id="profileBio" class="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">${escapeHtml(client.profile.bio || 'স্বাগতম আমার অফিসিয়াল বায়ো ডাটা ও প্রোফাইল পেজে!')}</p>
      </div>
    </div>

    <!-- Reorderable Sections Container -->
    <div id="contentSections" class="flex flex-col">
      ${client.layoutStyle === 'services_first' ? `
      <!-- Section: Services Grid -->
      <div id="sectionServices" class="px-5 mb-6">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <h2 class="text-sm font-bold uppercase tracking-wider text-white">সাভিস ও টুলস সমূহ</h2>
          </div>
          <span id="servicesCountBadge" class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400 font-bold">লাইভ</span>
        </div>
        <div id="servicesGrid" class="grid grid-cols-2 sm:grid-cols-3 gap-2.5"></div>
      </div>

      <!-- Section: Social Links List -->
      <div id="sectionSocial" class="px-5 mb-6">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            <h2 class="text-sm font-bold uppercase tracking-wider text-white">সোশ্যাল মিডিয়া প্রোফাইল</h2>
          </div>
          <span class="text-[10px] text-zinc-500 font-mono">Connect</span>
        </div>
        <div id="socialLinksContainer" class="flex flex-col gap-2.5"></div>
      </div>
      ` : `
      <!-- Section: Social Links List -->
      <div id="sectionSocial" class="px-5 mb-6">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            <h2 class="text-sm font-bold uppercase tracking-wider text-white">সোশ্যাল মিডিয়া প্রোফাইল</h2>
          </div>
          <span class="text-[10px] text-zinc-500 font-mono">Connect</span>
        </div>
        <div id="socialLinksContainer" class="flex flex-col gap-2.5"></div>
      </div>

      <!-- Section: Services Grid -->
      <div id="sectionServices" class="px-5 mb-6">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <h2 class="text-sm font-bold uppercase tracking-wider text-white">সাভিস ও টুলস সমূহ</h2>
          </div>
          <span id="servicesCountBadge" class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400 font-bold">লাইভ</span>
        </div>
        <div id="servicesGrid" class="grid grid-cols-2 sm:grid-cols-3 gap-2.5"></div>
      </div>
      `}
    </div>

    <!-- Section 3: Direct Contact Box -->
    <div class="px-5 mb-4">
      <div id="contactContainer" class="glass-card rounded-2xl p-4 flex flex-col gap-3"></div>
    </div>

    <!-- Section 4: Premium Glowing Share Profile Card -->
    <div class="px-5 mb-8">
      <button id="btnShareProfile" type="button" class="w-full relative group overflow-hidden rounded-2xl p-[1px] transition-all duration-300 active:scale-[0.98] shadow-xl hover:shadow-cyan-500/20">
        <!-- Animated glowing gradient border layer -->
        <span class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 group-hover:opacity-100 opacity-75 transition-opacity blur-[1px]"></span>
        
        <!-- Inner glassmorphism button content -->
        <div class="relative w-full bg-zinc-950/90 group-hover:bg-zinc-900/95 rounded-[15px] p-3.5 flex items-center justify-between gap-3 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <!-- Icon Box with Glow -->
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 border border-cyan-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
              <svg class="w-5 h-5 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
            </div>
            <div class="text-left min-w-0">
              <h3 class="text-xs sm:text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate">প্রোফাইল শেয়ার করুন</h3>
              <p class="text-[10.5px] text-zinc-400 truncate">এক ক্লিকে লিঙ্ক শেয়ার বা কপি করুন</p>
            </div>
          </div>
          
          <!-- Right action badge -->
          <div class="shrink-0">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-zinc-950 group-hover:from-cyan-400 group-hover:to-sky-400 transition-all shadow-md">
              <span>শেয়ার</span>
              <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </span>
          </div>
        </div>
      </button>
    </div>

    <!-- Footer -->
    <footer class="mt-auto px-5 py-4 border-t border-zinc-900/80 text-center flex flex-col items-center gap-1">
      <p class="text-[11px] text-zinc-500">© <span id="currentYear"></span> ${escapeHtml(client.appName)} • All Rights Reserved</p>
      <div class="flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Firebase Realtime Cloud Active</span>
      </div>
    </footer>
  </main>

  <!-- PWA Floating Install Prompt Bar -->
  <div id="pwaFloatingBanner" class="fixed bottom-4 inset-x-4 max-w-md mx-auto bg-zinc-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 transform translate-y-28 opacity-0 transition-all duration-300 z-40">
    <div class="flex items-center gap-3 min-w-0">
      <img src="${escapeHtml(client.logoUrl)}" alt="Logo" class="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-800" />
      <div class="min-w-0">
        <h4 class="text-xs font-bold text-white truncate">${escapeHtml(client.shortName)} অ্যাপ</h4>
        <p class="text-[10px] text-zinc-400 truncate">হোমস্ক্রিনে ইনস্টল করে সহজে ওপেন করুন</p>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <button id="pwaFloatingInstallBtn" class="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow transition-all active:scale-95">ইনস্টল</button>
      <button onclick="dismissPWABanner()" class="text-zinc-400 hover:text-white p-1 text-sm font-bold leading-none">✕</button>
    </div>
  </div>

  <!-- iOS PWA Manual Install Instructions Modal -->
  <div id="iosInstallModal" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full text-center flex flex-col items-center gap-3 shadow-2xl">
      <img src="${escapeHtml(client.logoUrl)}" alt="Icon" class="w-14 h-14 rounded-2xl shadow-lg border border-zinc-700" />
      <h3 class="text-base font-bold text-white">অ্যাপটি আপনার iPhone এ যোগ করুন</h3>
      <p class="text-xs text-zinc-400 leading-relaxed">নিচের সাফারি ব্রাউজারের <b>Share বাটন ( <svg class="inline w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg> )</b> চাপুন এবং <b>'Add to Home Screen'</b> নির্বাচন করুন।</p>
      <button onclick="closeIOSModal()" class="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-colors mt-2">ঠিক আছে, বুঝেছি</button>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toastNotification" class="fixed top-5 left-1/2 -translate-x-1/2 bg-zinc-900/95 text-white border border-cyan-500/50 text-xs font-semibold px-4 py-2 rounded-full shadow-2xl opacity-0 pointer-events-none transition-all duration-300 z-50 flex items-center gap-2">
    <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
    <span id="toastMessage"></span>
  </div>

  <!-- Client Application Engine -->
  <script>
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    var CLIENT_ID = "${client.id}";
    var FIREBASE_URL = "${cleanFbBase}";
    var cleanFb = "${clientEndpoint}";
    var initialEmbeddedData = ${initialDataJson};

    function showToast(msg) {
      var toast = document.getElementById('toastNotification');
      var toastMsg = document.getElementById('toastMessage');
      if (!toast || !toastMsg) return;
      toastMsg.textContent = msg;
      toast.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-2');
      toast.classList.add('opacity-100', 'translate-y-0');
      setTimeout(function() {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'pointer-events-none', '-translate-y-2');
      }, 3000);
    }

    function toBengaliNumber(n) {
      var bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return String(n).split('').map(function(d) {
        return bnDigits[parseInt(d, 10)] !== undefined ? bnDigits[parseInt(d, 10)] : d;
      }).join('');
    }

    function toArray(val) {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'object') return Object.values(val);
      return [];
    }

    function renderProfile(p) {
      if (!p) return;
      if (p.name) document.getElementById('profileName').textContent = p.name;
      if (p.handle) {
        var h = p.handle.startsWith('@') ? p.handle : '@' + p.handle;
        document.getElementById('profileHandle').textContent = h;
      }
      if (p.title) document.getElementById('profileTitle').textContent = p.title;
      if (p.location) document.getElementById('profileLocation').textContent = p.location;
      if (p.bio) document.getElementById('profileBio').textContent = p.bio;
      if (p.avatarUrl) {
        var av = document.getElementById('profileAvatar');
        if (av) av.src = p.avatarUrl;
      }
      if (p.bannerUrl) {
        var bn = document.getElementById('profileBanner');
        if (bn) bn.src = p.bannerUrl;
      }
    }

    function renderBadges(badges) {
      var container = document.getElementById('badgesContainer');
      if (!container) return;
      var list = toArray(badges);
      var html = '';
      list.forEach(function(b) {
        var text = typeof b === 'string' ? b : (b.text || '');
        if (!text) return;
        html += '<span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-200 border border-zinc-800 flex items-center gap-1 shadow-sm">'
          + text
          + '</span>';
      });
      container.innerHTML = html;
    }

    function getSocialIconSvg(platform) {
      if (platform === 'facebook') {
        return '<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
      } else if (platform === 'telegram') {
        return '<svg class="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.942z"/></svg>';
      } else if (platform === 'youtube') {
        return '<svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';
      } else if (platform === 'instagram') {
        return '<svg class="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.13-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>';
      } else if (platform === 'twitter') {
        return '<svg class="w-5 h-5 text-zinc-100" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
      } else if (platform === 'github') {
        return '<svg class="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>';
      } else {
        return '<svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>';
      }
    }

    function renderSocialLinks(links) {
      var container = document.getElementById('socialLinksContainer');
      if (!container) return;
      var raw = toArray(links);
      var activeLinks = raw.filter(function(l) { return l && l.enabled !== false; });
      var html = '';
      activeLinks.forEach(function(link) {
        html += '<a href="' + link.url + '" target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group">'
          + '<div class="flex items-center gap-3 min-w-0">'
          + '<div class="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">'
          + getSocialIconSvg(link.platform)
          + '</div>'
          + '<div class="min-w-0">'
          + '<h3 class="font-bold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors truncate">' + link.title + '</h3>'
          + '<p class="text-[11px] text-zinc-400 truncate">' + (link.subtitle || '') + '</p>'
          + '</div>'
          + '</div>'
          + '<div class="shrink-0 pl-2">'
          + '<span class="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl bg-white/10 group-hover:bg-cyan-500 group-hover:text-zinc-950 text-white transition-all">'
          + (link.buttonText || 'যুক্ত হোন')
          + '<svg class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>'
          + '</span>'
          + '</div>'
          + '</a>';
      });
      container.innerHTML = html;
    }

    function renderServices(services) {
      var grid = document.getElementById('servicesGrid');
      if (!grid) return;
      var list = toArray(services);
      var html = '';
      list.forEach(function(service, index) {
        var numBn = toBengaliNumber(index + 1);
        html += '<div class="group relative rounded-xl overflow-hidden aspect-square border border-zinc-800 hover:border-cyan-400/80 transition-all duration-300 bg-zinc-900 shadow-md">'
          + '<a href="' + service.linkUrl + '" target="_blank" rel="noopener noreferrer" class="w-full h-full block cursor-pointer" title="' + service.title + '">'
          + '<img src="' + service.imageUrl + '" alt="' + service.title + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" onerror="this.src=\\'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10\\'" />'
          + '<div class="absolute top-0 left-0 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-br-xl shadow-md border-b border-r border-cyan-300/40 font-tech tracking-wider pointer-events-none z-10 flex items-center justify-center min-w-[24px]">'
          + '<span>' + numBn + '</span>'
          + '</div>'
          + '<div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-2 transition-opacity group-hover:from-black/90">'
          + '<div class="flex items-center justify-between gap-1">'
          + '<h4 class="text-[11px] font-bold text-white leading-tight truncate group-hover:text-cyan-300 transition-colors">' + service.title + '</h4>'
          + '<svg class="w-3 h-3 text-cyan-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>'
          + '</div>'
          + '<p class="text-[9px] text-cyan-300/90 truncate font-medium mt-0.5">' + (service.subtitle || '') + '</p>'
          + '</div>'
          + '</a>'
          + '</div>';
      });
      grid.innerHTML = html;
      var countBadge = document.getElementById('servicesCountBadge');
      if (countBadge) countBadge.textContent = list.length + 'টি সাভিস';
    }

    function renderContact(c) {
      var box = document.getElementById('contactContainer');
      if (!box || !c) return;
      var cleanWa = (c.whatsappNumber || '').replace(/[^0-9]/g, '');
      var encodedWaMsg = encodeURIComponent(c.whatsappMessage || '');

      var html = '<div class="flex items-center justify-between">'
        + '<h3 class="text-xs font-bold text-cyan-400 uppercase tracking-wider">সরাসরি যোগাযোগ করুন</h3>'
        + '<span class="text-[10px] text-zinc-500 font-mono">Direct Message</span>'
        + '</div>'
        + '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">'
        + '<a href="https://wa.me/' + cleanWa + '?text=' + encodedWaMsg + '" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 group">'
        + '<svg class="w-4 h-4 fill-current text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>'
        + '<span>WhatsApp মেসেজ</span>'
        + '</a>'
        + '<a href="mailto:' + (c.email || 'info@gmail.com') + '" class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition-all active:scale-95 group">'
        + '<svg class="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>'
        + '<span>ইমেইল পাঠান</span>'
        + '</a>'
        + '</div>';

      if (c.customNote) {
        html += '<p class="text-[10.5px] text-zinc-400 italic text-center pt-1">&ldquo;' + c.customNote + '&rdquo;</p>';
      }
      box.innerHTML = html;
    }

    function applyLayoutStyle(style) {
      var container = document.getElementById('contentSections');
      var srv = document.getElementById('sectionServices');
      var soc = document.getElementById('sectionSocial');
      if (!container || !srv || !soc) return;
      if (style === 'services_first') {
        container.appendChild(srv);
        container.appendChild(soc);
      } else {
        container.appendChild(soc);
        container.appendChild(srv);
      }
    }

    function applyThemeStyle(theme) {
      var themeClass = theme || 'classic_dark';
      document.body.setAttribute('data-theme', themeClass);
      var mainEl = document.querySelector('main');
      var glassBg = document.getElementById('glassmorphismMeshBg');

      if (themeClass === 'dark_glassmorphism') {
        if (!glassBg) {
          glassBg = document.createElement('div');
          glassBg.id = 'glassmorphismMeshBg';
          glassBg.className = 'fixed inset-0 pointer-events-none z-0 overflow-hidden';
          glassBg.innerHTML = '<div class="absolute -top-24 -left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>'
            + '<div class="absolute top-1/3 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1.5s;"></div>'
            + '<div class="absolute -bottom-20 left-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style="animation-delay: 3s;"></div>';
          document.body.insertBefore(glassBg, document.body.firstChild);
        }
        glassBg.style.display = 'block';
        if (mainEl) {
          mainEl.className = 'w-full max-w-md mx-auto min-h-screen flex flex-col bg-slate-900/60 backdrop-blur-2xl border-x border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative pb-24 z-10';
        }
      } else {
        if (glassBg) glassBg.style.display = 'none';
        if (mainEl) {
          mainEl.className = 'w-full max-w-md mx-auto min-h-screen flex flex-col bg-zinc-950 border-x border-zinc-900/60 shadow-2xl relative pb-24';
        }
      }
    }

    var lastUpdatedSig = '';
    function applyAllData(data, shouldToast) {
      if (!data || typeof data !== 'object') return;
      var currentLayout = data.layoutStyle || 'social_first';
      var currentTheme = data.themeStyle || 'classic_dark';
      var sig = (data.updatedAt || '') + '_' + currentLayout + '_' + currentTheme + '_' + JSON.stringify(data.profile || {}) + '_' + (data.services ? JSON.stringify(data.services).length : 0);
      if (sig === lastUpdatedSig) return;
      lastUpdatedSig = sig;

      applyLayoutStyle(currentLayout);
      applyThemeStyle(currentTheme);
      if (data.profile) renderProfile(data.profile);
      if (data.badges) renderBadges(data.badges);
      if (data.services) renderServices(data.services);
      if (data.socialLinks) renderSocialLinks(data.socialLinks);
      if (data.contact) renderContact(data.contact);

      try {
        localStorage.setItem('bio_data_cache_' + CLIENT_ID, JSON.stringify(data));
      } catch (e) {}

      if (shouldToast) {
        showToast('🔄 তথ্য লাইভ আপডেট হয়েছে!');
      }
    }

    // 1. Hydrate from Cache or Embedded initial data (0ms instant render)
    try {
      var cached = localStorage.getItem('bio_data_cache_' + CLIENT_ID);
      if (cached) {
        applyAllData(JSON.parse(cached), false);
      } else {
        applyAllData(initialEmbeddedData, false);
      }
    } catch (e) {
      applyAllData(initialEmbeddedData, false);
    }

    // 2. Fetch latest data from Firebase Realtime Database
    function fetchFromFirebase(isBg) {
      fetch(cleanFb + '?t=' + Date.now())
        .then(function(res) {
          if (res.ok) return res.json();
          throw new Error('Firebase offline');
        })
        .then(function(data) {
          if (data && typeof data === 'object') {
            applyAllData(data, isBg);
          }
        })
        .catch(function(err) {});
    }

    fetchFromFirebase(false);

    // 3. Attach Live Firebase Server-Sent Events (SSE) Listener
    try {
      var fbStream = new EventSource(cleanFb);
      fbStream.addEventListener('put', function(e) {
        try {
          var payload = JSON.parse(e.data);
          var data = payload && payload.data !== undefined ? payload.data : payload;
          var path = payload && payload.path ? payload.path : '/';
          if (!path || path === '/' || path === '') {
            if (data && typeof data === 'object') {
              applyAllData(data, true);
            }
          } else {
            fetchFromFirebase(true);
          }
        } catch (err) {}
      });
      fbStream.addEventListener('patch', function() {
        fetchFromFirebase(true);
      });
    } catch (e) {}

    // Share Button Event
    var btnShare = document.getElementById('btnShareProfile');
    if (btnShare) {
      btnShare.addEventListener('click', function() {
        if (navigator.share) {
          navigator.share({
            title: document.title,
            text: 'Check out my official bio!',
            url: window.location.href
          }).catch(function() {});
        } else {
          navigator.clipboard.writeText(window.location.href).then(function() {
            showToast('📋 প্রোফাইল লিংক কপি করা হয়েছে!');
          });
        }
      });
    }

    // PWA Install Prompt Logic
    var deferredInstallPrompt = null;
    var pwaFloatingBanner = document.getElementById('pwaFloatingBanner');
    var pwaFloatingInstallBtn = document.getElementById('pwaFloatingInstallBtn');
    var iosInstallModal = document.getElementById('iosInstallModal');

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    var isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';

    function showPWABanner() {
      if (pwaFloatingBanner && !isDismissed) {
        pwaFloatingBanner.classList.remove('translate-y-28', 'opacity-0');
        pwaFloatingBanner.classList.add('translate-y-0', 'opacity-100');
      }
    }

    function dismissPWABanner() {
      if (pwaFloatingBanner) {
        pwaFloatingBanner.classList.remove('translate-y-0', 'opacity-100');
        pwaFloatingBanner.classList.add('translate-y-28', 'opacity-0', 'pointer-events-none');
      }
      try {
        localStorage.setItem('pwa_prompt_dismissed', 'true');
      } catch (e) {}
    }

    if (!isStandalone && !isDismissed) {
      if (isIOS) {
        setTimeout(showPWABanner, 2000);
        if (pwaFloatingInstallBtn) {
          pwaFloatingInstallBtn.addEventListener('click', function() {
            if (iosInstallModal) iosInstallModal.classList.remove('hidden');
          });
        }
      } else {
        window.addEventListener('beforeinstallprompt', function(e) {
          e.preventDefault();
          deferredInstallPrompt = e;
          setTimeout(showPWABanner, 1800);
        });

        if (pwaFloatingInstallBtn) {
          pwaFloatingInstallBtn.addEventListener('click', function() {
            if (deferredInstallPrompt) {
              deferredInstallPrompt.prompt();
              deferredInstallPrompt.userChoice.then(function(choice) {
                if (choice.outcome === 'accepted') {
                  showToast('🎉 অ্যাপ ইনস্টল সম্পন্ন হয়েছে!');
                  dismissPWABanner();
                }
                deferredInstallPrompt = null;
              });
            } else {
              showToast('ব্রাউজারের ৩-ডট মেনু থেকে "Install app" চাপুন');
            }
          });
        }
      }
    }

    function closeIOSModal() {
      if (iosInstallModal) iosInstallModal.classList.add('hidden');
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js').then(function(reg) {
          console.log('✅ PWA Service Worker Registered:', reg.scope);
        }).catch(function(err) {});
      });
    }

    // Offline Connectivity Tracking
    var offlineIndicator = document.getElementById('offlineIndicator');
    function updateOnlineStatus() {
      if (offlineIndicator) {
        if (!navigator.onLine) {
          offlineIndicator.classList.remove('hidden');
        } else {
          offlineIndicator.classList.add('hidden');
        }
      }
    }
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  </script>
</body>
</html>
`;
}
