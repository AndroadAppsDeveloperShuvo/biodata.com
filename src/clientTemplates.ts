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
    platform: 'facebook' | 'telegram' | 'youtube' | 'instagram' | 'tiktok' | 'snapchat' | 'twitter' | 'github' | 'custom';
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
  layoutStyle?: 'ultra_bento_3d' | 'shuvox_lightning_cyber' | 'classic_stacked' | 'services_first' | 'editorial_minimalist' | string;
  themeStyle?: string;
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
    background_color: "#050505",
    theme_color: "#050505",
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
const CACHE_NAME = 'biodata-pwa-${safeId}-v2';
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
    appName: client.appName,
    shortName: client.shortName,
    logoUrl: client.logoUrl,
    profile: client.profile,
    badges: client.badges,
    services: client.services,
    socialLinks: client.socialLinks,
    contact: client.contact,
    layoutStyle: client.layoutStyle || 'ultra_bento_3d',
    themeStyle: client.themeStyle || 'shuvox_lightning_cyber',
    updatedAt: client.createdAt
  });

  const defaultAvatar = client.profile?.avatarUrl || client.logoUrl || 'https://placehold.co/400x400/ffffff/1e293b?text=SP';
  const defaultName = client.profile?.name || client.appName || 'MD SHUVO P.K.';
  const defaultTitle = client.profile?.title || 'Frontend Developer & Poultry Farm Manager';
  const defaultLocation = client.profile?.location || 'Natore, Bangladesh';
  const defaultBio = client.profile?.bio || 'Hi! I am a passionate developer and agricultural manager who loves blending technical logic with practical problem-solving. My dual expertise allows me to build pixel-perfect, high-performance web applications while also scaling real-world operations. I focus on clean code, seamless UX, and sustainable growth.';

  return `<!DOCTYPE html>
<!-- Generated Ultra-Premium PWA: ${Date.now()} -->
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(client.appName || defaultName)}</title>
  <meta name="description" content="Official Social Bio & Portfolio of ${escapeHtml(defaultName)}">
  <meta property="og:title" content="${escapeHtml(client.appName || defaultName)}">
  <meta property="og:description" content="Official Social Bio & Portfolio of ${escapeHtml(defaultName)}">
  <meta property="og:image" content="${escapeHtml(client.logoUrl || defaultAvatar)}">
  <link rel="icon" type="image/png" href="${escapeHtml(client.logoUrl || defaultAvatar)}">
  
  <!-- PWA & Mobile Web App Meta -->
  <link rel="manifest" href="manifest.json" id="manifestLink">
  <meta name="theme-color" content="#09090b" id="themeColorMeta">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="${escapeHtml(client.shortName || 'BIO DATA')}" id="appleTitleMeta">
  <link rel="apple-touch-icon" href="${escapeHtml(client.logoUrl || defaultAvatar)}" id="appleTouchIcon">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- FontAwesome 6 -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  
  <!-- Google Fonts: Inter & Orbitron & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@600;800;900&display=swap" rel="stylesheet">
  
  <!-- Animation Libraries: Vanilla Tilt & Typed.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/typed.js/2.0.12/typed.min.js"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Inter"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
            tech: ['"Orbitron"', 'monospace', 'sans-serif'],
          },
          boxShadow: {
            'premium': '0 10px 40px -10px rgba(0,0,0,0.08)',
            'premium-hover': '0 20px 40px -10px rgba(0,0,0,0.12)',
            'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
          }
        }
      }
    };
  </script>
  
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      margin: 0;
      background-color: #F9FAFB;
      color: #0F172A;
      overflow-x: hidden;
      cursor: auto;
      -webkit-tap-highlight-color: transparent;
      transition: background-color 0.4s ease, color 0.4s ease;
    }

    /* Enable custom cursor on desktop */
    @media (hover: hover) and (pointer: fine) {
      body.has-magic-cursor {
        cursor: none;
      }
    }

    /* ---------------- Magical Cursor ---------------- */
    .magic-cursor {
      position: fixed;
      top: 0;
      left: 0;
      width: 20px;
      height: 20px;
      background: linear-gradient(45deg, #3b82f6, #8b5cf6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      mix-blend-mode: multiply;
      transition: width 0.2s, height 0.2s, background-color 0.2s;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
      display: none;
    }
    @media (hover: hover) and (pointer: fine) {
      .magic-cursor { display: block; }
    }
    .magic-cursor.hovering {
      width: 60px;
      height: 60px;
      background: rgba(59, 130, 246, 0.15);
      mix-blend-mode: normal;
      border: 2px solid #3b82f6;
      box-shadow: none;
      backdrop-filter: blur(2px);
    }

    /* ---------------- Animated Background Orbs ---------------- */
    .bg-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      z-index: 0;
      animation: floatOrb 20s infinite alternate ease-in-out;
      opacity: 0.35;
      pointer-events: none;
    }
    .orb-1 { top: -10%; left: -10%; width: 420px; height: 420px; background: #93c5fd; }
    .orb-2 { bottom: -10%; right: -10%; width: 520px; height: 520px; background: #c4b5fd; animation-delay: -5s; }
    .orb-3 { top: 40%; left: 40%; width: 320px; height: 320px; background: #a7f3d0; animation-delay: -10s; }

    @keyframes floatOrb {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }

    /* ---------------- Premium Cards ---------------- */
    .premium-card {
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-radius: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 1);
      box-shadow: 0 4px 25px rgba(0, 0, 0, 0.04);
      opacity: 0;
      transform: translateY(35px) scale(0.96);
      animation: popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      transform-style: preserve-3d;
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .premium-card:hover {
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.09);
    }

    @keyframes popIn {
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .delay-1 { animation-delay: 0.05s; }
    .delay-2 { animation-delay: 0.15s; }
    .delay-3 { animation-delay: 0.25s; }
    .delay-4 { animation-delay: 0.35s; }
    .delay-5 { animation-delay: 0.45s; }

    .float-el { transform: translateZ(20px); }
    .float-el-high { transform: translateZ(40px); }

    /* ---------------- Avatar Morph Animation ---------------- */
    .avatar-morph {
      animation: morphBlob 8s ease-in-out infinite;
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      transition: all 0.8s ease-in-out;
    }
    .avatar-morph:hover {
      border-radius: 50%;
      box-shadow: 0 0 35px rgba(59, 130, 246, 0.45);
    }
    @keyframes morphBlob {
      0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
      50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
      100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    }

    /* Gradient Shine Text */
    .animate-gradient-text {
      background: linear-gradient(to right, #2563eb, #7c3aed, #2563eb);
      background-size: 200% auto;
      color: transparent;
      -webkit-background-clip: text;
      animation: textShine 3s linear infinite;
    }
    @keyframes textShine {
      to { background-position: 200% center; }
    }

    /* Pulse Ring */
    .pulse-ring {
      position: absolute;
      bottom: 0.25rem;
      right: 0.25rem;
      width: 1.5rem;
      height: 1.5rem;
    }
    .pulse-ring::before {
      content: '';
      position: absolute;
      left: -4px; top: -4px; right: -4px; bottom: -4px;
      border-radius: 50%;
      border: 2px solid #22c55e;
      animation: pulsateRing 2s ease-out infinite;
    }
    @keyframes pulsateRing {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }

    /* Custom Progress Bars */
    .progress-container {
      width: 100%;
      background-color: #f1f5f9;
      border-radius: 9999px;
      height: 6px;
      margin-top: 8px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      border-radius: 9999px;
      transition: width 1.2s ease-out;
      width: 0%;
    }

    /* ---------------- Dark / Cyber Theme Modes ---------------- */
    body.theme-cyber {
      background-color: #050505;
      color: #f4f4f5;
    }
    body.theme-cyber .bg-crosshairs {
      background-image: radial-gradient(#333 1px, transparent 0);
      background-size: 40px 40px;
      background-position: -19px -19px;
    }
    body.theme-cyber .premium-card {
      background: rgba(18, 18, 24, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
      color: #f4f4f5;
    }
    body.theme-cyber .premium-card:hover {
      box-shadow: 0 10px 40px rgba(6, 182, 212, 0.2);
    }
    body.theme-cyber .progress-container {
      background-color: #1e293b;
    }

    /* Roaming Canvas */
    #boidsCanvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
      opacity: 0.8;
      display: none;
    }

    /* Wireframe Debug Corners */
    .wire-blue {
      border: 1px solid rgba(0, 240, 255, 0.35);
      position: relative;
    }
    .wire-blue::before, .wire-blue::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      border: 1px solid #00f0ff;
    }
    .wire-blue::before { top: -4px; left: -4px; }
    .wire-blue::after { bottom: -4px; right: -4px; }

    /* Lightning flash overlay */
    #lightningCanvas {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      transition: opacity 0.1s ease;
    }

    /* PWA Install Banner */
    #pwaInstallPrompt {
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
    }
    #pwaInstallPrompt.translate-y-full {
      transform: translateY(150%);
      opacity: 0;
      pointer-events: none;
    }

    /* Toast Notification */
    #liveSyncToast {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #liveSyncToast.translate-y-12 {
      transform: translateY(48px);
      opacity: 0;
      pointer-events: none;
    }
  </style>
</head>
<body class="antialiased has-magic-cursor min-h-screen flex flex-col items-center justify-center p-4 md:p-8 lg:p-10 selection:bg-blue-200">

  <!-- Magical Custom Cursor -->
  <div class="magic-cursor" id="magicCursor"></div>

  <!-- Animated Background Orbs -->
  <div class="bg-orb orb-1"></div>
  <div class="bg-orb orb-2"></div>
  <div class="bg-orb orb-3"></div>

  <!-- Roaming Boids & Lightning Background for Cyber Theme -->
  <canvas id="boidsCanvas"></canvas>
  <canvas id="lightningCanvas"></canvas>

  <!-- ============================================================== -->
  <!-- 1. ULTRA-PREMIUM 3D BENTO PORTFOLIO (Flagship Model)         -->
  <!-- ============================================================== -->
  <main id="layoutUltraBento" class="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-5 lg:gap-6 auto-rows-[minmax(200px,auto)] relative z-10">
    
    <!-- 1. Main Profile & Detailed Bio Box -->
    <div class="premium-card col-span-1 md:col-span-4 lg:col-span-4 row-span-2 p-8 lg:p-10 flex flex-col justify-between delay-1 interactive" data-tilt data-tilt-max="2" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.1">
      <div class="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8 float-el">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div class="relative flex-shrink-0">
            <!-- Morphing Avatar -->
            <div class="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-100 to-purple-100 p-1 avatar-morph flex items-center justify-center overflow-hidden border border-white shadow-sm">
              <img id="bentoAvatarImg" src="${escapeHtml(defaultAvatar)}" alt="${escapeHtml(defaultName)}" class="w-full h-full object-cover rounded-full mix-blend-multiply">
            </div>
            <div class="pulse-ring">
              <div class="w-full h-full bg-green-500 rounded-full border-4 border-white shadow-sm relative z-10"></div>
            </div>
          </div>
          <div>
            <div class="bg-white/90 backdrop-blur text-gray-600 text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-2 shadow-sm border border-gray-100 mb-3">
              <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span id="bentoLocation">${escapeHtml(defaultLocation)}</span>
            </div>
            <h1 id="bentoProfileName" class="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2 animate-gradient-text">${escapeHtml(defaultName)}</h1>
            <!-- Typed.js Text Container -->
            <p class="text-lg sm:text-xl font-semibold text-gray-700 min-h-[1.75rem]"><span id="typed-text"></span></p>
          </div>
        </div>
      </div>
      
      <div class="float-el-high border-t border-gray-100 pt-6">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <i class="fa-solid fa-user-astronaut text-blue-500"></i> About Me
        </h3>
        <p id="bentoProfileBio" class="text-gray-600 leading-relaxed text-sm sm:text-base">${escapeHtml(defaultBio)}</p>
        
        <!-- Badges Container -->
        <div id="bentoBadgesContainer" class="flex flex-wrap gap-2 mt-4"></div>
      </div>
    </div>

    <!-- 2. Services Box -->
    <div class="premium-card col-span-1 md:col-span-4 lg:col-span-2 row-span-2 p-8 flex flex-col delay-2 interactive" data-tilt data-tilt-max="4">
      <div class="flex items-center justify-between mb-6 float-el">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <i class="fa-solid fa-briefcase text-purple-500"></i> Services
        </h3>
        <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">Live</span>
      </div>
      
      <div id="bentoServicesContainer" class="space-y-6 flex-1 float-el-high flex flex-col justify-center">
        <!-- Filled dynamically -->
      </div>
    </div>

    <!-- 3. Projects Box -->
    <div class="premium-card col-span-1 md:col-span-2 lg:col-span-3 row-span-1 p-8 delay-3 interactive" data-tilt data-tilt-max="3">
      <div class="flex items-center justify-between mb-5 float-el">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <i class="fa-solid fa-sparkles text-yellow-400"></i> Featured Projects
        </h3>
        <span class="text-xs font-bold text-blue-500 flex items-center gap-1 group cursor-pointer">
          Portfolio <i class="fa-solid fa-arrow-right transform group-hover:translate-x-1 transition-transform"></i>
        </span>
      </div>
      
      <div id="bentoProjectsContainer" class="grid grid-cols-1 sm:grid-cols-2 gap-4 float-el-high">
        <!-- Project 1 -->
        <div class="p-4 rounded-2xl bg-white/90 hover:bg-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 group">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl transition-all group-hover:rotate-12 group-hover:scale-110 shadow-sm">
            <i class="fa-solid fa-toolbox"></i>
          </div>
          <div class="min-w-0">
            <h4 class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">shuvoalltool</h4>
            <p class="text-xs text-gray-500 truncate">Utility toolkit web app</p>
          </div>
        </div>
        <!-- Project 2 -->
        <div class="p-4 rounded-2xl bg-white/90 hover:bg-emerald-50 transition-all duration-300 border border-gray-100 hover:border-emerald-200 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 group">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl transition-all group-hover:-rotate-12 group-hover:scale-110 shadow-sm">
            <i class="fa-solid fa-calculator"></i>
          </div>
          <div class="min-w-0">
            <h4 class="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm truncate">amarhisab</h4>
            <p class="text-xs text-gray-500 truncate">Financial management</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. Skills Box with Animated Progress Bars -->
    <div class="premium-card col-span-1 md:col-span-2 lg:col-span-3 row-span-1 p-8 delay-3 interactive flex flex-col justify-center" data-tilt data-tilt-max="3">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 float-el flex items-center gap-1.5">
        <i class="fa-solid fa-bolt text-amber-500"></i> Core Skills
      </h3>
      <div class="grid grid-cols-2 gap-x-6 gap-y-4 float-el-high">
        <!-- Skill 1 -->
        <div>
          <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
            <span class="flex items-center gap-1.5"><i class="fa-brands fa-html5 text-orange-500"></i> HTML/CSS</span>
            <span class="font-mono text-gray-500">95%</span>
          </div>
          <div class="progress-container"><div class="progress-bar bg-gradient-to-r from-orange-400 to-red-500" data-width="95%"></div></div>
        </div>
        <!-- Skill 2 -->
        <div>
          <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-wind text-cyan-500"></i> Tailwind CSS</span>
            <span class="font-mono text-gray-500">90%</span>
          </div>
          <div class="progress-container"><div class="progress-bar bg-gradient-to-r from-cyan-400 to-blue-500" data-width="90%"></div></div>
        </div>
        <!-- Skill 3 -->
        <div>
          <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
            <span class="flex items-center gap-1.5"><i class="fa-brands fa-js text-yellow-500"></i> JavaScript</span>
            <span class="font-mono text-gray-500">85%</span>
          </div>
          <div class="progress-container"><div class="progress-bar bg-gradient-to-r from-yellow-400 to-orange-400" data-width="85%"></div></div>
        </div>
        <!-- Skill 4 -->
        <div>
          <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
            <span class="flex items-center gap-1.5"><i class="fa-solid fa-fire text-amber-500"></i> Firebase</span>
            <span class="font-mono text-gray-500">80%</span>
          </div>
          <div class="progress-container"><div class="progress-bar bg-gradient-to-r from-amber-400 to-red-400" data-width="80%"></div></div>
        </div>
      </div>
    </div>

    <!-- 5. Stats Box -->
    <div class="premium-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 p-8 delay-4 interactive flex items-center justify-center gap-6 sm:gap-10 text-center" data-tilt data-tilt-max="6">
      <div class="float-el transform hover:scale-110 transition-transform cursor-default">
        <h3 class="text-4xl font-extrabold text-blue-600 mb-1 animate-pulse">2+</h3>
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Years Exp.</p>
      </div>
      <div class="w-px h-16 bg-gray-200 float-el"></div>
      <div class="float-el transform hover:scale-110 transition-transform cursor-default">
        <h3 class="text-4xl font-extrabold text-emerald-500 mb-1">10+</h3>
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Projects</p>
      </div>
    </div>

    <!-- 6. Poultry Farm / Agri Manager Box -->
    <div class="premium-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 p-8 relative overflow-hidden group delay-4 interactive flex flex-col justify-center" data-tilt data-tilt-max="8">
      <!-- Animated background tractor watermark -->
      <i class="fa-solid fa-tractor absolute -right-6 -bottom-6 text-7xl text-gray-50 opacity-40 group-hover:scale-125 group-hover:text-orange-50 group-hover:-rotate-12 transition-all duration-700 ease-out z-0"></i>
      
      <div class="relative z-10 flex items-center gap-4 float-el">
        <div class="w-14 h-14 bg-white text-orange-500 rounded-2xl flex items-center justify-center text-2xl border border-orange-100 shadow-sm group-hover:animate-spin flex-shrink-0">
          <i class="fa-solid fa-egg"></i>
        </div>
        <div class="float-el-high min-w-0">
          <h3 class="text-lg font-bold text-gray-900 mb-0.5 group-hover:text-orange-600 transition-colors truncate">Agri-Manager</h3>
          <p class="text-xs text-gray-500 leading-tight">Managing real-world poultry operations & agriculture.</p>
        </div>
      </div>
    </div>

    <!-- 7. Social Media Connect Box -->
    <div class="premium-card col-span-1 md:col-span-4 lg:col-span-2 row-span-1 p-8 flex flex-col justify-center delay-4 interactive" data-tilt data-tilt-max="8">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center float-el">Connect</h3>
      <div id="bentoSocialContainer" class="flex justify-center flex-wrap gap-3 float-el-high">
        <!-- Rendered dynamically -->
      </div>
    </div>

    <!-- 8. Dark Contrast CTA Card -->
    <div class="col-span-1 md:col-span-4 lg:col-span-6 row-span-1 delay-5 interactive rounded-3xl" data-tilt data-tilt-max="2" data-tilt-speed="400" data-tilt-glare="true" data-tilt-max-glare="0.2">
      <div id="bentoCtaBox" class="block w-full h-full rounded-3xl p-8 sm:p-10 shadow-premium transition-all relative overflow-hidden group border border-transparent hover:border-gray-700 bg-gray-900 text-white cursor-pointer">
        <!-- Animated Background Gradients inside card -->
        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-indigo-600/80"></div>
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between h-full float-el text-center md:text-left gap-6">
          <div>
            <h3 class="text-2xl sm:text-4xl font-bold text-white mb-2 transform group-hover:translate-x-2 transition-transform duration-300">Let's work together</h3>
            <p class="text-gray-400 text-xs sm:text-sm group-hover:text-blue-100 transition-colors">Open for freelance opportunities & technical collaborations.</p>
          </div>
          <div id="bentoCtaBtnWrapper" class="flex items-center gap-3 bg-white/10 backdrop-blur border border-white/10 pr-2 pl-5 py-2 rounded-full hover:bg-white/20 transition-colors shrink-0">
            <span id="bentoCtaBtnText" class="text-white font-semibold text-xs sm:text-sm">যোগাযোগ করুন</span>
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 text-lg group-hover:text-blue-600 group-hover:-rotate-12 transition-all duration-500 shadow-md">
              <i class="fa-solid fa-paper-plane"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- ============================================================== -->
  <!-- 2. SHUVOX LIGHTNING CYBER 3D LAYOUT (High-Tech Mode)          -->
  <!-- ============================================================== -->
  <main id="layoutCyberLightning" class="w-full max-w-4xl mx-auto space-y-6 relative z-10 hidden">
    <!-- Top Cyber Terminal Header -->
    <div class="wire-box wire-blue p-6 sm:p-8 rounded-2xl bg-zinc-950/90 backdrop-blur-xl border border-cyan-500/30 text-white">
      <div class="flex flex-col sm:flex-row items-center gap-6">
        <div class="relative w-24 h-24 rounded-2xl p-1 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shrink-0">
          <img id="cyberAvatarImg" src="${escapeHtml(defaultAvatar)}" class="w-full h-full object-cover rounded-xl" alt="${escapeHtml(defaultName)}">
          <span class="absolute -bottom-2 -right-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-400 text-black rounded-md">SYS.OK</span>
        </div>
        <div class="text-center sm:text-left flex-1">
          <div class="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span> SHUVOX // CYBER_3D_LIVE
          </div>
          <h1 id="cyberProfileName" class="text-3xl sm:text-4xl font-extrabold font-tech tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">${escapeHtml(defaultName)}</h1>
          <p id="cyberProfileTitle" class="text-sm font-mono text-zinc-400 mt-1">${escapeHtml(defaultTitle)}</p>
          <p id="cyberProfileBio" class="text-xs text-zinc-300 mt-3 max-w-xl leading-relaxed">${escapeHtml(defaultBio)}</p>
        </div>
      </div>
    </div>

    <!-- Cyber Services & Tools -->
    <div class="wire-box wire-blue p-6 rounded-2xl bg-zinc-950/90 backdrop-blur-xl border border-cyan-500/20 text-white">
      <h3 class="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-4 flex items-center gap-2">
        <i class="fa-solid fa-microchip"></i> DEPLOYED_SERVICES // TOOLS
      </h3>
      <div id="cyberServicesGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"></div>
    </div>

    <!-- Cyber Social Matrix -->
    <div class="wire-box wire-blue p-6 rounded-2xl bg-zinc-950/90 backdrop-blur-xl border border-cyan-500/20 text-white">
      <h3 class="text-xs font-mono text-purple-400 tracking-widest uppercase mb-4 flex items-center gap-2">
        <i class="fa-solid fa-satellite-dish"></i> CONNECT_CHANNELS
      </h3>
      <div id="cyberSocialGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"></div>
    </div>

    <!-- Cyber Direct Contact Box -->
    <div id="cyberContactBox" class="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-zinc-900 to-purple-950/50 border border-cyan-400/40 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 class="font-bold text-lg font-tech text-cyan-300">INITIALIZE TRANSMISSION</h4>
        <p class="text-xs text-zinc-400">Direct secure encrypted communication channel.</p>
      </div>
      <a id="cyberContactBtn" href="#" target="_blank" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity">
        CONNECT NOW
      </a>
    </div>
  </main>

  <!-- ============================================================== -->
  <!-- 3. CLASSIC STACKED LUXURY BIO LAYOUT                           -->
  <!-- ============================================================== -->
  <main id="layoutClassicStacked" class="w-full max-w-[560px] mx-auto space-y-5 relative z-10 hidden">
    <!-- Header Card -->
    <div class="premium-card p-8 rounded-3xl text-center flex flex-col items-center">
      <div class="relative w-24 h-24 mb-4">
        <img id="classicAvatarImg" src="${escapeHtml(defaultAvatar)}" class="w-full h-full object-cover rounded-full border-4 border-white shadow-md" alt="${escapeHtml(defaultName)}">
        <div class="pulse-ring"><div class="w-full h-full bg-green-500 rounded-full border-2 border-white"></div></div>
      </div>
      <span id="classicLocationBadge" class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 mb-2">${escapeHtml(defaultLocation)}</span>
      <h1 id="classicProfileName" class="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">${escapeHtml(defaultName)}</h1>
      <p id="classicProfileTitle" class="text-xs sm:text-sm font-medium text-gray-500 mb-3">${escapeHtml(defaultTitle)}</p>
      <p id="classicProfileBio" class="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md">${escapeHtml(defaultBio)}</p>
      <div id="classicBadgesContainer" class="flex flex-wrap justify-center gap-1.5 mt-4"></div>
    </div>

    <!-- Social Links Stack -->
    <div id="classicSocialContainer" class="space-y-3"></div>

    <!-- Services Grid -->
    <div class="premium-card p-6 rounded-3xl">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Services & Highlights</h3>
      <div id="classicServicesContainer" class="grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
    </div>

    <!-- Direct Contact Button -->
    <div id="classicContactBox" class="p-5 rounded-3xl bg-gray-900 text-white text-center">
      <h4 class="font-bold text-base mb-1">সরাসরি যোগাযোগ করুন</h4>
      <p class="text-xs text-gray-400 mb-4">যে কোনো প্রজেক্ট বা প্রয়োজনে সরাসরি মেসেজ পাঠান।</p>
      <a id="classicContactBtn" href="#" target="_blank" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all">
        <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp Message
      </a>
    </div>
  </main>

  <!-- PWA Install Prompt Banner -->
  <div id="pwaInstallPrompt" class="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 translate-y-full bg-zinc-950/95 backdrop-blur-2xl text-white border border-cyan-400/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3">
    <div class="flex items-center gap-3 min-w-0">
      <img id="pwaInstallIcon" src="${escapeHtml(client.logoUrl || defaultAvatar)}" class="w-10 h-10 rounded-xl object-cover border border-cyan-400/40 shrink-0" alt="App Icon">
      <div class="min-w-0">
        <h4 id="pwaInstallTitle" class="text-xs sm:text-sm font-bold text-white truncate">${escapeHtml(client.shortName || 'BIO DATA')} অ্যাপ</h4>
        <p class="text-[11px] text-zinc-400 truncate">হোম স্ক্রিনে ইনস্টল করে সরাসরি চালান</p>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <button id="btnDismissPWA" type="button" class="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors">পরে</button>
      <button id="btnAcceptPWA" type="button" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all">ইনস্টল</button>
    </div>
  </div>

  <!-- Realtime Live Sync Toast -->
  <div id="liveSyncToast" class="fixed bottom-4 right-4 z-50 translate-y-12 bg-zinc-950/90 text-white border border-cyan-400/30 rounded-xl px-4 py-2 text-xs font-semibold shadow-xl flex items-center gap-2">
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
    <span id="toastMsg">লাইভ সিঙ্ক সম্পন্ন হয়েছে</span>
  </div>

  <!-- Scripts -->
  <script>
    var CLIENT_ID = "${escapeHtml(client.id)}";
    var FIREBASE_URL = "${escapeHtml(clientEndpoint)}";
    var initialEmbeddedData = ${initialDataJson};

    // 1. Magical Cursor Logic
    var cursor = document.getElementById('magicCursor');
    if (cursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.addEventListener('mousemove', function(e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });

      function bindCursorHover() {
        var interactables = document.querySelectorAll('a, button, .interactive');
        interactables.forEach(function(el) {
          el.addEventListener('mouseenter', function() { cursor.classList.add('hovering'); });
          el.addEventListener('mouseleave', function() { cursor.classList.remove('hovering'); });
        });
      }
      bindCursorHover();
    }

    // 2. Typed.js Initialization
    var typedInstance = null;
    function initTypedText(titles) {
      var strings = titles && titles.length ? titles : ['Frontend Developer', 'Poultry Farm Manager', 'UI/UX Enthusiast', 'Tech & Agri Blender'];
      var target = document.getElementById('typed-text');
      if (!target) return;
      if (typedInstance) {
        try { typedInstance.destroy(); } catch(e) {}
      }
      try {
        typedInstance = new Typed('#typed-text', {
          strings: strings,
          typeSpeed: 50,
          backSpeed: 30,
          backDelay: 2200,
          loop: true,
          cursorChar: '|'
        });
      } catch(e) {
        target.textContent = strings[0] || '';
      }
    }

    // 3. Animate Progress Bars
    function triggerProgressBars() {
      setTimeout(function() {
        var progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(function(bar) {
          var targetWidth = bar.getAttribute('data-width') || '85%';
          bar.style.width = targetWidth;
        });
      }, 700);
    }

    // 4. Toast Notification
    var toastTimeout = null;
    function showToast(msg) {
      var toast = document.getElementById('liveSyncToast');
      var label = document.getElementById('toastMsg');
      if (!toast || !label) return;
      label.textContent = msg;
      toast.classList.remove('translate-y-12');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(function() {
        toast.classList.add('translate-y-12');
      }, 2500);
    }

    // 5. Renderers for Bento Grid
    function renderBentoData(data) {
      var prof = data.profile || {};
      var nameEl = document.getElementById('bentoProfileName');
      var bioEl = document.getElementById('bentoProfileBio');
      var locEl = document.getElementById('bentoLocation');
      var avatarEl = document.getElementById('bentoAvatarImg');

      if (nameEl && prof.name) nameEl.textContent = prof.name;
      if (bioEl && prof.bio) bioEl.textContent = prof.bio;
      if (locEl && prof.location) locEl.textContent = prof.location;
      if (avatarEl && prof.avatarUrl) avatarEl.src = prof.avatarUrl;

      // Typed.js titles
      var titles = [];
      if (prof.title) titles.push(prof.title);
      if (Array.isArray(data.badges)) {
        data.badges.forEach(function(b) { if (b.text) titles.push(b.text); });
      }
      if (!titles.length) titles = ['Frontend Developer', 'Poultry Farm Manager', 'Full-Stack Creator'];
      initTypedText(titles);

      // Badges
      var badgesContainer = document.getElementById('bentoBadgesContainer');
      if (badgesContainer) {
        badgesContainer.innerHTML = '';
        if (Array.isArray(data.badges)) {
          data.badges.forEach(function(b) {
            var span = document.createElement('span');
            span.className = 'text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm';
            span.textContent = b.text;
            badgesContainer.appendChild(span);
          });
        }
      }

      // Services Box
      var srvContainer = document.getElementById('bentoServicesContainer');
      if (srvContainer) {
        srvContainer.innerHTML = '';
        var services = Array.isArray(data.services) && data.services.length ? data.services : [
          { title: 'Web Development', subtitle: 'Modern, responsive, and blazing-fast web applications.' },
          { title: 'UI/UX Design', subtitle: 'Crafting intuitive and clean user interfaces.' },
          { title: 'Farm Consulting', subtitle: 'Operational strategies and tech integration.' }
        ];

        var srvColors = [
          { bg: 'bg-blue-50', text: 'text-blue-500', hbg: 'group-hover:bg-blue-500', htext: 'group-hover:text-blue-600', border: 'border-blue-100', icon: 'fa-code' },
          { bg: 'bg-purple-50', text: 'text-purple-500', hbg: 'group-hover:bg-purple-500', htext: 'group-hover:text-purple-600', border: 'border-purple-100', icon: 'fa-pen-nib' },
          { bg: 'bg-orange-50', text: 'text-orange-500', hbg: 'group-hover:bg-orange-500', htext: 'group-hover:text-orange-600', border: 'border-orange-100', icon: 'fa-wheat-awn' }
        ];

        services.forEach(function(s, idx) {
          var c = srvColors[idx % srvColors.length];
          var div = document.createElement('div');
          div.className = 'flex items-start gap-4 group cursor-pointer';
          div.innerHTML = '<div class="w-12 h-12 rounded-2xl ' + c.bg + ' ' + c.text + ' flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform ' + c.hbg + ' group-hover:text-white shadow-sm border ' + c.border + '">'
            + '<i class="fa-solid ' + c.icon + '"></i></div>'
            + '<div class="min-w-0"><h4 class="font-bold text-gray-900 text-sm ' + c.htext + ' transition-colors truncate">' + escapeHtml(s.title) + '</h4>'
            + '<p class="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">' + escapeHtml(s.subtitle || '') + '</p></div>';
          srvContainer.appendChild(div);
        });
      }

      // Social Links Box
      var socContainer = document.getElementById('bentoSocialContainer');
      if (socContainer) {
        socContainer.innerHTML = '';
        var links = Array.isArray(data.socialLinks) && data.socialLinks.length ? data.socialLinks.filter(function(l){ return l.enabled !== false; }) : [
          { platform: 'facebook', url: 'https://facebook.com' },
          { platform: 'github', url: 'https://github.com' },
          { platform: 'telegram', url: 'https://t.me' }
        ];

        var platformConfig = {
          facebook: { icon: 'fa-brands fa-facebook-f', color: 'hover:border-blue-600 hover:text-white', bg: 'bg-blue-600' },
          github: { icon: 'fa-brands fa-github', color: 'hover:border-gray-900 hover:text-white', bg: 'bg-gray-900' },
          linkedin: { icon: 'fa-brands fa-linkedin-in', color: 'hover:border-blue-500 hover:text-white', bg: 'bg-blue-500' },
          telegram: { icon: 'fa-brands fa-telegram', color: 'hover:border-sky-500 hover:text-white', bg: 'bg-sky-500' },
          youtube: { icon: 'fa-brands fa-youtube', color: 'hover:border-red-600 hover:text-white', bg: 'bg-red-600' },
          instagram: { icon: 'fa-brands fa-instagram', color: 'hover:border-pink-600 hover:text-white', bg: 'bg-pink-600' },
          custom: { icon: 'fa-solid fa-link', color: 'hover:border-cyan-500 hover:text-white', bg: 'bg-cyan-500' }
        };

        links.forEach(function(l) {
          var cfg = platformConfig[l.platform] || platformConfig.custom;
          var a = document.createElement('a');
          a.href = l.url || '#';
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.className = 'w-11 h-11 flex items-center justify-center bg-white rounded-xl border border-gray-100 text-gray-500 ' + cfg.color + ' hover:shadow-lg transition-all text-lg group relative overflow-hidden';
          a.innerHTML = '<div class="absolute inset-0 ' + cfg.bg + ' transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl z-0"></div>'
            + '<i class="' + cfg.icon + ' relative z-10 transition-transform group-hover:scale-110"></i>';
          socContainer.appendChild(a);
        });
      }

      // CTA Box Action
      var ctaBox = document.getElementById('bentoCtaBox');
      var ctaBtnText = document.getElementById('bentoCtaBtnText');
      if (ctaBox && data.contact) {
        ctaBox.onclick = function() {
          if (data.contact.whatsappNumber) {
            var msg = encodeURIComponent(data.contact.whatsappMessage || 'Hello ' + (prof.name || ''));
            window.open('https://wa.me/' + data.contact.whatsappNumber.replace(/[^0-9]/g, '') + '?text=' + msg, '_blank');
          } else if (data.contact.telegramUsername) {
            window.open('https://t.me/' + data.contact.telegramUsername.replace('@', ''), '_blank');
          } else if (data.contact.email) {
            window.location.href = 'mailto:' + data.contact.email;
          } else {
            showToast('কন্টাক্ট ইনফরমেশন শীঘ্রই যুক্ত হচ্ছে');
          }
        };
      }
    }

    // 6. Layout Style Switcher
    function applyLayoutStyle(style) {
      var st = style || 'ultra_bento_3d';
      var bentoEl = document.getElementById('layoutUltraBento');
      var cyberEl = document.getElementById('layoutCyberLightning');
      var classicEl = document.getElementById('layoutClassicStacked');
      var boidsCanvas = document.getElementById('boidsCanvas');

      if (bentoEl) bentoEl.classList.add('hidden');
      if (cyberEl) cyberEl.classList.add('hidden');
      if (classicEl) classicEl.classList.add('hidden');
      if (boidsCanvas) boidsCanvas.style.display = 'none';

      document.body.classList.remove('theme-cyber');

      if (st === 'shuvox_lightning_cyber') {
        if (cyberEl) cyberEl.classList.remove('hidden');
        if (boidsCanvas) boidsCanvas.style.display = 'block';
        document.body.classList.add('theme-cyber');
        renderCyberData(initialEmbeddedData);
      } else if (st === 'classic_stacked') {
        if (classicEl) classicEl.classList.remove('hidden');
        renderClassicData(initialEmbeddedData);
      } else {
        // Default: Ultra Bento 3D
        if (bentoEl) bentoEl.classList.remove('hidden');
        renderBentoData(initialEmbeddedData);
        triggerProgressBars();
      }
    }

    // 7. Cyber Layout Renderer
    function renderCyberData(data) {
      var prof = data.profile || {};
      var nameEl = document.getElementById('cyberProfileName');
      var titleEl = document.getElementById('cyberProfileTitle');
      var bioEl = document.getElementById('cyberProfileBio');
      var avatarEl = document.getElementById('cyberAvatarImg');

      if (nameEl && prof.name) nameEl.textContent = prof.name;
      if (titleEl && prof.title) titleEl.textContent = prof.title;
      if (bioEl && prof.bio) bioEl.textContent = prof.bio;
      if (avatarEl && prof.avatarUrl) avatarEl.src = prof.avatarUrl;

      var srvGrid = document.getElementById('cyberServicesGrid');
      if (srvGrid && Array.isArray(data.services)) {
        srvGrid.innerHTML = '';
        data.services.forEach(function(s) {
          var div = document.createElement('div');
          div.className = 'p-3 rounded-xl bg-zinc-900/80 border border-cyan-400/30 flex items-center gap-3';
          div.innerHTML = '<div class="w-8 h-8 rounded-lg bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-sm font-bold shrink-0"><i class="fa-solid fa-code"></i></div>'
            + '<div class="min-w-0"><h4 class="font-bold text-xs text-white truncate">' + escapeHtml(s.title) + '</h4>'
            + '<p class="text-[10px] text-zinc-400 truncate">' + escapeHtml(s.subtitle || '') + '</p></div>';
          srvGrid.appendChild(div);
        });
      }

      var socGrid = document.getElementById('cyberSocialGrid');
      if (socGrid && Array.isArray(data.socialLinks)) {
        socGrid.innerHTML = '';
        data.socialLinks.filter(function(l){ return l.enabled !== false; }).forEach(function(l) {
          var a = document.createElement('a');
          a.href = l.url || '#';
          a.target = '_blank';
          a.className = 'p-2.5 rounded-xl bg-zinc-900 border border-purple-500/30 hover:border-purple-400 text-center text-xs font-mono text-zinc-300 hover:text-white transition-all truncate block';
          a.textContent = l.title || l.platform;
          socGrid.appendChild(a);
        });
      }

      var contactBtn = document.getElementById('cyberContactBtn');
      if (contactBtn && data.contact && data.contact.whatsappNumber) {
        contactBtn.href = 'https://wa.me/' + data.contact.whatsappNumber.replace(/[^0-9]/g, '');
      }
    }

    // 8. Classic Layout Renderer
    function renderClassicData(data) {
      var prof = data.profile || {};
      var nameEl = document.getElementById('classicProfileName');
      var titleEl = document.getElementById('classicProfileTitle');
      var bioEl = document.getElementById('classicProfileBio');
      var locEl = document.getElementById('classicLocationBadge');
      var avatarEl = document.getElementById('classicAvatarImg');

      if (nameEl && prof.name) nameEl.textContent = prof.name;
      if (titleEl && prof.title) titleEl.textContent = prof.title;
      if (bioEl && prof.bio) bioEl.textContent = prof.bio;
      if (locEl && prof.location) locEl.textContent = prof.location;
      if (avatarEl && prof.avatarUrl) avatarEl.src = prof.avatarUrl;

      var socContainer = document.getElementById('classicSocialContainer');
      if (socContainer && Array.isArray(data.socialLinks)) {
        socContainer.innerHTML = '';
        data.socialLinks.filter(function(l){ return l.enabled !== false; }).forEach(function(l) {
          var a = document.createElement('a');
          a.href = l.url || '#';
          a.target = '_blank';
          a.className = 'premium-card p-4 rounded-2xl flex items-center justify-between hover:-translate-y-0.5 transition-all block';
          a.innerHTML = '<span class="font-bold text-sm text-gray-800">' + escapeHtml(l.title || l.platform) + '</span>'
            + '<i class="fa-solid fa-arrow-right text-xs text-blue-500"></i>';
          socContainer.appendChild(a);
        });
      }

      var contactBtn = document.getElementById('classicContactBtn');
      if (contactBtn && data.contact && data.contact.whatsappNumber) {
        contactBtn.href = 'https://wa.me/' + data.contact.whatsappNumber.replace(/[^0-9]/g, '');
      }
    }

    // 9. Apply All Data Live
    var lastSignature = '';
    function applyAllData(data, shouldToast) {
      if (!data || typeof data !== 'object') return;
      var currentLayout = data.layoutStyle || 'ultra_bento_3d';
      var sig = (data.updatedAt || '') + '_' + currentLayout + '_' + (data.profile ? data.profile.name : '') + '_' + (data.services ? data.services.length : 0);
      if (sig === lastSignature) return;
      lastSignature = sig;

      initialEmbeddedData = data;
      applyLayoutStyle(currentLayout);

      try {
        localStorage.setItem('bio_cache_' + CLIENT_ID, JSON.stringify(data));
      } catch(e) {}

      if (shouldToast) {
        showToast('🔄 বায়ো ও লেআউট তথ্য লাইভ সিঙ্ক হয়েছে!');
      }
    }

    // Hydrate
    try {
      var cached = localStorage.getItem('bio_cache_' + CLIENT_ID);
      if (cached) {
        applyAllData(JSON.parse(cached), false);
      } else {
        applyAllData(initialEmbeddedData, false);
      }
    } catch(e) {
      applyAllData(initialEmbeddedData, false);
    }

    // Realtime Firebase polling
    function fetchFromFirebase() {
      fetch(FIREBASE_URL + '?t=' + Date.now())
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data) applyAllData(data, true);
        })
        .catch(function() {});
    }
    setInterval(fetchFromFirebase, 5000);

    // 10. Boids Animation for Cyber Theme
    (function initBoids() {
      var canvas = document.getElementById('boidsCanvas');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var width, height;
      var boids = [];
      var numBoids = 45;
      var colors = ['#3b82f6', '#ef4444', '#facc15', '#a855f7', '#2dd4bf'];

      function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      function Boid() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 3 + 3;
      }
      Boid.prototype.update = function() {
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        this.vx += (Math.random() - 0.5) * 0.15;
        this.vy += (Math.random() - 0.5) * 0.15;
        var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 2.5) {
          this.vx = (this.vx / speed) * 2.5;
          this.vy = (this.vy / speed) * 2.5;
        }
        this.x += this.vx;
        this.y += this.vy;
      };
      Boid.prototype.draw = function() {
        var angle = Math.atan2(this.vy, this.vx);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size, this.size / 1.5);
        ctx.lineTo(-this.size / 2, 0);
        ctx.lineTo(-this.size, -this.size / 1.5);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
      };

      for (var i = 0; i < numBoids; i++) boids.push(new Boid());

      function animate() {
        if (canvas.style.display !== 'none') {
          ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
          ctx.fillRect(0, 0, width, height);
          for (var i = 0; i < boids.length; i++) {
            for (var j = i + 1; j < boids.length; j++) {
              var dx = boids[i].x - boids[j].x;
              var dy = boids[i].y - boids[j].y;
              var dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 85) {
                ctx.beginPath();
                ctx.moveTo(boids[i].x, boids[i].y);
                ctx.lineTo(boids[j].x, boids[j].y);
                ctx.strokeStyle = 'rgba(59, 130, 246, ' + (1 - dist / 85) * 0.3 + ')';
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          }
          for (var k = 0; k < boids.length; k++) {
            boids[k].update();
            boids[k].draw();
          }
        }
        requestAnimationFrame(animate);
      }
      animate();
    })();

    // 11. Lightning effect slowed down to 8-10 seconds
    (function initLightning() {
      var canvas = document.getElementById('lightningCanvas');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      function flash() {
        if (document.body.classList.contains('theme-cyber')) {
          canvas.style.opacity = '0.7';
          setTimeout(function() { canvas.style.opacity = '0'; }, 80);
          setTimeout(function() { canvas.style.opacity = '0.9'; }, 150);
          setTimeout(function() { canvas.style.opacity = '0'; }, 260);
        }
        var nextInterval = 8000 + Math.random() * 3000; // 8 to 11 seconds
        setTimeout(flash, nextInterval);
      }
      setTimeout(flash, 8000);
    })();

    // 12. PWA Install Banner Logic
    var deferredPrompt = null;
    var pwaBanner = document.getElementById('pwaInstallPrompt');
    var btnAcceptPWA = document.getElementById('btnAcceptPWA');
    var btnDismissPWA = document.getElementById('btnDismissPWA');

    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      deferredPrompt = e;
      if (pwaBanner) {
        setTimeout(function() {
          pwaBanner.classList.remove('translate-y-full');
        }, 1500);
      }
    });

    if (btnAcceptPWA) {
      btnAcceptPWA.addEventListener('click', function() {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function(choice) {
            if (choice.outcome === 'accepted') {
              showToast('🎉 অ্যাপ ইনস্টল সম্পন্ন হয়েছে!');
            }
            deferredPrompt = null;
          });
        }
        if (pwaBanner) pwaBanner.classList.add('translate-y-full');
      });
    }

    if (btnDismissPWA && pwaBanner) {
      btnDismissPWA.addEventListener('click', function() {
        pwaBanner.classList.add('translate-y-full');
      });
    }

    // 13. Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js').catch(function() {});
      });
    }
  </script>
</body>
</html>`;
}
