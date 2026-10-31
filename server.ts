import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  ClientRecord,
  generateClientManifest,
  generateClientServiceWorker,
  generateClientIndexHtml
} from './src/clientTemplates';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8649772073:AAHvhPRNE5pZmWPN1qU68z0ug3isdP7fNPg';
const TELEGRAM_ADMIN_CHAT_ID = String(process.env.TELEGRAM_CHAT_ID || '5440151107');

// Global Crash Protection - Prevent process termination on transient errors
process.on('uncaughtException', (err) => {
  console.error('🛡️ Process Uncaught Exception Guard:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('🛡️ Process Unhandled Rejection Guard:', reason);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all origins (including GitHub Pages)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Storage directory & files
const DATA_DIR = path.resolve(process.cwd(), 'data');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');
const SOCIAL_FILE = path.join(DATA_DIR, 'social.json');
const CONTACT_FILE = path.join(DATA_DIR, 'contact.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const BADGES_FILE = path.join(DATA_DIR, 'badges.json');
const FIREBASE_FILE = path.join(DATA_DIR, 'firebase.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const THEME_FILE = path.join(DATA_DIR, 'theme.json');

export interface ProfileInfo {
  name: string;
  handle: string;
  title: string;
  location: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
}

export interface BadgeItem {
  id: string;
  text: string;
}

export interface HighlightService {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'telegram' | 'youtube' | 'instagram' | 'tiktok' | 'snapchat' | 'twitter' | 'github' | 'custom';
  title: string;
  url: string;
  username?: string;
  subtitle: string;
  buttonText: string;
  isFeatured?: boolean;
  enabled: boolean;
}

export interface ContactInfo {
  enabled: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
  email: string;
  telegramUsername: string;
  customNote: string;
}

export interface BotLog {
  id: string;
  timestamp: string;
  action: 'add' | 'edit' | 'delete' | 'start' | 'list' | 'test' | 'error';
  user: string;
  text: string;
  serviceTitle?: string;
}

// Initial default services (12 items)
const DEFAULT_SERVICES: HighlightService[] = [
  {
    id: "h1",
    title: "⚡ Shuvo Official image Uploader",
    subtitle: "Web Image Uploader",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10",
    linkUrl: "https://androadappsdevelopershuvo.github.io/web_image_uploader/WEB%20IMAGE%20UPLOAS.html",
    createdAt: "2026-10-12T10:00:00.000Z"
  },
  {
    id: "h_1789432893967mf6",
    title: "Image to PDF Converter",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0WKD8w5ijwQjZ9Kud4DBymrTdPbChGcgVb1HzbEBxMw&s",
    linkUrl: "https://androadappsdevelopershuvo.github.io/pdf/genaratore.html",
    createdAt: "2026-10-12T10:05:00.000Z"
  },
  {
    id: "h_17894330215491rm",
    title: "WP Chat Opener",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjSwN7R_Sc_ICvjuSMieXu2i9HFj8mpfjfOBSI_U77GA&s",
    linkUrl: "https://androadappsdevelopershuvo.github.io/whatsapp/opener.html",
    createdAt: "2026-10-12T10:10:00.000Z"
  },
  {
    id: "h_178943316603544b",
    title: "QR Code Pro Generator",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj0UXOpAGwxbCdVZGM7hcG5_F5WQDFrjRvfL_g_aRAAQ&s=10",
    linkUrl: "https://androadappsdevelopershuvo.github.io/qr/code.html",
    createdAt: "2026-10-12T10:15:00.000Z"
  },
  {
    id: "h_1789433311363knl",
    title: "Text To File Converter",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://play-lh.googleusercontent.com/ZRaN_xqGeqfAHxvSOejYNJ-EQAHO0S_LpPJFrWiyDcTK3Q7GzfLv3JOmCrSpaROvegcuSMj72IocY93OH2G8Mg",
    linkUrl: "https://androadappsdevelopershuvo.github.io/textto/file.html",
    createdAt: "2026-10-12T10:20:00.000Z"
  },
  {
    id: "h_17894357912303ho",
    title: "ZIP File Creator",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://play-lh.googleusercontent.com/PNGH4JIH6-0Vgb2GiRygzlGWMzVhaR8LEBYslY2UerXcoL2xbp3GWFaN3-FojoPwOwA7fe5WuF5xjTtwi6zlhyU",
    linkUrl: "https://androadappsdevelopershuvo.github.io/zip/creatore.html",
    createdAt: "2026-10-12T10:25:00.000Z"
  },
  {
    id: "h_1789435907469k5v",
    title: "AGE Calculator",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://www.thegreatapps.com/application/upload/Apps/2022/02/age-calculating-tool-48.png",
    linkUrl: "https://androadappsdevelopershuvo.github.io/age/calculator.html",
    createdAt: "2026-10-12T10:30:00.000Z"
  },
  {
    id: "h_1789435991068tp1",
    title: "PK Weather",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://play-lh.googleusercontent.com/hqfx_dT5atHVFFmCJ00ngqmXwqJjuf2MJG3lCZxya_w7DH_E8FQFHnPZaSrBUFNeSIzhF81YVRYeFG5tEcLqBQ",
    linkUrl: "https://weather-topaz-eta-99.vercel.app/",
    createdAt: "2026-10-12T10:35:00.000Z"
  },
  {
    id: "h_1789445255378vlf",
    title: "BULK SMS BOOMBER",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://play-lh.googleusercontent.com/6F2FN7E9Hg841bZaqe1Vp4V9i4N0ZoQfbR9M9y3bJtx9tToET2PRh4UnOnSwn1oRVTxYymcMLFlqSI3RA5Hq9-g",
    linkUrl: "https://androadappsdevelopershuvo.github.io/sms/boomber.html",
    createdAt: "2026-10-12T10:40:00.000Z"
  },
  {
    id: "h_17894456687618f0",
    title: "Drot Mail Generator",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgzCRDn58t2rmiiZR0ILPQOZWMA3EXVE8L6B7DM3BuAA&s=10",
    linkUrl: "https://androadappsdevelopershuvo.github.io/Drot/mail.html",
    createdAt: "2026-10-12T10:45:00.000Z"
  },
  {
    id: "h_1791802323586wo2",
    title: "Social Bio Maker",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://i.ibb.co/6RRndsD1/IMG-0230.jpg",
    linkUrl: "https://bio-data-ochre.vercel.app/",
    createdAt: "2026-10-12T10:50:00.000Z"
  },
  {
    id: "h_1791802569270e74",
    title: "Html Code Runner",
    subtitle: "ফটো ও মেমোরিজ",
    imageUrl: "https://i.ytimg.com/vi/QHKzyKASMck/sddefault.jpg",
    linkUrl: "https://htmlcode-psi.vercel.app/",
    createdAt: "2026-10-12T10:55:00.000Z"
  }
];

// Initial default social links
const DEFAULT_SOCIAL: SocialLink[] = [
  {
    id: "s_fb",
    platform: "facebook",
    title: "Facebook Profile / Page",
    url: "https://www.facebook.com/share/1c63KeYHxt/",
    username: "@shuvo_bhai_444",
    subtitle: "অফিসিয়াল ফেসবুক প্রোফাইল",
    buttonText: "যুক্ত হোন",
    isFeatured: true,
    enabled: true
  },
  {
    id: "s_tg",
    platform: "telegram",
    title: "Telegram Channel / Inbox",
    url: "https://t.me/djhakar007ff",
    username: "@djhakar007ff",
    subtitle: "টেলিগ্রাম মেসেজ ইনবক্স",
    buttonText: "যুক্ত হোন",
    isFeatured: true,
    enabled: true
  },
  {
    id: "s_yt",
    platform: "youtube",
    title: "Youtube Channel",
    url: "https://youtube.com/@lovewithsong",
    username: "@lovewithsong",
    subtitle: "ডেভোলপার এর চ্যানেল সাবস্ক্রাইব করুন",
    buttonText: "সাবস্ক্রাইব",
    isFeatured: true,
    enabled: true
  },
  {
    id: "s_insta",
    platform: "instagram",
    title: "Instagram Photos & Reels",
    url: "https://instagram.com/fbuser0007",
    username: "@fbuser0007",
    subtitle: "ইনস্টাগ্রাম ফটো ও রিলস",
    buttonText: "ফলো করুন",
    isFeatured: false,
    enabled: true
  },
  {
    id: "s_x",
    platform: "twitter",
    title: "X (Twitter) Profile",
    url: "https://x.com/XSHUVOxxx",
    username: "@XSHUVOxxx",
    subtitle: "ডেভোলপার 乂 আইডি ফলো করুন",
    buttonText: "ফলো করুন",
    enabled: true,
    isFeatured: false
  }
];

const DEFAULT_CONTACT: ContactInfo = {
  enabled: true,
  whatsappNumber: "+8801778526313",
  whatsappMessage: "𝐻𝐼々ᗪᴇᴠʟᴏᴘᴇʀ—͟͞Sʜᴜᴠᴏ...𝐼 𝐜𝐚𝐦𝐞 𝐟𝐫𝐨𝐦 𝐘𝐨𝐮𝐫 𝘄𝗲𝗯𝘀𝗶𝘁𝗲...𝐼 𝘄𝗮𝗻𝘁  𝗧𝗼 𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝘄𝗶𝘁𝗵 𝐘𝐨𝐮 👨‍💻",
  email: "freefirelover2111887942@gmail.com",
  telegramUsername: "djhakar007ff",
  customNote: "যেকোনো প্রজেক্ট, কলাবোরেশন বা যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন।"
};

const DEFAULT_PROFILE: ProfileInfo = {
  name: "⚡ 乂 ＳＨＵＶＯ 乂 ⚡",
  handle: "@shuvo_bhai_444",
  title: "💻 Full-Stack Developer & Tech Enthusiast",
  location: "Natore, Bangladesh",
  bio: "🚀 Building modern web apps with React, Node.js & TypeScript. Open source contributor, tech writer and gamer in free time!",
  avatarUrl: "https://i.ibb.co/bRWhx1Lf/4880.jpg",
  bannerUrl: "https://simpleprogrammer.com/wp-content/uploads/2023/05/Coding-Desk.jpg"
};

const DEFAULT_BADGES: BadgeItem[] = [];

const FIREBASE_DEFAULT_URL = 'https://biodata-fd087-default-rtdb.asia-southeast1.firebasedatabase.app';

// Initialize Storage
function initDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SERVICES_FILE)) {
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(DEFAULT_SERVICES, null, 2), 'utf-8');
  }
  if (!fs.existsSync(SOCIAL_FILE)) {
    fs.writeFileSync(SOCIAL_FILE, JSON.stringify(DEFAULT_SOCIAL, null, 2), 'utf-8');
  }
  if (!fs.existsSync(CONTACT_FILE)) {
    fs.writeFileSync(CONTACT_FILE, JSON.stringify(DEFAULT_CONTACT, null, 2), 'utf-8');
  }
  if (!fs.existsSync(PROFILE_FILE)) {
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(DEFAULT_PROFILE, null, 2), 'utf-8');
  }
  if (!fs.existsSync(BADGES_FILE)) {
    fs.writeFileSync(BADGES_FILE, JSON.stringify(DEFAULT_BADGES, null, 2), 'utf-8');
  }
  if (!fs.existsSync(FIREBASE_FILE)) {
    fs.writeFileSync(FIREBASE_FILE, JSON.stringify({ url: FIREBASE_DEFAULT_URL }, null, 2), 'utf-8');
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(CLIENTS_FILE)) {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(THEME_FILE)) {
    fs.writeFileSync(THEME_FILE, JSON.stringify({ themeStyle: 'ultra_cyber_glass', layoutStyle: 'social_first' }, null, 2), 'utf-8');
  }
}

initDataStore();

function getThemeConfig(): { themeStyle: string; layoutStyle: string } {
  try {
    if (fs.existsSync(THEME_FILE)) {
      const raw = JSON.parse(fs.readFileSync(THEME_FILE, 'utf-8'));
      return {
        themeStyle: raw.themeStyle || 'ultra_cyber_glass',
        layoutStyle: raw.layoutStyle || 'social_first'
      };
    }
  } catch {}
  return { themeStyle: 'ultra_cyber_glass', layoutStyle: 'social_first' };
}

function saveThemeConfig(themeStyle?: string, layoutStyle?: string) {
  try {
    const current = getThemeConfig();
    const updated = {
      themeStyle: themeStyle || current.themeStyle,
      layoutStyle: layoutStyle || current.layoutStyle
    };
    fs.writeFileSync(THEME_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    notifySSE({ type: 'theme_updated', data: updated.themeStyle });
    notifySSE({ type: 'layout_updated', data: updated.layoutStyle });
    syncToFirebase();
    return true;
  } catch (err) {
    console.error('Error saving theme config:', err);
    return false;
  }
}

function getFirebaseConfig(): { url: string } {
  try {
    const raw = JSON.parse(fs.readFileSync(FIREBASE_FILE, 'utf-8'));
    if (raw && raw.url) return raw;
  } catch {}
  return { url: FIREBASE_DEFAULT_URL };
}

function saveFirebaseConfig(url: string) {
  try {
    fs.writeFileSync(FIREBASE_FILE, JSON.stringify({ url: url.trim() }, null, 2), 'utf-8');
    syncToFirebase();
    return true;
  } catch (err) {
    console.error('Error saving firebase config:', err);
    return false;
  }
}

// Pull latest saved data from Firebase on server startup so bot changes are never lost across restarts
async function pullFromFirebase() {
  const cfg = getFirebaseConfig();
  if (!cfg.url || !cfg.url.startsWith('http')) return;
  const baseUrl = cfg.url.replace(/\/+$/, '');
  try {
    console.log('🔄 Checking Firebase for persistent user data...');
    const res = await fetch(`${baseUrl}/bio.json`);
    if (res.ok) {
      const fbData = await res.json();
      if (fbData && typeof fbData === 'object' && Object.keys(fbData).length > 0) {
        if (fbData.profile) {
          fs.writeFileSync(PROFILE_FILE, JSON.stringify(fbData.profile, null, 2), 'utf-8');
        }
        if (Array.isArray(fbData.badges)) {
          fs.writeFileSync(BADGES_FILE, JSON.stringify(fbData.badges, null, 2), 'utf-8');
        }
        if (Array.isArray(fbData.services)) {
          fs.writeFileSync(SERVICES_FILE, JSON.stringify(fbData.services, null, 2), 'utf-8');
        }
        if (Array.isArray(fbData.socialLinks)) {
          fs.writeFileSync(SOCIAL_FILE, JSON.stringify(fbData.socialLinks, null, 2), 'utf-8');
        }
        if (fbData.contact) {
          fs.writeFileSync(CONTACT_FILE, JSON.stringify(fbData.contact, null, 2), 'utf-8');
        }
        if (fbData.themeStyle || fbData.layoutStyle) {
          const currentTheme = getThemeConfig();
          const newTheme = {
            themeStyle: fbData.themeStyle || currentTheme.themeStyle,
            layoutStyle: fbData.layoutStyle || currentTheme.layoutStyle
          };
          fs.writeFileSync(THEME_FILE, JSON.stringify(newTheme, null, 2), 'utf-8');
        }
        console.log('✅ Successfully pulled and restored persistent user data from Firebase!');
      }
    }

    // Pull clients data from Firebase
    const clientsRes = await fetch(`${baseUrl}/clients.json`);
    if (clientsRes.ok) {
      const fbClients = await clientsRes.json();
      if (fbClients && typeof fbClients === 'object') {
        const clientList: ClientRecord[] = Array.isArray(fbClients) ? fbClients : Object.values(fbClients);
        if (clientList.length > 0) {
          fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clientList, null, 2), 'utf-8');
          console.log(`✅ Successfully restored ${clientList.length} clients from Firebase!`);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not pull from Firebase on startup:', err);
  }
}

// Client Management Storage Helpers
function getClients(): ClientRecord[] {
  try {
    const data = JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'));
    const list: ClientRecord[] = Array.isArray(data) ? data : Object.values(data);
    return list.map(c => ({
      ...c,
      badges: Array.isArray(c.badges) ? c.badges : [],
      services: Array.isArray(c.services) ? c.services : [],
      socialLinks: Array.isArray(c.socialLinks) ? c.socialLinks : [],
      profile: c.profile || {
        name: c.appName || 'My Bio',
        handle: '@official',
        title: 'Digital Creator',
        location: 'Bangladesh',
        bio: 'স্বাগতম আমার অফিসিয়াল বায়ো পেজে!',
        avatarUrl: c.logoUrl || '',
        bannerUrl: ''
      },
      layoutStyle: c.layoutStyle || 'social_first',
      themeStyle: c.themeStyle || 'classic_dark',
      contact: c.contact || {
        enabled: true,
        whatsappNumber: '+8801700000000',
        whatsappMessage: 'Hello!',
        email: 'client@gmail.com',
        telegramUsername: '',
        customNote: ''
      }
    }));
  } catch {
    return [];
  }
}

function saveClients(clients: ClientRecord[]): boolean {
  try {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving clients:', err);
    return false;
  }
}

function getClientByChatId(chatId: string | number): ClientRecord | undefined {
  const clients = getClients();
  const targetId = String(chatId).trim();
  return clients.find(c => String(c.chatId).trim() === targetId);
}

function getClientById(id: string): ClientRecord | undefined {
  const clients = getClients();
  return clients.find(c => c.id === id);
}

function resolveClientForChat(chatId: string | number, clientIdParam?: string): ClientRecord | undefined {
  const cId = String(chatId).trim();
  const isAdmin = cId === TELEGRAM_ADMIN_CHAT_ID;
  if (clientIdParam) {
    const c = getClientById(clientIdParam);
    if (c) {
      if (isAdmin || String(c.chatId).trim() === cId) {
        return c;
      }
      return undefined;
    }
  }
  const clientByChat = getClientByChatId(cId);
  if (clientByChat) return clientByChat;
  return undefined;
}

function updateClientData(clientId: string, updater: (c: ClientRecord) => void): boolean {
  const clients = getClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) return false;
  updater(client);
  saveClients(clients);
  syncClientToFirebase(client);
  return true;
}

function deleteClient(clientId: string): boolean {
  const clients = getClients();
  const filtered = clients.filter(c => c.id !== clientId);
  saveClients(filtered);
  const cfg = getFirebaseConfig();
  if (cfg.url && cfg.url.startsWith('http')) {
    const baseUrl = cfg.url.replace(/\/+$/, '');
    fetch(`${baseUrl}/clients/${clientId}.json`, { method: 'DELETE' }).catch(() => {});
  }
  return true;
}

async function syncClientToFirebase(client: ClientRecord) {
  const cfg = getFirebaseConfig();
  if (!cfg.url || !cfg.url.startsWith('http')) return;
  const baseUrl = cfg.url.replace(/\/+$/, '');
  try {
    const payload = {
      ...client,
      updatedAt: new Date().toISOString()
    };
    await fetch(`${baseUrl}/clients/${client.id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`✅ Client ${client.appName} (${client.id}) synced to Firebase`);
  } catch (err) {
    console.error(`Firebase sync error for client ${client.id}:`, err);
  }
}

function createNewClient(
  chatId: string,
  appName: string,
  shortName: string,
  logoUrl: string,
  layoutStyle: 'social_first' | 'services_first' = 'social_first'
): ClientRecord {
  const id = 'c_' + Date.now();
  const name = appName.replace(/[-|•].*$/, '').trim() || 'My Bio';
  const newClient: ClientRecord = {
    id,
    chatId: String(chatId).trim(),
    appName: appName.trim(),
    shortName: (shortName.trim() || 'BIO DATA').toUpperCase(),
    logoUrl: logoUrl.trim() || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10',
    layoutStyle,
    createdAt: new Date().toISOString(),
    profile: {
      name: name,
      handle: '@' + name.toLowerCase().replace(/[^a-z0-9_]/g, '') || '@official_bio',
      title: '🌟 Digital Creator & Entrepreneur',
      location: 'Bangladesh',
      bio: 'স্বাগতম আমার অফিসিয়াল বায়ো ডাটা ও প্রোফাইল পেজে! যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন।',
      avatarUrl: logoUrl.trim() || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10',
      bannerUrl: 'https://simpleprogrammer.com/wp-content/uploads/2023/05/Coding-Desk.jpg'
    },
    badges: [
      { id: 'b_1', text: '⚡ Verified Profile' },
      { id: 'b_2', text: '🔥 Official Creator' }
    ],
    services: [],
    socialLinks: [],
    contact: {
      enabled: true,
      whatsappNumber: '+8801700000000',
      whatsappMessage: `Hello ${name}, I visited your bio website and want to connect!`,
      email: 'client@gmail.com',
      telegramUsername: '',
      customNote: 'যেকোনো প্রজেক্ট, কলাবোরেশন বা প্রয়োজনে সরাসরি মেসেজ দিন।'
    }
  };
  return newClient;
}

// Execute pull on startup immediately
pullFromFirebase();

async function syncToFirebase() {
  const cfg = getFirebaseConfig();
  if (!cfg.url || !cfg.url.startsWith('http')) return;
  const baseUrl = cfg.url.replace(/\/+$/, '');
  try {
    const themeCfg = getThemeConfig();
    const payload = {
      profile: getProfileInfo(),
      badges: getBadges(),
      services: getServices(),
      socialLinks: getSocialLinks(),
      contact: getContactInfo(),
      themeStyle: themeCfg.themeStyle,
      layoutStyle: themeCfg.layoutStyle,
      updatedAt: new Date().toISOString()
    };
    const res = await fetch(`${baseUrl}/bio.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      console.log('✅ Realtime Database synced to Firebase successfully:', baseUrl);
    } else {
      console.warn('⚠️ Firebase sync responded with status:', res.status, res.statusText);
    }
  } catch (err) {
    console.error('Firebase sync error:', err);
  }
}

// Read / Write Helpers
function getServices(): HighlightService[] {
  try {
    const data = JSON.parse(fs.readFileSync(SERVICES_FILE, 'utf-8'));
    return Array.isArray(data) ? data : Object.values(data);
  } catch {
    return DEFAULT_SERVICES;
  }
}

function saveServices(services: HighlightService[]): boolean {
  try {
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2), 'utf-8');
    notifySSE({ type: 'services_updated', data: services });
    syncToFirebase();
    return true;
  } catch (err) {
    console.error('Error saving services:', err);
    return false;
  }
}

function getSocialLinks(): SocialLink[] {
  try {
    const data = JSON.parse(fs.readFileSync(SOCIAL_FILE, 'utf-8'));
    return Array.isArray(data) ? data : Object.values(data);
  } catch {
    return DEFAULT_SOCIAL;
  }
}

function saveSocialLinks(links: SocialLink[]): boolean {
  try {
    fs.writeFileSync(SOCIAL_FILE, JSON.stringify(links, null, 2), 'utf-8');
    notifySSE({ type: 'social_updated', data: links });
    syncToFirebase();
    return true;
  } catch (err) {
    console.error('Error saving social links:', err);
    return false;
  }
}

function getContactInfo(): ContactInfo {
  try {
    return JSON.parse(fs.readFileSync(CONTACT_FILE, 'utf-8'));
  } catch {
    return DEFAULT_CONTACT;
  }
}

function saveContactInfo(contact: ContactInfo): boolean {
  try {
    fs.writeFileSync(CONTACT_FILE, JSON.stringify(contact, null, 2), 'utf-8');
    notifySSE({ type: 'contact_updated', data: contact });
    syncToFirebase();
    return true;
  } catch (err) {
    console.error('Error saving contact info:', err);
    return false;
  }
}

function getProfileInfo(): ProfileInfo {
  try {
    return JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf-8'));
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfileInfo(profile: ProfileInfo): boolean {
  try {
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2), 'utf-8');
    notifySSE({ type: 'profile_updated', data: profile });
    syncToFirebase();
    return true;
  } catch (err) {
    console.error('Error saving profile info:', err);
    return false;
  }
}

function getBadges(): BadgeItem[] {
  try {
    const data = JSON.parse(fs.readFileSync(BADGES_FILE, 'utf-8'));
    return Array.isArray(data) ? data : Object.values(data);
  } catch {
    return DEFAULT_BADGES;
  }
}

function saveBadges(badges: BadgeItem[]): boolean {
  try {
    fs.writeFileSync(BADGES_FILE, JSON.stringify(badges, null, 2), 'utf-8');
    notifySSE({ type: 'badges_updated', data: badges });
    syncToFirebase();
    return true;
  } catch (err) {
    console.error('Error saving badges:', err);
    return false;
  }
}

function getLogs(): BotLog[] {
  try {
    return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function addLog(action: BotLog['action'], user: string, text: string, serviceTitle?: string) {
  try {
    const logs = getLogs();
    const newLog: BotLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      action,
      user,
      text,
      serviceTitle
    };
    logs.unshift(newLog);
    const trimmed = logs.slice(0, 100);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
    notifySSE({ type: 'log_added', data: newLog });
  } catch (err) {
    console.error('Error adding log:', err);
  }
}

// Server-Sent Events (SSE) for Real-Time synchronization
const sseClients = new Set<express.Response>();

function notifySSE(payload: any) {
  const dataString = `data: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(dataString);
    } catch {
      sseClients.delete(client);
    }
  }
}

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// REST API for all Bio data
app.post('/api/sync', async (req, res) => {
  await syncToFirebase();
  res.json({ success: true, message: 'Synced to Firebase' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'active', timestamp: new Date().toISOString() });
});

app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('🤖 Telegram Webhook Update received:', JSON.stringify(update));
    if (update && update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    } else if (update && update.message) {
      const msg = update.message;
      const chatId = String(msg.chat.id);
      const sender = msg.from?.first_name || 'User';
      if (msg.photo && Array.isArray(msg.photo) && msg.photo.length > 0) {
        const state = userStates[chatId];
        if (state && (
          state.step === 'add_image' ||
          state.step === 'edit_service_val' ||
          state.step === 'prof_edit_avatar' ||
          state.step === 'prof_edit_banner' ||
          state.step === 'admin_wizard_logo' ||
          state.step === 'client_srv_image' ||
          state.step === 'client_prof_avatar' ||
          state.step === 'client_prof_banner'
        )) {
          const bestPhoto = msg.photo[msg.photo.length - 1];
          const fileInfo = await telegramRequest('getFile', { file_id: bestPhoto.file_id });
          if (fileInfo.ok && fileInfo.result?.file_path) {
            const directPhotoUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.result.file_path}`;
            await handleUserMessage(chatId, directPhotoUrl, sender);
            return res.json({ ok: true });
          }
        }
      }
      if (msg.text) {
        await handleUserMessage(chatId, msg.text, sender);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/data', (req, res) => {
  const themeCfg = getThemeConfig();
  res.json({
    success: true,
    profile: getProfileInfo(),
    badges: getBadges(),
    services: getServices(),
    socialLinks: getSocialLinks(),
    contact: getContactInfo(),
    themeStyle: themeCfg.themeStyle,
    layoutStyle: themeCfg.layoutStyle
  });
});

app.get('/api/profile', (req, res) => {
  res.json({ success: true, profile: getProfileInfo() });
});

app.get('/api/badges', (req, res) => {
  res.json({ success: true, badges: getBadges() });
});

app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    services: getServices(),
    socialLinks: getSocialLinks(),
    contact: getContactInfo()
  });
});

app.get('/api/social', (req, res) => {
  res.json({ success: true, socialLinks: getSocialLinks() });
});

app.get('/api/contact', (req, res) => {
  res.json({ success: true, contact: getContactInfo() });
});

app.get('/api/clients', (req, res) => {
  res.json({ success: true, clients: getClients() });
});

app.get('/api/clients/:id', (req, res) => {
  const client = getClientById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json({ success: true, client });
});

app.get('/api/clients/:id/files/:filename', (req, res) => {
  const client = getClientById(req.params.id);
  if (!client) return res.status(404).send('Client not found');
  const filename = req.params.filename;
  const cfg = getFirebaseConfig();
  const fbUrl = cfg.url || FIREBASE_DEFAULT_URL;

  if (filename === 'index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="index.html"`);
    return res.send(generateClientIndexHtml(client, fbUrl));
  } else if (filename === 'manifest.json') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="manifest.json"`);
    return res.send(generateClientManifest(client));
  } else if (filename === 'sw.js') {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="sw.js"`);
    return res.send(generateClientServiceWorker(client));
  }
  res.status(404).send('File not found');
});

app.post('/api/telegram/simulate', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const reply = await handleUserMessage(TELEGRAM_ADMIN_CHAT_ID, text, 'Admin (Simulated)');
  res.json({ success: true, reply });
});

// Express endpoints for Telegram Webhook Management
app.all('/api/webhook/set', async (req, res) => {
  let targetUrl = (req.query.url || req.body?.url) as string;
  if (!targetUrl) {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      targetUrl = `${proto}://${host}`;
    }
  }
  if (!targetUrl) {
    return res.status(400).json({ ok: false, message: 'URL required, pass ?url=https://yourdomain.com' });
  }
  const result = await setTelegramWebhook(targetUrl);
  return res.json(result);
});

app.get('/api/webhook/status', async (req, res) => {
  const info = await getTelegramWebhookStatus();
  return res.json({ ok: true, isPolling: botState.isPolling, info: info.result });
});

app.all('/api/webhook/delete', async (req, res) => {
  const result = await deleteTelegramWebhook();
  startTelegramPolling().catch(() => {});
  return res.json(result);
});

// ==========================================
// TELEGRAM BOT IMPLEMENTATION
// ==========================================

interface TelegramUserState {
  step:
    | 'idle'
    // Service flows
    | 'add_title'
    | 'add_subtitle'
    | 'add_image'
    | 'add_link'
    | 'edit_service_val'
    // Social flows
    | 'edit_social_url'
    | 'edit_social_title'
    | 'edit_social_subtitle'
    | 'edit_social_button'
    | 'add_social_url'
    // Contact flows
    | 'edit_contact_whatsapp'
    | 'edit_contact_whatsapp_msg'
    | 'edit_contact_email'
    | 'edit_contact_note'
    // Profile flows
    | 'prof_edit_name'
    | 'prof_edit_handle'
    | 'prof_edit_title'
    | 'prof_edit_location'
    | 'prof_edit_bio'
    | 'prof_edit_avatar'
    | 'prof_edit_banner'
    // Badge flows
    | 'badge_add_text'
    | 'badge_edit_text'
    // Admin Wizard & Broadcast flows
    | 'admin_wizard_chatid'
    | 'admin_wizard_appname'
    | 'admin_wizard_shortname'
    | 'admin_wizard_logo'
    | 'admin_wizard_layout'
    | 'admin_broadcast_msg'
    // Client self-management flows
    | 'client_prof_name'
    | 'client_prof_handle'
    | 'client_prof_title'
    | 'client_prof_location'
    | 'client_prof_bio'
    | 'client_prof_avatar'
    | 'client_prof_banner'
    | 'client_badge_add_text'
    | 'client_srv_title'
    | 'client_srv_subtitle'
    | 'client_srv_image'
    | 'client_srv_link'
    | 'client_srv_edit_val'
    | 'client_social_url'
    | 'client_social_title'
    | 'client_social_subtitle'
    | 'client_social_button'
    | 'client_contact_wa'
    | 'client_contact_wa_msg'
    | 'client_contact_email'
    | 'client_contact_note';
  tempData?: any;
}

const userStates: Record<string, TelegramUserState> = {};

const botState = {
  isPolling: false,
  isWebhookMode: false,
  offset: 0,
  botUsername: '',
  botFirstName: '',
  errorsCount: 0
};

// Safe HTML character escaper for Telegram HTML parse_mode
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isRemoveCommand(text: string): boolean {
  if (!text) return false;
  const lower = text.trim().toLowerCase();
  return (
    lower === '/remove' ||
    lower === 'remove' ||
    lower === 'none' ||
    lower === '/none' ||
    lower === 'clear' ||
    lower === '/clear' ||
    lower === 'no' ||
    lower === '/no' ||
    lower === 'delete' ||
    lower === '/delete' ||
    lower === 'off' ||
    lower === '/off' ||
    lower === 'খালি' ||
    lower === 'মুছে ফেলুন' ||
    lower === 'সরিয়ে দিন'
  );
}

// Telegram API Helper Functions
async function telegramRequest(method: string, body: any) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (err) {
    console.error(`Telegram ${method} failed:`, err);
    return { ok: false, error: String(err) };
  }
}

async function setTelegramWebhook(baseUrl: string) {
  try {
    let target = baseUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    const fullWebhookUrl = target.endsWith('/api/telegram-webhook')
      ? target
      : `${target.replace(/\/+$/, '')}/api/telegram-webhook`;

    botState.isPolling = false;
    botState.isWebhookMode = true;
    globalThis.__telegram_polling_active = false;
    if (currentPollAbortController) {
      try { currentPollAbortController.abort(); } catch {}
      currentPollAbortController = null;
    }

    const res = await telegramRequest('setWebhook', {
      url: fullWebhookUrl,
      drop_pending_updates: true
    });

    console.log(`🌐 Telegram Webhook set to ${fullWebhookUrl}:`, res);
    return { ok: !!res.ok, url: fullWebhookUrl, result: res };
  } catch (err) {
    console.error('Failed to set webhook:', err);
    return { ok: false, error: String(err) };
  }
}

async function deleteTelegramWebhook() {
  try {
    botState.isWebhookMode = false;
    botState.isPolling = false;
    globalThis.__telegram_polling_active = false;
    const res = await telegramRequest('deleteWebhook', { drop_pending_updates: true });
    startTelegramPolling().catch(() => {});
    return { ok: !!res.ok, result: res };
  } catch (err) {
    startTelegramPolling().catch(() => {});
    return { ok: false, error: String(err) };
  }
}

async function getTelegramWebhookStatus() {
  return await telegramRequest('getWebhookInfo', {});
}

// Send telegram message with automatic plain-text fallback if HTML parse fails
async function sendTelegramMessage(chatId: string | number, text: string, extra: any = {}) {
  const parseMode = extra.parse_mode !== undefined ? extra.parse_mode : 'HTML';
  const payload: any = {
    chat_id: chatId,
    text,
    ...extra
  };
  if (parseMode) {
    payload.parse_mode = parseMode;
  }

  const res = await telegramRequest('sendMessage', payload);
  if (!res.ok) {
    console.warn(`Telegram sendMessage failed with parseMode ${parseMode}, falling back to plain text. Details:`, res.description || res.error);
    // Strip HTML tags for clean plain text fallback
    const plainText = text.replace(/<[^>]*>/g, '');
    return await telegramRequest('sendMessage', {
      chat_id: chatId,
      text: plainText,
      reply_markup: extra.reply_markup
    });
  }
  return res;
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return await telegramRequest('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text
  });
}

// Main Menu Keyboard
function getMainMenuKeyboard() {
  const profile = getProfileInfo();
  const services = getServices();
  const social = getSocialLinks();
  const badges = getBadges();
  const clients = getClients();

  return {
    inline_keyboard: [
      [
        { text: '👤 প্রোফাইল ও বায়ো কন্ট্রোল', callback_data: 'menu_profile' },
        { text: `🏷️ ব্যাজ সমূহ (${badges.length})`, callback_data: 'menu_badges' }
      ],
      [
        { text: `🌐 সোশ্যাল মিডিয়া (${social.length})`, callback_data: 'menu_social' },
        { text: '📞 সরাসরি যোগাযোগ', callback_data: 'menu_contact' }
      ],
      [
        { text: `🛠️ সাভিস সমূহ (${services.length}টি)`, callback_data: 'menu_services' },
        { text: '📋 সম্পূর্ণ বায়ো প্রিভিউ', callback_data: 'cmd_full_summary' }
      ],
      [
        { text: `👥 ক্লায়েন্ট সেল ও ম্যানেজমেন্ট (${clients.length} জন)`, callback_data: 'admin_menu_clients' },
        { text: '📢 ক্লায়েন্ট নোটিশ পাঠান', callback_data: 'admin_menu_broadcast' }
      ],
      [
        { text: '⚡ Webhook ২৪/৭ কন্ট্রোল', callback_data: 'admin_webhook_menu' },
        { text: '🌐 ওয়েবসাইট লাইভ দেখুন', url: 'https://androadappsdevelopershuvo.github.io/biodata.com' }
      ]
    ]
  };
}

// Profile Menu Keyboard
function getProfileMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '✏️ নাম পরিবর্তন', callback_data: 'prof_edit_name' },
        { text: '🔗 ইউজারনেম পরিবর্তন', callback_data: 'prof_edit_handle' }
      ],
      [
        { text: '💻 পদবী / টাইটেল পরিবর্তন', callback_data: 'prof_edit_title' },
        { text: '📍 লোকেশন পরিবর্তন', callback_data: 'prof_edit_loc' }
      ],
      [
        { text: '📝 বায়ো বিবরণ পরিবর্তন', callback_data: 'prof_edit_bio' }
      ],
      [
        { text: '🖼️ প্রোফাইল ছবি পরিবর্তন', callback_data: 'prof_edit_avatar' },
        { text: '🏞️ ব্যানার ছবি পরিবর্তন', callback_data: 'prof_edit_banner' }
      ],
      [
        { text: '🔙 প্রধান মেন্যু', callback_data: 'cmd_menu' }
      ]
    ]
  };
}

function getProfileDetailsText(): string {
  const p = getProfileInfo();
  return `👤 <b>প্রোফাইল ও বায়ো ইনফরমেশন:</b>\n\n`
    + `• ⚡ <b>নাম:</b> <b>${escapeHtml(p.name)}</b>\n`
    + `• 🔗 <b>হ্যান্ডেল:</b> <code>${escapeHtml(p.handle)}</code>\n`
    + `• 💻 <b>পদবী:</b> ${escapeHtml(p.title)}\n`
    + `• 📍 <b>লোকেশন:</b> ${escapeHtml(p.location)}\n`
    + `• 📝 <b>বায়ো:</b> <i>"${escapeHtml(p.bio)}"</i>\n`
    + `• 👤 <b>প্রোফাইল ছবি:</b> <a href="${escapeHtml(p.avatarUrl)}">ছবি দেখুন</a>\n`
    + `• 🏞️ <b>ব্যানার ছবি:</b> <a href="${escapeHtml(p.bannerUrl)}">ছবি দেখুন</a>\n\n`
    + `<i>কোন তথ্যটি পরিবর্তন করতে চান নির্বাচন করুন:</i>`;
}

// Badges Menu Keyboard
function getBadgesMenuKeyboard() {
  const badges = getBadges();
  const buttons: any[] = [];

  badges.forEach((b, idx) => {
    buttons.push([
      { text: `${idx + 1}. 🏷️ ${b.text}`, callback_data: `badge_manage:${b.id}` }
    ]);
  });

  buttons.push([
    { text: '➕ নতুন ব্যাজ যোগ করুন', callback_data: 'badge_add' }
  ]);
  buttons.push([
    { text: '🔙 প্রধান মেন্যু', callback_data: 'cmd_menu' }
  ]);

  return { inline_keyboard: buttons };
}

// Services Menu Keyboard
function getServicesMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📋 সাভিস তালিকা (/list)', callback_data: 'cmd_list' },
        { text: '➕ নতুন সাভিস যোগ (/add)', callback_data: 'cmd_add' }
      ],
      [
        { text: '✏️ সাভিস এডিট (/edit)', callback_data: 'cmd_edit' },
        { text: '🗑️ সাভিস ডিলিট (/delete)', callback_data: 'cmd_delete' }
      ],
      [
        { text: '🔙 প্রধান মেন্যু', callback_data: 'cmd_menu' }
      ]
    ]
  };
}

// Social Links Menu Keyboard
function getSocialMenuKeyboard() {
  const links = getSocialLinks();
  const buttons: any[] = [];

  links.forEach((l, idx) => {
    const icon = l.platform === 'facebook' ? '📘'
      : l.platform === 'telegram' ? '✈️'
      : l.platform === 'youtube' ? '🔴'
      : l.platform === 'instagram' ? '📸'
      : l.platform === 'tiktok' ? '🎵'
      : l.platform === 'snapchat' ? '👻'
      : l.platform === 'twitter' ? '✖️'
      : l.platform === 'github' ? '🐙' : '🔗';
    const status = l.enabled !== false ? '🟢' : '⚪ (লুকানো)';
    buttons.push([
      { text: `${icon} ${l.title} ${status}`, callback_data: `soc_manage:${l.id}` }
    ]);
  });

  buttons.push([
    { text: '➕ নতুন সোশ্যাল লিংক যোগ', callback_data: 'soc_add' }
  ]);
  buttons.push([
    { text: '🔙 প্রধান মেন্যু', callback_data: 'cmd_menu' }
  ]);

  return { inline_keyboard: buttons };
}

// Social Link Single Management Keyboard
function getSingleSocialKeyboard(linkId: string, isEnabled: boolean) {
  return {
    inline_keyboard: [
      [
        { text: '🔗 লিংক পরিবর্তন', callback_data: `soc_edit_url:${linkId}` },
        { text: '📌 নাম পরিবর্তন', callback_data: `soc_edit_title:${linkId}` }
      ],
      [
        { text: '🏷️ সাব-টাইটেল', callback_data: `soc_edit_sub:${linkId}` },
        { text: '🔘 বাটন টেক্সট', callback_data: `soc_edit_btn:${linkId}` }
      ],
      [
        { text: isEnabled ? '👁️ হাইড করুন' : '🟢 অন করুন', callback_data: `soc_toggle:${linkId}` },
        { text: '🗑️ মুছে ফেলুন', callback_data: `soc_del:${linkId}` }
      ],
      [
        { text: '🔙 সোশ্যাল মেন্যু', callback_data: 'menu_social' }
      ]
    ]
  };
}

// Contact Menu
function getContactMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📱 WhatsApp নম্বর পরিবর্তন', callback_data: 'contact_edit_wa' },
        { text: '💬 WhatsApp মেসেজ পরিবর্তন', callback_data: 'contact_edit_wa_msg' }
      ],
      [
        { text: '✉️ ইমেইল পরিবর্তন', callback_data: 'contact_edit_email' },
        { text: '📝 কোট/বার্তা পরিবর্তন', callback_data: 'contact_edit_note' }
      ],
      [
        { text: '🔙 প্রধান মেন্যু', callback_data: 'cmd_menu' }
      ]
    ]
  };
}

// ==========================================
// TELEGRAM DOCUMENT SENDER & CLIENT FILES
// ==========================================
async function sendTelegramDocument(
  chatId: string | number,
  filename: string,
  content: string | Uint8Array | any,
  caption?: string
) {
  try {
    const formData = new FormData();
    formData.append('chat_id', String(chatId));
    const blob = new Blob([content as any], {
      type: filename.endsWith('.html')
        ? 'text/html; charset=utf-8'
        : filename.endsWith('.json')
        ? 'application/json; charset=utf-8'
        : 'text/javascript; charset=utf-8'
    });
    formData.append('document', blob, filename);
    if (caption) {
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    if (!data.ok) {
      console.warn(`Telegram sendDocument failed for ${filename}:`, data.description || data.error);
    }
    return data;
  } catch (err) {
    console.error(`Failed to send document ${filename} to ${chatId}:`, err);
    return { ok: false, error: String(err) };
  }
}

async function sendClientFilesToTelegram(chatId: string | number, client: ClientRecord) {
  const cfg = getFirebaseConfig();
  const fbUrl = cfg.url || FIREBASE_DEFAULT_URL;

  // 1. Send announcement message
  await sendTelegramMessage(
    chatId,
    `📦 <b>৩টি ফাইল তৈরি করা হচ্ছে...</b>\n\n` +
    `👤 ক্লায়েন্ট: <b>${escapeHtml(client.appName)}</b>\n` +
    `🆔 ক্লায়েন্ট আইডি: <code>${client.id}</code>\n\n` +
    `⏳ একটু অপেক্ষা করুন, Telegram-এ ৩টি ফাইল পাঠানো হচ্ছে...`
  );

  const indexHtml = generateClientIndexHtml(client, fbUrl);
  const manifestJson = generateClientManifest(client);
  const swJs = generateClientServiceWorker(client);

  // Send 1. index.html
  await sendTelegramDocument(
    chatId,
    'index.html',
    indexHtml,
    `📄 <b>index.html</b>\n` +
    `• ক্লায়েন্টের সম্পূর্ণ লাইভ বায়ো ওয়েবসাইট\n` +
    `• ফায়ারবেজ আইডি: <code>${client.id}</code>`
  );

  // Send 2. manifest.json
  await sendTelegramDocument(
    chatId,
    'manifest.json',
    manifestJson,
    `⚙️ <b>manifest.json</b>\n` +
    `• PWA অ্যাপ কনফিগারেশন\n` +
    `• অ্যাপের নাম: <b>${escapeHtml(client.appName)}</b>\n` +
    `• শর্ট নেম: <code>${escapeHtml(client.shortName)}</code>`
  );

  // Send 3. sw.js
  await sendTelegramDocument(
    chatId,
    'sw.js',
    swJs,
    `🚀 <b>sw.js</b>\n` +
    `• PWA Service Worker (অফলাইন ও সুপারফাস্ট ক্যাশিং)`
  );

  // Send instructions message
  const instructions =
    `🎉 <b>৩টি ফাইল সফলভাবে পাঠানো হয়েছে!</b>\n\n` +
    `<b>পরবর্তী সহজ ৩টি পদক্ষেপ:</b>\n` +
    `১. ক্লায়েন্টের GitHub অ্যাকাউন্টে যান এবং একটি রিপোজিটরি তৈরি করুন (যেমন: <code>username.github.io</code> অথবা যেকোনো নাম)।\n` +
    `২. এই ৩টি ফাইল (<code>index.html</code>, <code>manifest.json</code>, <code>sw.js</code>) রিপোজিটরির রুটে আপলোড / Commit করুন।\n` +
    `৩. GitHub Pages চালু করে দিন।\n\n` +
    `✅ <b>ব্যাস কাজ শেষ!</b> ক্লায়েন্ট তার টেলিগ্রাম চ্যাট আইডি (<code>${client.chatId}</code>) থেকে আমাদের বটকে <code>/start</code> পাঠালেই নিজের ওয়েবসাইট সাথে সাথে লাইভ কন্ট্রোল করতে পারবে।\n\n` +
    `💡 <i>নোট: GitHub-এ ফাইল আপলোড করার পর GitHub Pages তৈরি হতে ১-২ মিনিট সময় লাগে এবং ব্রাউজারে পুরাতন ফাইল ক্যাশ (Cache) থেকে যেতে পারে। নতুন পরিবর্তন দেখতে ব্রাউজারের ক্যাশ ক্লিয়ার করুন বা Incognito মোডে ওপেন করুন।</i>`;

  await sendTelegramMessage(chatId, instructions, {
    reply_markup: getAdminSingleClientKeyboard(client.id)
  });
}

// ==========================================
// ADMIN CLIENTS KEYBOARDS
// ==========================================
function getAdminClientsListKeyboard() {
  const clients = getClients();
  const rows: any[] = [];

  clients.forEach(c => {
    rows.push([
      {
        text: `👤 ${c.appName} (${c.id})`,
        callback_data: `admin_view_client:${c.id}`
      }
    ]);
  });

  rows.push([
    { text: '➕ নতুন ক্লায়েন্ট তৈরি', callback_data: 'admin_btn_add_client' }
  ]);
  rows.push([
    { text: '🔙 প্রধান মেন্যু', callback_data: 'cmd_menu' }
  ]);

  return { inline_keyboard: rows };
}

function getAdminSingleClientKeyboard(clientId: string) {
  return {
    inline_keyboard: [
      [
        { text: '🎨 লেআউট & থিম', callback_data: `cl_layout_theme_main:${clientId}` }
      ],
      [
        { text: '📁 ৩টি ফাইল পুনরায় পাঠান', callback_data: `admin_dl_client:${clientId}` }
      ],
      [
        { text: '🗑️ এই ক্লায়েন্ট ডিলিট করুন', callback_data: `admin_del_client:${clientId}` }
      ],
      [
        { text: '🔙 ক্লায়েন্ট তালিকায় ফিরুন', callback_data: 'admin_menu_clients' }
      ]
    ]
  };
}

// ==========================================
// CLIENT SELF-MANAGEMENT KEYBOARDS & HELPERS
// ==========================================
function getClientMainMenuKeyboard(client: ClientRecord) {
  const badgesCount = (client.badges || []).length;
  const socialCount = (client.socialLinks || []).length;
  const servicesCount = (client.services || []).length;

  return {
    inline_keyboard: [
      [
        { text: '👤 প্রোফাইল ও বায়ো কন্ট্রোল', callback_data: `cl_prof:${client.id}` },
        { text: `🏷️ ব্যাজ সমূহ (${badgesCount}টি)`, callback_data: `cl_badges:${client.id}` }
      ],
      [
        { text: `🌐 সোশ্যাল মিডিয়া (${socialCount}টি)`, callback_data: `cl_social:${client.id}` },
        { text: '📞 সরাসরি যোগাযোগ', callback_data: `cl_contact:${client.id}` }
      ],
      [
        { text: `🛠️ সাভিস সমূহ (${servicesCount}টি)`, callback_data: `cl_services:${client.id}` },
        { text: '📋 সম্পূর্ণ বায়ো প্রিভিউ', callback_data: `cl_preview:${client.id}` }
      ],
      [
        { text: '🎨 লেআউট & থিম', callback_data: `cl_layout_theme_main:${client.id}` }
      ]
    ]
  };
}

function getClientProfileMenuKeyboard(client?: ClientRecord) {
  const id = client ? `:${client.id}` : '';
  return {
    inline_keyboard: [
      [
        { text: '✏️ নাম পরিবর্তন', callback_data: `cl_prof_edit_name${id}` },
        { text: '🔗 ইউজারনেম পরিবর্তন', callback_data: `cl_prof_edit_handle${id}` }
      ],
      [
        { text: '💻 পদবী / টাইটেল পরিবর্তন', callback_data: `cl_prof_edit_title${id}` },
        { text: '📍 লোকেশন পরিবর্তন', callback_data: `cl_prof_edit_loc${id}` }
      ],
      [
        { text: '📝 বায়ো বিবরণ পরিবর্তন', callback_data: `cl_prof_edit_bio${id}` }
      ],
      [
        { text: '🖼️ প্রোফাইল ছবি পরিবর্তন', callback_data: `cl_prof_edit_avatar${id}` },
        { text: '🏞️ ব্যানার ছবি পরিবর্তন', callback_data: `cl_prof_edit_banner${id}` }
      ],
      [
        { text: '🔙 প্রধান মেন্যু', callback_data: `cl_menu_main${id}` }
      ]
    ]
  };
}

function getClientLayoutThemeSubMenuKeyboard(client: ClientRecord) {
  return {
    inline_keyboard: [
      [
        { text: '📐 লেআউট (Section Order)', callback_data: `cl_sub_layout:${client.id}` },
        { text: '🎨 থিম (Color Themes)', callback_data: `cl_sub_theme:${client.id}` }
      ],
      [
        { text: '🔙 প্রধান মেন্যু', callback_data: `cl_menu_main:${client.id}` }
      ]
    ]
  };
}

function getClientLayoutOnlyKeyboard(client: ClientRecord) {
  const isServicesFirst = client.layoutStyle === 'services_first';
  return {
    inline_keyboard: [
      [
        { text: '📐 --- লেআউট সাজানো (Section Order) ---', callback_data: `cl_noop` }
      ],
      [
        {
          text: (isServicesFirst ? '⚪ ' : '🟢 ') + '১. সোশ্যাল মিডিয়া আগে (অ্যাডমিন স্টাইল)',
          callback_data: `cl_set_layout:social_first:${client.id}`
        }
      ],
      [
        {
          text: (isServicesFirst ? '🟢 ' : '⚪ ') + '২. সার্ভিস ও টুলস আগে (সার্ভিস স্টাইল)',
          callback_data: `cl_set_layout:services_first:${client.id}`
        }
      ],
      [
        { text: '🔙 লেআউট & থিম মেন্যু', callback_data: `cl_layout_theme_main:${client.id}` },
        { text: '🔙 প্রধান মেন্যু', callback_data: `cl_menu_main:${client.id}` }
      ]
    ]
  };
}

function getClientThemeOnlyKeyboard(client: ClientRecord) {
  const theme = client.themeStyle || 'shuvox_lightning_cyber';
  return {
    inline_keyboard: [
      [
        { text: '🎨 --- ওয়েবসাইট কালার থিম (UI Themes) ---', callback_data: `cl_noop` }
      ],
      [
        {
          text: (theme === 'shuvox_lightning_cyber' ? '🟢 ' : '⚪ ') + '⚡ ১. শোভক্স লাইটনিং সাইবার ৩ডি (SHUVOX Lightning Cyber)',
          callback_data: `cl_set_theme:shuvox_lightning_cyber:${client.id}`
        }
      ],
      [
        {
          text: (theme === 'ultra_cyber_glass' ? '🟢 ' : '⚪ ') + '✨ ২. আল্ট্রা প্রিমিয়াম সাইবার গ্লাস (Ultra Cyber Glass 3D)',
          callback_data: `cl_set_theme:ultra_cyber_glass:${client.id}`
        }
      ],
      [
        {
          text: (theme === 'organic_nature' ? '🟢 ' : '⚪ ') + '🍃 ৩. অর্গানিক নেচার (Organic Nature)',
          callback_data: `cl_set_theme:organic_nature:${client.id}`
        }
      ],
      [
        {
          text: (theme === 'bold_flat_popart' ? '🟢 ' : '⚪ ') + '💥 ৪. বোল্ড ফ্ল্যাট পপ আর্ট (Bold Flat Pop Art)',
          callback_data: `cl_set_theme:bold_flat_popart:${client.id}`
        }
      ],
      [
        {
          text: (theme === 'classic_dark' ? '🟢 ' : '⚪ ') + '🕶️ ৫. ক্লাসিক ডার্ক (Classic Dark)',
          callback_data: `cl_set_theme:classic_dark:${client.id}`
        }
      ],
      [
        { text: '🔙 লেআউট & থিম মেন্যু', callback_data: `cl_layout_theme_main:${client.id}` },
        { text: '🔙 প্রধান মেন্যু', callback_data: `cl_menu_main:${client.id}` }
      ]
    ]
  };
}

function getAdminThemeMenuKeyboard() {
  const themeCfg = getThemeConfig();
  const theme = themeCfg.themeStyle || 'shuvox_lightning_cyber';
  return {
    inline_keyboard: [
      [
        { text: '🎨 --- মাস্টার অ্যাডমিন থিম নির্বাচন ---', callback_data: `cl_noop` }
      ],
      [
        {
          text: (theme === 'shuvox_lightning_cyber' ? '🟢 ' : '⚪ ') + '⚡ ১. শোভক্স লাইটনিং সাইবার ৩ডি (SHUVOX Lightning Cyber)',
          callback_data: `admin_set_theme:shuvox_lightning_cyber`
        }
      ],
      [
        {
          text: (theme === 'ultra_cyber_glass' ? '🟢 ' : '⚪ ') + '✨ ২. আল্ট্রা প্রিমিয়াম সাইবার গ্লাস (Ultra Cyber Glass 3D)',
          callback_data: `admin_set_theme:ultra_cyber_glass`
        }
      ],
      [
        {
          text: (theme === 'organic_nature' ? '🟢 ' : '⚪ ') + '🍃 ৩. অর্গানিক নেচার (Organic Nature)',
          callback_data: `admin_set_theme:organic_nature`
        }
      ],
      [
        {
          text: (theme === 'bold_flat_popart' ? '🟢 ' : '⚪ ') + '💥 ৪. বোল্ড ফ্ল্যাট পপ আর্ট (Bold Flat Pop Art)',
          callback_data: `admin_set_theme:bold_flat_popart`
        }
      ],
      [
        {
          text: (theme === 'classic_dark' ? '🟢 ' : '⚪ ') + '🕶️ ৫. ক্লাসিক ডার্ক (Classic Dark)',
          callback_data: `admin_set_theme:classic_dark`
        }
      ],
      [
        { text: '🔙 প্রধান মেন্যু', callback_data: 'cmd_menu' }
      ]
    ]
  };
}

function getClientBadgesMenuKeyboard(client: ClientRecord) {
  const rows: any[] = [];
  const badges = client.badges || [];
  badges.forEach((b, idx) => {
    rows.push([
      { text: `${idx + 1}. ${b.text}`, callback_data: `cl_noop` },
      { text: '🗑️ মুছুন', callback_data: `cl_badge_del:${client.id}:${b.id}` }
    ]);
  });
  rows.push([
    { text: '➕ নতুন ব্যাজ যোগ করুন', callback_data: `cl_badge_add:${client.id}` }
  ]);
  rows.push([
    { text: '🔙 প্রধান মেন্যু', callback_data: `cl_menu_main:${client.id}` }
  ]);
  return { inline_keyboard: rows };
}

function getClientServicesMenuKeyboard(client: ClientRecord) {
  const rows: any[] = [];
  const services = client.services || [];
  services.forEach((s, idx) => {
    rows.push([
      { text: `#${idx + 1}. 🛠️ ${s.title.substring(0, 22)}`, callback_data: `cl_srv_view:${client.id}:${s.id}` },
      { text: '🗑️ মুছুন', callback_data: `cl_srv_del:${client.id}:${s.id}` }
    ]);
  });
  rows.push([
    { text: '➕ নতুন সাভিস যোগ করুন', callback_data: `cl_srv_add:${client.id}` }
  ]);
  rows.push([
    { text: '🔙 প্রধান মেন্যু', callback_data: `cl_menu_main:${client.id}` }
  ]);
  return { inline_keyboard: rows };
}

function getClientSingleServiceKeyboard(serviceId: string, clientId?: string) {
  const cid = clientId ? `:${clientId}` : '';
  return {
    inline_keyboard: [
      [
        { text: '📌 নাম পরিবর্তন', callback_data: `cl_srv_ed:title:${serviceId}${cid}` },
        { text: '🏷️ সাব-টাইটেল/ক্যাটাগরি', callback_data: `cl_srv_ed:sub:${serviceId}${cid}` }
      ],
      [
        { text: '🖼️ ছবি পরিবর্তন', callback_data: `cl_srv_ed:img:${serviceId}${cid}` },
        { text: '🔗 লিংক পরিবর্তন', callback_data: `cl_srv_ed:lnk:${serviceId}${cid}` }
      ],
      [
        { text: '🗑️ এই সার্ভিসটি ডিলিট করুন', callback_data: `cl_srv_del:${clientId || ''}:${serviceId}` }
      ],
      [
        { text: '🔙 সার্ভিস তালিকায় ফিরুন', callback_data: `cl_services:${clientId || ''}` }
      ]
    ]
  };
}

function getClientSocialMenuKeyboard(client: ClientRecord) {
  const rows: any[] = [];
  const socialLinks = client.socialLinks || [];
  socialLinks.forEach((s, idx) => {
    const icon = s.platform === 'facebook' ? '📘'
      : s.platform === 'telegram' ? '✈️'
      : s.platform === 'youtube' ? '🔴'
      : s.platform === 'instagram' ? '📸'
      : s.platform === 'tiktok' ? '🎵'
      : s.platform === 'snapchat' ? '👻'
      : s.platform === 'twitter' ? '✖️'
      : s.platform === 'github' ? '🐙' : '🔗';
    const status = s.enabled !== false ? '🟢' : '⚪ (লুকানো)';
    rows.push([
      { text: `${idx + 1}. ${icon} ${s.title} ${status}`, callback_data: `cl_soc_view:${client.id}:${s.id}` }
    ]);
  });
  rows.push([
    { text: '➕ নতুন সোশ্যাল লিংক যোগ', callback_data: `cl_soc_add:${client.id}` }
  ]);
  rows.push([
    { text: '🔙 প্রধান মেন্যু', callback_data: `cl_menu_main:${client.id}` }
  ]);
  return { inline_keyboard: rows };
}

function getClientSingleSocialKeyboard(clientId: string, linkId: string, isEnabled: boolean) {
  return {
    inline_keyboard: [
      [
        { text: '🔗 লিংক পরিবর্তন', callback_data: `cl_soc_edit_url:${clientId}:${linkId}` },
        { text: '📌 নাম পরিবর্তন', callback_data: `cl_soc_edit_title:${clientId}:${linkId}` }
      ],
      [
        { text: '🏷️ সাব-টাইটেল', callback_data: `cl_soc_edit_sub:${clientId}:${linkId}` },
        { text: '🔘 বাটন টেক্সট', callback_data: `cl_soc_edit_btn:${clientId}:${linkId}` }
      ],
      [
        { text: isEnabled ? '👁️ হাইড করুন' : '🟢 অন করুন', callback_data: `cl_soc_toggle:${clientId}:${linkId}` },
        { text: '🗑️ মুছে ফেলুন', callback_data: `cl_soc_del:${clientId}:${linkId}` }
      ],
      [
        { text: '🔙 সোশ্যাল মেন্যু', callback_data: `cl_social:${clientId}` }
      ]
    ]
  };
}

function getClientSocialPlatformKeyboard(clientId: string) {
  return {
    inline_keyboard: [
      [
        { text: '📘 Facebook', callback_data: `cl_soc_plat:facebook:${clientId}` },
        { text: '✈️ Telegram', callback_data: `cl_soc_plat:telegram:${clientId}` }
      ],
      [
        { text: '🔴 YouTube', callback_data: `cl_soc_plat:youtube:${clientId}` },
        { text: '📸 Instagram', callback_data: `cl_soc_plat:instagram:${clientId}` }
      ],
      [
        { text: '🎵 TikTok', callback_data: `cl_soc_plat:tiktok:${clientId}` },
        { text: '👻 Snapchat', callback_data: `cl_soc_plat:snapchat:${clientId}` }
      ],
      [
        { text: '✖️ Twitter / X', callback_data: `cl_soc_plat:twitter:${clientId}` },
        { text: '🐙 GitHub', callback_data: `cl_soc_plat:github:${clientId}` }
      ],
      [
        { text: '🔗 অন্যান্য / Custom লিংক', callback_data: `cl_soc_plat:custom:${clientId}` }
      ],
      [
        { text: '🔙 সোশ্যাল মেন্যু', callback_data: `cl_social:${clientId}` }
      ]
    ]
  };
}

function getClientContactMenuKeyboard(client?: ClientRecord) {
  const id = client ? `:${client.id}` : '';
  return {
    inline_keyboard: [
      [
        { text: '📱 WhatsApp নম্বর পরিবর্তন', callback_data: `cl_contact_edit_wa${id}` },
        { text: '💬 WhatsApp মেসেজ পরিবর্তন', callback_data: `cl_contact_edit_wa_msg${id}` }
      ],
      [
        { text: '✉️ ইমেইল পরিবর্তন', callback_data: `cl_contact_edit_email${id}` },
        { text: '📝 কোট/বার্তা পরিবর্তন', callback_data: `cl_contact_edit_note${id}` }
      ],
      [
        { text: '🔙 প্রধান মেন্যু', callback_data: `cl_menu_main${id}` }
      ]
    ]
  };
}

function getClientProfileText(client: ClientRecord): string {
  const p = client.profile;
  return `👤 <b>আপনার প্রোফাইল ও বায়ো ইনফরমেশন:</b>\n\n`
    + `• ⚡ <b>নাম:</b> <b>${escapeHtml(p.name)}</b>\n`
    + `• 🔗 <b>হ্যান্ডেল:</b> <code>${escapeHtml(p.handle)}</code>\n`
    + `• 💻 <b>পদবী:</b> ${escapeHtml(p.title)}\n`
    + `• 📍 <b>লোকেশন:</b> ${escapeHtml(p.location)}\n`
    + `• 📝 <b>বায়ো:</b> <i>"${escapeHtml(p.bio)}"</i>\n`
    + `• 👤 <b>ছবি:</b> <a href="${escapeHtml(p.avatarUrl)}">দেখুন</a>\n`
    + `• 🏞️ <b>ব্যানার:</b> <a href="${escapeHtml(p.bannerUrl)}">দেখুন</a>\n\n`
    + `<i>কোন তথ্যটি পরিবর্তন করতে চান নির্বাচন করুন:</i>`;
}

async function sendClientMainMenu(chatId: string, client: ClientRecord) {
  userStates[chatId] = { step: 'idle' };
  const isServicesFirst = client.layoutStyle === 'services_first';
  const layoutDesc = isServicesFirst ? '🛠️ সার্ভিস ও টুলস আগে' : '🌐 সোশ্যাল মিডিয়া আগে (অ্যাডমিন স্টাইল)';

  const msg = `👋 আসসালামু আলাইকুম <b>${escapeHtml(client.profile.name)}</b>!\n\n`
    + `আপনার বায়ো ডাটা ওয়েবসাইটের <b>কন্ট্রোল প্যানেলে</b> স্বাগতম! 🚀\n\n`
    + `📊 <b>বর্তমান অবস্থা:</b>\n`
    + `• 👤 নাম: <b>${escapeHtml(client.profile.name)}</b> (<code>${escapeHtml(client.profile.handle)}</code>)\n`
    + `• 💻 পদবী: ${escapeHtml(client.profile.title)}\n`
    + `• 🛠️ মোট সাভিস: <b>${client.services.length}</b> টি লাইভ\n`
    + `• 🌐 সোশ্যাল লিংক: <b>${client.socialLinks.length}</b> টি সক্রিয়\n`
    + `• 🏷️ ব্যাজ: <b>${client.badges.length}</b> টি\n`
    + `• 🎨 বর্তমান লেআউট: <b>${layoutDesc}</b>\n`
    + `• 📱 WhatsApp: <code>${escapeHtml(client.contact.whatsappNumber)}</code>\n`
    + `• ✉️ Email: <code>${escapeHtml(client.contact.email)}</code>\n\n`
    + `👇 <b>কী পরিবর্তন করতে চান নির্বাচন করুন:</b>`;

  await sendTelegramMessage(chatId, msg, { reply_markup: getClientMainMenuKeyboard(client) });
  return msg;
}

async function sendClientProfileMenu(chatId: string, client: ClientRecord) {
  userStates[chatId] = { step: 'idle' };
  const text = getClientProfileText(client);
  await sendTelegramMessage(chatId, text, { reply_markup: getClientProfileMenuKeyboard(client) });
  return text;
}

async function sendClientBadgesMenu(chatId: string, client: ClientRecord) {
  userStates[chatId] = { step: 'idle' };
  let msg = `🏷️ <b>আপনার ব্যাজ সমূহ (${client.badges.length}টি):</b>\n\n`;
  client.badges.forEach((b, i) => {
    msg += `• <b>${i + 1}.</b> ${escapeHtml(b.text)}\n`;
  });
  msg += `\n<i>নতুন ব্যাজ যোগ করতে বা মুছতে নিচের অপশন ব্যবহার করুন:</i>`;
  await sendTelegramMessage(chatId, msg, { reply_markup: getClientBadgesMenuKeyboard(client) });
  return msg;
}

async function sendClientServicesMenu(chatId: string, client: ClientRecord) {
  userStates[chatId] = { step: 'idle' };
  let text = `🛠️ <b>সাভিস ও টুলস ম্যানেজমেন্ট:</b>\nমোট সাভিস: <b>${client.services.length}</b>টি লাইভ\n\n`;
  client.services.forEach((s, idx) => {
    text += `<b>${idx + 1}.</b> <a href="${escapeHtml(s.linkUrl)}">${escapeHtml(s.title)}</a>\n🏷️ <i>${escapeHtml(s.subtitle)}</i>\n\n`;
  });
  text += `<i>নতুন সাভিস যোগ করতে বা কোনোটি মুছতে নির্বাচন করুন:</i>`;
  await sendTelegramMessage(chatId, text, { reply_markup: getClientServicesMenuKeyboard(client) });
  return text;
}

async function sendClientSocialMenu(chatId: string, client: ClientRecord) {
  userStates[chatId] = { step: 'idle' };
  const text = `🌐 <b>সোশ্যাল মিডিয়া প্রোফাইল ও লিংকসমূহ (${client.socialLinks.length}টি):</b>\n\nযে অ্যাকাউন্টটি অন/অফ করতে চান বা লিংক পরিবর্তন করতে চান নির্বাচন করুন:`;
  await sendTelegramMessage(chatId, text, { reply_markup: getClientSocialMenuKeyboard(client) });
  return text;
}

async function sendClientContactMenu(chatId: string, client: ClientRecord) {
  userStates[chatId] = { step: 'idle' };
  const c = client.contact;
  const msg = `📞 <b>সরাসরি যোগাযোগ সেটিংস:</b>\n\n`
    + `📱 <b>WhatsApp নম্বর:</b> <code>${escapeHtml(c.whatsappNumber)}</code>\n`
    + `💬 <b>WhatsApp বার্তা:</b> <code>${escapeHtml(c.whatsappMessage)}</code>\n`
    + `✉️ <b>ইমেইল:</b> <code>${escapeHtml(c.email)}</code>\n`
    + `📝 <b>কোট/বার্তা:</b> <i>"${escapeHtml(c.customNote)}"</i>\n\n`
    + `<i>কোনটি পরিবর্তন করবেন নির্বাচন করুন:</i>`;
  await sendTelegramMessage(chatId, msg, { reply_markup: getClientContactMenuKeyboard(client) });
  return msg;
}

async function sendClientLayoutThemeMainMenu(chatId: string, client: ClientRecord) {
  userStates[chatId] = { step: 'idle' };
  const text = `🎨 <b>লেআউট & থিম কন্ট্রোল প্যানেল:</b>\n\n`
    + `নিচের অপশন থেকে বেছে নিন:\n\n`
    + `১️⃣ <b>📐 লেআউট</b>: সেকশনসমূহের ক্রম (সোশ্যাল আগে নাকি সার্ভিস আগে) পরিবর্তন করতে।\n\n`
    + `২️⃣ <b>🎨 থিম</b>: কালার থিম ও ভিজ্যুয়াল স্টাইল (Classic Dark, Dark Glass, Cyberpunk, Organic, Pop Art) পরিবর্তন করতে।`;
  await sendTelegramMessage(chatId, text, { reply_markup: getClientLayoutThemeSubMenuKeyboard(client) });
  return text;
}

async function sendClientLayoutOnlyMenu(chatId: string, client: ClientRecord) {
  userStates[chatId] = { step: 'idle' };
  const isServicesFirst = client.layoutStyle === 'services_first';
  const text = `📐 <b>ওয়েবসাইটের সেকশন লেআউট সাজানো:</b>\n\n`
    + `বর্তমান লেআউট: <b>${isServicesFirst ? '🛠️ সার্ভিস ও টুলস আগে' : '🌐 সোশ্যাল মিডিয়া আগে (অ্যাডমিন স্টাইল)'}</b>\n\n`
    + `<b>লেআউট অপশনসমূহ:</b>\n`
    + `১️⃣ <b>সোশ্যাল মিডিয়া আগে</b>: প্রোফাইল ➔ সোশ্যাল লিংক ➔ সার্ভিস সমূহ ➔ যোগাযোগ\n\n`
    + `২️⃣ <b>সার্ভিস ও টুলস আগে</b>: প্রোফাইল ➔ সার্ভিস সমূহ ➔ সোশ্যাল লিংক ➔ যোগাযোগ\n\n`
    + `<i>নিচের অপশন থেকে নির্বাচন করুন (লাইভ ওয়েবসাইটে সাথে সাথে পরিবর্তন হবে):</i>`;
  await sendTelegramMessage(chatId, text, { reply_markup: getClientLayoutOnlyKeyboard(client) });
  return text;
}

async function sendClientThemeOnlyMenu(chatId: string, client: ClientRecord) {
  userStates[chatId] = { step: 'idle' };
  const theme = client.themeStyle || 'shuvox_lightning_cyber';
  const themeName = theme === 'shuvox_lightning_cyber'
    ? '⚡ ১. শোভক্স লাইটনিং সাইবার ৩ডি (SHUVOX Lightning Cyber)'
    : theme === 'ultra_cyber_glass'
    ? '✨ ২. আল্ট্রা প্রিমিয়াম সাইবার গ্লাস (Ultra Cyber Glass 3D)'
    : theme === 'organic_nature'
    ? '🍃 ৩. অর্গানিক নেচার (Organic Nature)'
    : theme === 'bold_flat_popart'
    ? '💥 ৪. বোল্ড ফ্ল্যাট পপ আর্ট (Bold Flat Pop Art)'
    : '🕶️ ৫. ক্লাসিক ডার্ক (Classic Dark)';

  const text = `🎨 <b>ওয়েবসাইট কালার থিম নির্বাচন:</b>\n\n`
    + `বর্তমান থিম: <b>${themeName}</b>\n\n`
    + `<i>পছন্দের থিম বাটনে চাপুন (লাইভ ওয়েবসাইটে তাৎক্ষণিকভাবে সুন্দর নতুন রঙে বদলে যাবে):</i>`;
  await sendTelegramMessage(chatId, text, { reply_markup: getClientThemeOnlyKeyboard(client) });
  return text;
}

async function sendClientFullSummary(chatId: string, client: ClientRecord) {
  let text = `📊 <b>আপনার বায়ো ওয়েবসাইটের সম্পূর্ণ লাইভ কনফিগারেশন:</b>\n\n`;
  text += `👤 <b>প্রোফাইল:</b> <b>${escapeHtml(client.profile.name)}</b>\n`;
  text += `🔗 <b>হ্যান্ডেল:</b> <code>${escapeHtml(client.profile.handle)}</code>\n`;
  text += `💼 <b>পদবী:</b> ${escapeHtml(client.profile.title)}\n`;
  text += `📍 <b>লোকেশন:</b> ${escapeHtml(client.profile.location)}\n`;
  text += `📝 <b>বায়ো:</b> <i>"${escapeHtml(client.profile.bio)}"</i>\n\n`;

  text += `🏷️ <b>ব্যাজ সমূহ (${client.badges.length}টি):</b>\n`;
  client.badges.forEach((b, i) => {
    text += `${i + 1}. ${escapeHtml(b.text)}\n`;
  });

  text += `\n🌐 <b>সোশ্যাল মিডিয়া (${client.socialLinks.length}টি):</b>\n`;
  client.socialLinks.forEach(s => {
    const st = s.enabled !== false ? '🟢' : '⚪';
    text += `• ${st} <b>${escapeHtml(s.title)}</b>: ${escapeHtml(s.url)} [${escapeHtml(s.buttonText)}]\n`;
  });

  text += `\n📞 <b>যোগাযোগ:</b>\n`;
  text += `• WhatsApp: <code>${escapeHtml(client.contact.whatsappNumber)}</code>\n`;
  text += `• Email: <code>${escapeHtml(client.contact.email)}</code>\n`;

  text += `\n🛠️ <b>মোট সাভিস:</b> ${client.services.length} টি লাইভ\n`;
  text += `🎨 <b>লেআউট:</b> ${client.layoutStyle === 'services_first' ? 'সার্ভিস আগে' : 'সোশ্যাল আগে (Admin UI)'}\n`;

  await sendTelegramMessage(chatId, text, { reply_markup: getClientMainMenuKeyboard(client) });
}

async function handleClientUserMessage(chatId: string, text: string, senderName: string, client: ClientRecord) {
  const trimmed = text.trim();
  const state = userStates[chatId] || { step: 'idle' };
  const activeClient = resolveClientForChat(chatId, state.tempData?.clientId) || client || getClientByChatId(chatId);

  if (trimmed === '/start' || trimmed === '/help' || trimmed === '/status' || trimmed === '/menu' || trimmed.toLowerCase() === 'hi' || trimmed.toLowerCase() === 'hello') {
    userStates[chatId] = { step: 'idle' };
    const msg = `👋 আসসালামু আলাইকুম <b>${escapeHtml(client.profile.name)}</b>!\n\n`
      + `আপনার বায়ো ডাটা ওয়েবসাইটের <b>কন্ট্রোল প্যানেলে</b> স্বাগতম! 🚀\n\n`
      + `📊 <b>বর্তমান অবস্থা:</b>\n`
      + `• 👤 নাম: <b>${escapeHtml(client.profile.name)}</b> (<code>${escapeHtml(client.profile.handle)}</code>)\n`
      + `• 💻 পদবী: ${escapeHtml(client.profile.title)}\n`
      + `• 🛠️ মোট সাভিস: <b>${client.services.length}</b> টি লাইভ\n`
      + `• 🌐 সোশ্যাল লিংক: <b>${client.socialLinks.length}</b> টি সক্রিয়\n`
      + `• 🏷️ ব্যাজ: <b>${client.badges.length}</b> টি\n`
      + `• 📱 WhatsApp: <code>${escapeHtml(client.contact.whatsappNumber)}</code>\n`
      + `• ✉️ Email: <code>${escapeHtml(client.contact.email)}</code>\n\n`
      + `👇 <b>কী পরিবর্তন করতে চান নির্বাচন করুন:</b>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getClientMainMenuKeyboard(client) });
    return msg;
  }

  if (trimmed === '/cancel') {
    userStates[chatId] = { step: 'idle' };
    const msg = `🔙 <b>অপারেশন বাতিল করা হয়েছে!</b>\nপ্রধান মেন্যুতে ফিরে যাওয়া হলো।`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getClientMainMenuKeyboard(client) });
    return msg;
  }

  // Support button text / reply keyboard messages & quick commands
  if (state.step === 'idle') {
    if (trimmed === '/layout' || trimmed === '/theme' || trimmed.includes('লেআউট') || trimmed.includes('থিম') || trimmed.toLowerCase().includes('layout') || trimmed.toLowerCase().includes('theme')) {
      return await sendClientLayoutThemeMainMenu(chatId, client);
    }
    if (trimmed === '/profile' || trimmed.includes('প্রোফাইল') || trimmed.toLowerCase().includes('profile')) {
      return await sendClientProfileMenu(chatId, client);
    }
    if (trimmed === '/badges' || trimmed === '/badge' || trimmed.includes('ব্যাজ') || trimmed.toLowerCase().includes('badge')) {
      return await sendClientBadgesMenu(chatId, client);
    }
    if (trimmed === '/services' || trimmed === '/service' || trimmed.includes('সার্ভিস') || trimmed.includes('সাভিস') || trimmed.toLowerCase().includes('service')) {
      return await sendClientServicesMenu(chatId, client);
    }
    if (trimmed === '/social' || trimmed.includes('সোশ্যাল') || trimmed.toLowerCase().includes('social')) {
      return await sendClientSocialMenu(chatId, client);
    }
    if (trimmed === '/contact' || trimmed.includes('যোগাযোগ') || trimmed.toLowerCase().includes('contact')) {
      return await sendClientContactMenu(chatId, client);
    }
    if (trimmed === '/preview' || trimmed.includes('প্রিভিউ') || trimmed.includes('সামারি') || trimmed.toLowerCase().includes('preview') || trimmed.toLowerCase().includes('summary')) {
      return await sendClientFullSummary(chatId, client);
    }
  }

  // Quick Client Shortcuts
  if (trimmed.startsWith('/name ')) {
    const newName = trimmed.substring(6).trim();
    updateClientData(client.id, c => { c.profile.name = newName; });
    const reply = `✅ <b>নাম সফলভাবে পরিবর্তন হয়েছে!</b>\n\n⚡ <b>${escapeHtml(newName)}</b>\n<i>ওয়েবসাইটে সাথে সাথে আপডেট হয়েছে!</i>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientMainMenuKeyboard(client) });
    return reply;
  }

  if (trimmed.startsWith('/handle ')) {
    let newHandle = trimmed.substring(8).trim();
    if (!newHandle.startsWith('@')) newHandle = '@' + newHandle;
    updateClientData(client.id, c => { c.profile.handle = newHandle; });
    const reply = `✅ <b>ইউজারনেম / হ্যান্ডেল আপডেট হয়েছে!</b>\n\n🔗 <code>${escapeHtml(newHandle)}</code>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientMainMenuKeyboard(client) });
    return reply;
  }

  if (trimmed.startsWith('/title ')) {
    const newTitle = trimmed.substring(7).trim();
    updateClientData(client.id, c => { c.profile.title = newTitle; });
    const reply = `✅ <b>পদবী / টাইটেল আপডেট হয়েছে!</b>\n\n💻 <b>${escapeHtml(newTitle)}</b>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientMainMenuKeyboard(client) });
    return reply;
  }

  if (trimmed.startsWith('/bio ')) {
    const newBio = trimmed.substring(5).trim();
    updateClientData(client.id, c => { c.profile.bio = newBio; });
    const reply = `✅ <b>বায়ো বিবরণ সফলভাবে আপডেট হয়েছে!</b>\n\n📝 <i>"${escapeHtml(newBio)}"</i>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientMainMenuKeyboard(client) });
    return reply;
  }

  if (trimmed.startsWith('/wa ')) {
    const newWa = trimmed.substring(4).trim();
    updateClientData(client.id, c => { c.contact.whatsappNumber = newWa; });
    const reply = `✅ <b>হোয়াটসঅ্যাপ নম্বর আপডেট হয়েছে!</b>\n\n📱 <code>${escapeHtml(newWa)}</code>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientMainMenuKeyboard(client) });
    return reply;
  }

  if (trimmed.startsWith('/email ')) {
    const newEmail = trimmed.substring(7).trim();
    updateClientData(client.id, c => { c.contact.email = newEmail; });
    const reply = `✅ <b>ইমেইল সফলভাবে আপডেট হয়েছে!</b>\n\n✉️ <code>${escapeHtml(newEmail)}</code>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientMainMenuKeyboard(client) });
    return reply;
  }

  // Client Step Handlers
  if (state.step === 'client_prof_name') {
    updateClientData(activeClient.id, c => { c.profile.name = trimmed; });
    userStates[chatId] = { step: 'idle' };
    const reply = `✅ <b>প্রোফাইল নাম সফলভাবে আপডেট হয়েছে!</b>\n\n⚡ <b>${escapeHtml(trimmed)}</b>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientProfileMenuKeyboard(activeClient) });
    return reply;
  }

  if (state.step === 'client_prof_handle') {
    let cleanHandle = trimmed;
    if (!cleanHandle.startsWith('@')) cleanHandle = '@' + cleanHandle;
    updateClientData(activeClient.id, c => { c.profile.handle = cleanHandle; });
    userStates[chatId] = { step: 'idle' };
    const reply = `✅ <b>ইউজারনেম / হ্যান্ডেল আপডেট হয়েছে!</b>\n\n🔗 <code>${escapeHtml(cleanHandle)}</code>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientProfileMenuKeyboard(activeClient) });
    return reply;
  }

  if (state.step === 'client_prof_title') {
    updateClientData(activeClient.id, c => { c.profile.title = trimmed; });
    userStates[chatId] = { step: 'idle' };
    const reply = `✅ <b>পদবী / টাইটেল আপডেট হয়েছে!</b>\n\n💻 <b>${escapeHtml(trimmed)}</b>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientProfileMenuKeyboard(activeClient) });
    return reply;
  }

  if (state.step === 'client_prof_location') {
    updateClientData(activeClient.id, c => { c.profile.location = trimmed; });
    userStates[chatId] = { step: 'idle' };
    const reply = `✅ <b>লোকেশন আপডেট হয়েছে!</b>\n\n📍 <b>${escapeHtml(trimmed)}</b>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientProfileMenuKeyboard(activeClient) });
    return reply;
  }

  if (state.step === 'client_prof_bio') {
    updateClientData(activeClient.id, c => { c.profile.bio = trimmed; });
    userStates[chatId] = { step: 'idle' };
    const reply = `✅ <b>বায়ো বিবরণ আপডেট হয়েছে!</b>\n\n📝 <i>"${escapeHtml(trimmed)}"</i>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientProfileMenuKeyboard(activeClient) });
    return reply;
  }

  if (state.step === 'client_prof_avatar') {
    updateClientData(activeClient.id, c => { c.profile.avatarUrl = trimmed; });
    userStates[chatId] = { step: 'idle' };
    const reply = `✅ <b>প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!</b>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientProfileMenuKeyboard(activeClient) });
    return reply;
  }

  if (state.step === 'client_prof_banner') {
    if (isRemoveCommand(trimmed)) {
      updateClientData(activeClient.id, c => { c.profile.bannerUrl = ''; });
      userStates[chatId] = { step: 'idle' };
      const reply = `✅ <b>ব্যানার কভার ছবি সফলভাবে সরিয়ে ফেলা হয়েছে!</b>\n\n<i>ওয়েবসাইটে এখন ব্যানার ছবি ছাড়া ক্লিন ফাঁকা ডার্ক ব্যাকগ্রাউন্ড থাকবে।</i>`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getClientProfileMenuKeyboard(activeClient) });
      return reply;
    } else {
      updateClientData(activeClient.id, c => { c.profile.bannerUrl = trimmed; });
      userStates[chatId] = { step: 'idle' };
      const reply = `✅ <b>ব্যানার কভার ছবি সফলভাবে আপডেট হয়েছে!</b>`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getClientProfileMenuKeyboard(activeClient) });
      return reply;
    }
  }

  if (state.step === 'client_badge_add_text') {
    updateClientData(activeClient.id, c => {
      c.badges.push({ id: 'b_' + Date.now(), text: trimmed });
    });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const reply = `✅ <b>নতুন ব্যাজ যুক্ত হয়েছে!</b>\n\n🏷️ <b>${escapeHtml(trimmed)}</b>\n<i>মোট ব্যাজ: ${updated.badges.length}টি</i>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientBadgesMenuKeyboard(updated) });
    return reply;
  }

  // Client Service Wizard
  if (state.step === 'client_srv_title') {
    state.tempData = { ...state.tempData, title: trimmed };
    state.step = 'client_srv_subtitle';
    userStates[chatId] = state;
    const msg = `🏷️ <b>ধাপ ২/৪: সাব-টাইটেল বা ক্যাটাগরি লিখুন:</b>\n<i>(যেমন: 'ফটো ও মেমোরিজ' বা 'টুলস')</i>`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  if (state.step === 'client_srv_subtitle') {
    state.tempData = { ...state.tempData, subtitle: trimmed || 'ফটো ও মেমোরিজ' };
    state.step = 'client_srv_image';
    userStates[chatId] = state;
    const msg = `🖼️ <b>ধাপ ৩/৪: সাভিসের ছবির লিংক বা সরাসরি ফটো সেন্ড করুন:</b>`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  if (state.step === 'client_srv_image') {
    state.tempData = { ...state.tempData, imageUrl: trimmed };
    state.step = 'client_srv_link';
    userStates[chatId] = state;
    const msg = `🔗 <b>ধাপ ৪/৪: ক্লিক লিংক (Target URL):</b>\n\nসাভিসটিতে ক্লিক করলে কোন লিংকে যাবে?`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  if (state.step === 'client_srv_link') {
    const linkUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const newSrv = {
      id: 'cs_' + Date.now(),
      title: state.tempData?.title || 'New Service',
      subtitle: state.tempData?.subtitle || 'ফটো ও মেমোরিজ',
      imageUrl: state.tempData?.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10',
      linkUrl,
      createdAt: new Date().toISOString()
    };
    updateClientData(activeClient.id, c => { c.services.push(newSrv); });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const reply = `🎉 <b>নতুন সাভিস সফলভাবে যুক্ত হয়েছে!</b>\n\n📌 <b>নাম:</b> ${escapeHtml(newSrv.title)}\n🏷️ <b>ক্যাটাগরি:</b> ${escapeHtml(newSrv.subtitle)}\n🔗 <b>লিংক:</b> ${escapeHtml(newSrv.linkUrl)}\n\n<i>আপনার ওয়েবসাইটে লাইভ যুক্ত হয়েছে! (মোট: ${updated.services.length}টি)</i>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientServicesMenuKeyboard(updated) });
    return reply;
  }

  if (state.step === 'client_srv_edit_val') {
    const serviceId = state.tempData?.serviceId;
    const field = state.tempData?.field;
    updateClientData(activeClient.id, c => {
      const s = c.services.find(item => item.id === serviceId);
      if (s && field) {
        if (field === 'linkUrl' || field === 'lnk') s.linkUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        else if (field === 'title') s.title = trimmed;
        else if (field === 'subtitle' || field === 'sub') s.subtitle = trimmed;
        else if (field === 'imageUrl' || field === 'img') s.imageUrl = trimmed;
      }
    });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const reply = `✅ <b>সাভিস তথ্য সফলভাবে আপডেট হয়েছে!</b>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientServicesMenuKeyboard(updated) });
    return reply;
  }

  // Client Social Handlers
  if (state.step === 'client_social_url') {
    const linkId = state.tempData?.linkId;
    const isAdding = state.tempData?.isAdding;
    let url = trimmed;
    const platform = state.tempData?.platform || 'custom';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (platform === 'telegram') {
        url = 'https://t.me/' + url.replace(/^@/, '');
      } else {
        url = 'https://' + url;
      }
    }

    if (isAdding) {
      const title = state.tempData?.title || 'Social Profile';
      const subtitle = state.tempData?.subtitle || 'কানেক্ট থাকুন';
      const buttonText = state.tempData?.buttonText || 'যুক্ত হোন';
      const newSocial: SocialLink = {
        id: 'cl_' + Date.now(),
        platform: platform as SocialLink['platform'],
        title,
        url,
        subtitle,
        buttonText,
        enabled: true
      };
      updateClientData(activeClient.id, c => { c.socialLinks.push(newSocial); });
      userStates[chatId] = { step: 'idle' };
      const updated = getClientById(activeClient.id) || activeClient;
      const reply = `🎉 <b>নতুন সোশ্যাল লিঙ্ক সফলভাবে যুক্ত হয়েছে!</b>\n\n📌 <b>নাম:</b> ${escapeHtml(newSocial.title)}\n🔗 <b>লিংক:</b> ${escapeHtml(newSocial.url)}\n🏷️ <b>বিবরণ:</b> ${escapeHtml(newSocial.subtitle)}\n🔘 <b>বাটন:</b> [${escapeHtml(newSocial.buttonText)}]\n\n<i>আপনার ওয়েবসাইটে তাৎক্ষণিকভাবে লাইভ সিঙ্ক হয়ে গেছে!</i>`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getClientSingleSocialKeyboard(updated.id, newSocial.id, true) });
      return reply;
    } else {
      updateClientData(activeClient.id, c => {
        const l = c.socialLinks.find(item => item.id === linkId);
        if (l) l.url = url;
      });
      userStates[chatId] = { step: 'idle' };
      const updated = getClientById(activeClient.id) || activeClient;
      const l = updated.socialLinks.find(item => item.id === linkId);
      const reply = `✅ <b>সোশ্যাল লিংক সফলভাবে পরিবর্তন হয়েছে!</b>\n\n🔗 <b>নতুন লিংক:</b> ${escapeHtml(url)}`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getClientSingleSocialKeyboard(updated.id, linkId, l ? l.enabled !== false : true) });
      return reply;
    }
  }

  if (state.step === 'client_social_title') {
    const linkId = state.tempData?.linkId;
    updateClientData(activeClient.id, c => {
      const l = c.socialLinks.find(item => item.id === linkId);
      if (l) l.title = trimmed;
    });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const l = updated.socialLinks.find(item => item.id === linkId);
    const reply = `✅ <b>সোশ্যাল নাম/টাইটেল সফলভাবে আপডেট হয়েছে!</b>\n\n📌 <b>নতুন নাম:</b> ${escapeHtml(trimmed)}`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientSingleSocialKeyboard(updated.id, linkId, l ? l.enabled !== false : true) });
    return reply;
  }

  if (state.step === 'client_social_subtitle') {
    const linkId = state.tempData?.linkId;
    updateClientData(activeClient.id, c => {
      const l = c.socialLinks.find(item => item.id === linkId);
      if (l) l.subtitle = trimmed;
    });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const l = updated.socialLinks.find(item => item.id === linkId);
    const reply = `✅ <b>সাব-টাইটেল সফলভাবে আপডেট হয়েছে!</b>\n\n🏷️ <b>নতুন সাব-টাইটেল:</b> ${escapeHtml(trimmed)}`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientSingleSocialKeyboard(updated.id, linkId, l ? l.enabled !== false : true) });
    return reply;
  }

  if (state.step === 'client_social_button') {
    const linkId = state.tempData?.linkId;
    updateClientData(activeClient.id, c => {
      const l = c.socialLinks.find(item => item.id === linkId);
      if (l) l.buttonText = trimmed;
    });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const l = updated.socialLinks.find(item => item.id === linkId);
    const reply = `✅ <b>বাটন টেক্সট সফলভাবে আপডেট হয়েছে!</b>\n\n🔘 <b>নতুন বাটন:</b> [${escapeHtml(trimmed)}]`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientSingleSocialKeyboard(updated.id, linkId, l ? l.enabled !== false : true) });
    return reply;
  }

  // Client Contact Fields
  if (state.step === 'client_contact_wa') {
    updateClientData(activeClient.id, c => { c.contact.whatsappNumber = trimmed; });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const reply = `✅ <b>WhatsApp নম্বর আপডেট হয়েছে!</b>\n\n📱 <code>${escapeHtml(trimmed)}</code>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientContactMenuKeyboard(updated) });
    return reply;
  }

  if (state.step === 'client_contact_wa_msg') {
    updateClientData(activeClient.id, c => { c.contact.whatsappMessage = trimmed; });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const reply = `✅ <b>WhatsApp বার্তা আপডেট হয়েছে!</b>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientContactMenuKeyboard(updated) });
    return reply;
  }

  if (state.step === 'client_contact_email') {
    updateClientData(activeClient.id, c => { c.contact.email = trimmed; });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const reply = `✅ <b>ইমেইল আপডেট হয়েছে!</b>\n\n✉️ <code>${escapeHtml(trimmed)}</code>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientContactMenuKeyboard(updated) });
    return reply;
  }

  if (state.step === 'client_contact_note') {
    updateClientData(activeClient.id, c => { c.contact.customNote = trimmed; });
    userStates[chatId] = { step: 'idle' };
    const updated = getClientById(activeClient.id) || activeClient;
    const reply = `✅ <b>বার্তা/কোটেশন আপডেট হয়েছে!</b>\n\n📝 <i>"${escapeHtml(trimmed)}"</i>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getClientContactMenuKeyboard(updated) });
    return reply;
  }

  // Fallback for client
  const fallback = `❓ বুঝতে পারিনি। নিচের মেন্যু থেকে অপশন নির্বাচন করুন অথবা /menu লিখুন।`;
  await sendTelegramMessage(chatId, fallback, { reply_markup: getClientMainMenuKeyboard(client) });
  return fallback;
}

async function completeClientCreation(
  chatId: string,
  tempData: any,
  layoutStyle: 'social_first' | 'services_first',
  senderName: string
) {
  const newClient = createNewClient(
    tempData?.clientChatId,
    tempData?.appName || 'My Bio',
    tempData?.shortName || 'BIO DATA',
    tempData?.logoUrl,
    layoutStyle
  );

  const clients = getClients();
  clients.push(newClient);
  saveClients(clients);
  await syncClientToFirebase(newClient);

  userStates[chatId] = { step: 'idle' };
  addLog('add', senderName, `নতুন ক্লায়েন্ট তৈরি: ${newClient.appName} (${newClient.chatId})`);

  const layoutName = layoutStyle === 'services_first' ? '🛠️ সার্ভিস ও টুলস আগে' : '🌐 সোশ্যাল মিডিয়া আগে (অ্যাডমিন স্টাইল)';

  await sendTelegramMessage(
    chatId,
    `🎉 <b>অভিনন্দন! ক্লায়েন্ট সফলভাবে তৈরি এবং রেজিস্টার হয়েছে!</b> ✅\n\n`
    + `• 👤 <b>ক্লায়েন্ট Chat ID:</b> <code>${newClient.chatId}</code>\n`
    + `• 🏷️ <b>অ্যাপের নাম:</b> <b>${escapeHtml(newClient.appName)}</b>\n`
    + `• 📱 <b>PWA শর্ট নেম:</b> <code>${escapeHtml(newClient.shortName)}</code>\n`
    + `• 🎨 <b>লেআউট স্টাইল:</b> <b>${layoutName}</b>\n`
    + `• 🆔 <b>ক্লায়েন্ট আইডি:</b> <code>${newClient.id}</code>\n\n`
    + `📦 <b>এখন ক্লাইন্টের ৩টি কনফিগারেশন ফাইল তৈরি হচ্ছে এবং নিচে পাঠানো হচ্ছে...</b>`
  );

  await sendClientFilesToTelegram(chatId, newClient);
  return 'Client created successfully';
}

// Handle User Message Text
async function handleUserMessage(chatId: string, text: string, senderName: string = 'User') {
  try {
    const trimmed = text.trim();
    const state = userStates[chatId] || { step: 'idle' };

    const isAdmin = String(chatId).trim() === TELEGRAM_ADMIN_CHAT_ID;
    let registeredClient = getClientByChatId(chatId);

    // If active user state is a client step, route to handleClientUserMessage
    if (state.step && (state.step.startsWith('client_') || state.step.startsWith('cl_'))) {
      const targetClient = resolveClientForChat(chatId, state.tempData?.clientId) || registeredClient;
      if (targetClient) {
        return await handleClientUserMessage(chatId, text, senderName, targetClient);
      }
    }

    // If non-admin user or client, route directly to client handler
    if (!isAdmin && registeredClient) {
      return await handleClientUserMessage(chatId, text, senderName, registeredClient);
    }

    // If user is neither admin nor do we have any client records
    if (!isAdmin && !registeredClient) {
      const unknownMsg = `👋 আসসালামু আলাইকুম <b>${escapeHtml(senderName)}</b>!\n\n`
        + `এটি <b>বায়ো ডাটা ও সার্ভিস ম্যানেজার মাস্টার বট</b> 🤖\n\n`
        + `✨ আপনি যদি আপনার নিজের নাম ও লোগো দিয়ে নিজস্ব প্রফেশনাল বায়ো ডাটা ওয়েবসাইট তৈরি করতে চান অথবা আপনার ওয়েবসাইটের বট এক্সেস নিতে চান, তবে সরাসরি অ্যাডমিনের সাথে যোগাযোগ করুন:\n\n`
        + `👉 <b>টেলিগ্রাম ইনবক্স:</b> @djhakar007ff\n`
        + `📱 <b>WhatsApp:</b> +8801778526313\n`
        + `🌐 <b>অফিসিয়াল বায়ো সাইট:</b> https://androadappsdevelopershuvo.github.io/biodata.com`;
      await sendTelegramMessage(chatId, unknownMsg, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💬 টেলিগ্রামে অ্যাডমিনকে মেসেজ দিন', url: 'https://t.me/djhakar007ff' }],
            [{ text: '📱 WhatsApp এ যোগাযোগ করুন', url: 'https://wa.me/8801778526313' }],
            [{ text: '🌐 অফিসিয়াল বায়ো সাইট দেখুন', url: 'https://androadappsdevelopershuvo.github.io/biodata.com' }]
          ]
        }
      });
      return unknownMsg;
    }

  // ==========================================
  // MASTER ADMIN FLOWS (chat_id: 5440151107)
  // ==========================================

  // Admin Cancel Command
  if (trimmed === '/cancel') {
    userStates[chatId] = { step: 'idle' };
    const cancelMsg = `🔙 <b>অপারেশন বাতিল করা হয়েছে!</b>\nমাস্টার অ্যাডমিন মেন্যুতে ফিরে যাওয়া হলো।`;
    await sendTelegramMessage(chatId, cancelMsg, { reply_markup: getMainMenuKeyboard() });
    return cancelMsg;
  }

  // Admin Add Client Command: /newclient or /addclient
  if (trimmed === '/newclient' || trimmed === '/addclient') {
    userStates[chatId] = { step: 'admin_wizard_chatid', tempData: {} };
    const msg = `👤 <b>নতুন ক্লায়েন্ট তৈরি (ধাপ ১/৫): ক্লায়েন্টের Telegram Chat ID</b>\n\n`
      + `ক্লাইন্টের টেলিগ্রাম চ্যাট আইডিটি লিখে পাঠান:\n`
      + `<i>(ক্লাইন্ট টেলিগ্রামে @userinfobot এ স্টার্ট দিলে তার Chat ID পেয়ে যাবে, যেমন: <code>1234567890</code>)</i>\n\n`
      + `🔙 বাতিল করতে /cancel লিখুন`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  // Admin Clients List Command: /clients or /clientlist
  if (trimmed === '/clients' || trimmed === '/clientlist') {
    userStates[chatId] = { step: 'idle' };
    const clients = getClients();
    const msg = `📋 <b>নিবন্ধিত ক্লায়েন্ট তালিকা (${clients.length} জন):</b>\n\nযেকোনো ক্লায়েন্টের তথ্য দেখতে, ৩টি ফাইল ডাউনলোড করতে বা ডিলিট করতে নিচে নির্বাচন করুন:`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getAdminClientsListKeyboard() });
    return msg;
  }

  // Admin Wizard Step 1: Client Chat ID
  if (state.step === 'admin_wizard_chatid') {
    const rawId = trimmed.replace(/[^0-9-]/g, '');
    if (!rawId || rawId.length < 5) {
      const err = `❌ অনুগ্রহ করে সঠিক টেলিগ্রাম Chat ID দিন (যেমন: <code>1234567890</code>)\nবাতিল করতে /cancel লিখুন।`;
      await sendTelegramMessage(chatId, err);
      return err;
    }
    const existing = getClientByChatId(rawId);
    if (existing) {
      const err = `⚠️ এই Chat ID (<code>${rawId}</code>) দিয়ে ইতিমধ্যে ক্লায়েন্ট <b>${escapeHtml(existing.appName)}</b> নিবন্ধিত আছে!\n\nঅন্য Chat ID দিন অথবা /cancel লিখুন।`;
      await sendTelegramMessage(chatId, err);
      return err;
    }
    state.tempData = { clientChatId: rawId };
    state.step = 'admin_wizard_appname';
    userStates[chatId] = state;
    const msg = `🏷️ <b>ধাপ ২/৫: সাইট / অ্যাপের পূর্ণ নাম (App Full Name)</b>\n\n`
      + `ক্লাইন্টের বায়ো সাইটের নাম কী হবে? লিখে পাঠান:\n`
      + `<i>(যেমন: <code>Md Tamim - Bio Data</code> বা <code>শাকিব - অফিসিয়াল বায়ো</code>)</i>\n\n`
      + `🔙 বাতিল করতে /cancel লিখুন`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  // Admin Wizard Step 2: App Name
  if (state.step === 'admin_wizard_appname') {
    const appName = trimmed;
    if (!appName || appName.length < 2) {
      const err = `❌ অনুগ্রহ করে একটি নাম লিখুন (যেমন: <code>Md Tamim - Bio Data</code>)`;
      await sendTelegramMessage(chatId, err);
      return err;
    }
    state.tempData = { ...state.tempData, appName };
    state.step = 'admin_wizard_shortname';
    userStates[chatId] = state;
    const msg = `📱 <b>ধাপ ৩/৫: PWA শর্ট নেম (Short Name for Home Screen)</b>\n\n`
      + `মোবাইলের হোমস্ক্রিনে শর্টকাট আইকনের নিচে যে সংক্ষিপ্ত নাম দেখাবে তা লিখুন (১২ অক্ষরের মধ্যে):\n`
      + `<i>(যেমন: <code>TAMIM BIO</code> বা <code>SHAKIB APP</code>)</i>\n\n`
      + `🔙 বাতিল করতে /cancel লিখুন`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  // Admin Wizard Step 3: Short Name
  if (state.step === 'admin_wizard_shortname') {
    const shortName = (trimmed || 'BIO DATA').substring(0, 15).toUpperCase();
    state.tempData = { ...state.tempData, shortName };
    state.step = 'admin_wizard_logo';
    userStates[chatId] = state;
    const msg = `🖼️ <b>ধাপ ৪/৫: PWA অ্যাপ লোগো (App Icon / Logo)</b>\n\n`
      + `📷 ক্লাইন্টের পছন্দের লোগো বা ছবি সরাসরি এই চ্যাটে <b>ফটো হিসেবে সেন্ড করুন</b> অথবা ছবির <b>সরাসরি ওয়েব লিংক (Image URL)</b> লিখে পাঠান:\n\n`
      + `🔙 বাতিল করতে /cancel লিখুন`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  // Admin Wizard Step 4: Logo -> Advance to Step 5: Layout
  if (state.step === 'admin_wizard_logo') {
    const logoUrl = trimmed.startsWith('http')
      ? trimmed
      : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10';
    
    state.tempData = { ...state.tempData, logoUrl };
    state.step = 'admin_wizard_layout';
    userStates[chatId] = state;

    const msg = `🎨 <b>ধাপ ৫/৫: ক্লায়েন্ট ওয়েবসাইটের লেআউট স্টাইল নির্বাচন করুন</b>\n\n`
      + `ক্লায়েন্টের সাইটে কোন বিভাগটি আগে দেখাবে নির্বাচন করুন:\n\n`
      + `১️⃣ <b>সোশ্যাল মিডিয়া আগে (অ্যাডমিন স্টাইল - রিকমেন্ডেড ⭐)</b>\n`
      + `• সাজানোর ক্রম: প্রোফাইল ➔ <b>সোশ্যাল মিডিয়া</b> ➔ সার্ভিস ও টুলস ➔ যোগাযোগ\n`
      + `<i>(আপনার নিজস্ব মূল বায়ো সাইটে যেমন আছে)</i>\n\n`
      + `২️⃣ <b>সার্ভিস ও টুলস আগে (সার্ভিস স্টাইল)</b>\n`
      + `• সাজানোর ক্রম: প্রোফাইল ➔ <b>সার্ভিস ও টুলস</b> ➔ সোশ্যাল লিঙ্ক ➔ যোগাযোগ\n\n`
      + `👇 নিচের বাটনে চাপুন অথবা <b>1</b> বা <b>2</b> লিখে পাঠান:\n`
      + `<i>(নোট: পরবর্তীতে বট থেকে যেকোনো সময় এক ক্লিকে লেআউট পরিবর্তন করা যাবে)</i>`;

    await sendTelegramMessage(chatId, msg, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⭐ ১. সোশ্যাল আগে (Admin UI Style)', callback_data: 'admin_layout:social_first' }],
          [{ text: '🛠️ ২. সার্ভিস আগে (Services First)', callback_data: 'admin_layout:services_first' }],
          [{ text: '❌ বাতিল (/cancel)', callback_data: 'cmd_menu' }]
        ]
      }
    });
    return msg;
  }

  // Admin Wizard Step 5: Layout Style & Finish
  if (state.step === 'admin_wizard_layout') {
    let layoutStyle: 'social_first' | 'services_first' = 'social_first';
    if (trimmed === '2' || trimmed.includes('সার্ভিস') || trimmed.toLowerCase().includes('service')) {
      layoutStyle = 'services_first';
    }
    return await completeClientCreation(chatId, state.tempData, layoutStyle, senderName);
  }

  // Admin Broadcast Message Step
  if (state.step === 'admin_broadcast_msg') {
    const broadcastText = trimmed;
    if (!broadcastText) {
      const err = `❌ নোটিশ টেক্সট খালি রাখা যাবে না। অনুগ্রহ করে বার্তাটি লিখে পাঠান অথবা /cancel লিখুন।`;
      await sendTelegramMessage(chatId, err);
      return err;
    }

    userStates[chatId] = { step: 'idle' };
    const clients = getClients();
    let successCount = 0;
    let failCount = 0;

    await sendTelegramMessage(chatId, `⏳ <b>${clients.length} জন ক্লায়েন্টকে নোটিশ ব্রডকাস্ট করা হচ্ছে...</b>`);

    for (const c of clients) {
      if (c.chatId) {
        try {
          const clientNotice = `📢 <b>অফিসিয়াল নোটিশ / বার্তা:</b>\n\n${escapeHtml(broadcastText)}\n\n— <i>মাস্টার অ্যাডমিন</i>`;
          const res = await sendTelegramMessage(c.chatId, clientNotice);
          if (res && res.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (e) {
          failCount++;
        }
      }
    }

    addLog('add', senderName, `ক্লায়েন্ট নোটিশ ব্রডকাস্ট প্রেরণ (${successCount} জন সফল)`);

    const summaryMsg = `🎉 <b>ক্লায়েন্ট নোটিশ ব্রডকাস্ট সম্পন্ন হয়েছে!</b> ✅\n\n`
      + `• 👥 মোট ক্লায়েন্ট: <b>${clients.length}</b> জন\n`
      + `• 🟢 সফলভাবে প্রেরিত: <b>${successCount}</b> জন\n`
      + `• 🔴 ব্যর্থ / ব্লকড: <b>${failCount}</b> জন\n\n`
      + `📝 <b>প্রেরিত নোটিশ:</b>\n<i>"${escapeHtml(broadcastText)}"</i>`;

    await sendTelegramMessage(chatId, summaryMsg, { reply_markup: getMainMenuKeyboard() });
    return summaryMsg;
  }

  // Quick Command: /start or /help or /status
  if (trimmed === '/start' || trimmed === '/help' || trimmed === '/status' || trimmed === '/broadcast' || trimmed === '/notice' || trimmed.toLowerCase() === 'hi' || trimmed.toLowerCase() === 'hello') {
    if (trimmed === '/broadcast' || trimmed === '/notice') {
      userStates[chatId] = { step: 'admin_broadcast_msg' };
      const clients = getClients();
      const msg = `📢 <b>সকল নিবন্ধিত ক্লায়েন্টকে বার্তা / নোটিশ পাঠান (Broadcast Notice)</b>\n\n`
        + `• নিবন্ধিত ক্লায়েন্ট সংখ্যা: <b>${clients.length}</b> জন\n\n`
        + `✍️ ক্লায়েন্টদের জন্য আপনার নোটিশ বা ঘোষণা বার্তাটি লিখে পাঠান। এই বার্তাটি স্বয়ংক্রিয়ভাবে সকল নিবন্ধিত ক্লায়েন্টের টেলিগ্রাম ইনবক্সে পৌঁছে যাবে:\n\n`
        + `🔙 বাতিল করতে /cancel লিখুন।`;
      await sendTelegramMessage(chatId, msg);
      return msg;
    }
    userStates[chatId] = { step: 'idle' };
    addLog('start', senderName, '/start কমান্ড রান করা হয়েছে');
    
    const profile = getProfileInfo();
    const services = getServices();
    const social = getSocialLinks();
    const badges = getBadges();
    const contact = getContactInfo();
    const fbCfg = getFirebaseConfig();
    const clients = getClients();

    const fbStatus = fbCfg.url ? `🟢 যুক্ত আছে (<code>${escapeHtml(fbCfg.url)}</code>)` : '⚪ যুক্ত নেই';

    const msg = `👑 আসসালামু আলাইকুম <b>${escapeHtml(profile.name)}</b>!\n\n`
      + `আপনার বায়ো ডাটা এবং ক্লায়েন্ট রিসেলার <b>মাস্টার কন্ট্রোল প্যানেলে</b> স্বাগতম! 🚀\n\n`
      + `📊 <b>বর্তমান লাইভ পরিসংখ্যান:</b>\n`
      + `• 👥 মোট ক্লায়েন্ট: <b>${clients.length}</b> জন\n`
      + `• 👤 আপনার নাম: <b>${escapeHtml(profile.name)}</b> (<code>${escapeHtml(profile.handle)}</code>)\n`
      + `• 💻 পদবী: ${escapeHtml(profile.title)}\n`
      + `• 🛠️ আপনার নিজস্ব সাভিস: <b>${services.length}</b> টি লাইভ\n`
      + `• 🌐 সোশ্যাল লিংক: <b>${social.length}</b> টি সক্রিয়\n`
      + `• 🏷️ ব্যাজ: <b>${badges.length}</b> টি\n`
      + `• 📱 WhatsApp: <code>${escapeHtml(contact.whatsappNumber)}</code>\n`
      + `• 🔥 Firebase Realtime DB: ${fbStatus}\n\n`
      + `👇 <b>কী করতে চান নির্বাচন করুন:</b>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getMainMenuKeyboard() });
    return msg;
  }

  // Webhook commands: /webhook or /setwebhook [url]
  if (trimmed === '/webhook' || trimmed === '/setwebhook' || trimmed.startsWith('/setwebhook ')) {
    const rawUrl = trimmed.replace(/^\/setwebhook\s*/, '').trim();
    if (rawUrl && rawUrl !== '/webhook') {
      const res = await setTelegramWebhook(rawUrl);
      if (res.ok) {
        const msg = `🎉 <b>Telegram Webhook সফলভাবে চালু হয়েছে!</b> ✅\n\n🌐 <b>Webhook URL:</b>\n<code>${escapeHtml(res.url || '')}</code>\n\n⚡ এখন থেকে আপনার বট ২৪/৭ কোনো প্রকার ডাউনলোড বা অফলাইন হওয়া ছাড়াই লাইভ কাজ করবে!`;
        await sendTelegramMessage(chatId, msg, { reply_markup: getMainMenuKeyboard() });
        return msg;
      } else {
        const err = `❌ Webhook সেট করতে সমস্যা হয়েছে: ${escapeHtml(JSON.stringify(res.error || res.result))}`;
        await sendTelegramMessage(chatId, err);
        return err;
      }
    } else {
      const infoRes = await getTelegramWebhookStatus();
      const info = infoRes.result || {};
      const statusText = info.url ? `🟢 <b>অন আছে</b>\n<code>${escapeHtml(info.url)}</code>` : `⚪ <b>বন্ধ (Long Polling চালু আছে)</b>`;
      const pending = info.pending_update_count || 0;
      const lastErr = info.last_error_message ? `\n⚠️ <b>সর্বশেষ এরর:</b> <i>${escapeHtml(info.last_error_message)}</i>` : '';

      const msg = `🌐 <b>Telegram Webhook স্ট্যাটাস & কন্ট্রোল:</b>\n\n`
        + `• <b>Webhook স্ট্যাটাস:</b> ${statusText}\n`
        + `• <b>পেন্ডিং রিকোয়েস্ট:</b> ${pending} টি${lastErr}\n\n`
        + `👇 <b>কী করতে চান?</b>\n`
        + `• যেকোনো সিকিউরড হোস্টিং লিঙ্কে Webhook সেট করতে লিখুন:\n<code>/setwebhook https://your-domain.com</code>`;

      await sendTelegramMessage(chatId, msg, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⚡ বর্তমান সাইটের সাথে Auto Webhook অন করুন', callback_data: 'admin_btn_autowebhook' }],
            [{ text: '🔄 Long Polling-এ ফিরিয়ে আনুন', callback_data: 'admin_btn_delwebhook' }],
            [{ text: '🔙 প্রধান মেন্যু', callback_data: 'cmd_menu' }]
          ]
        }
      });
      return msg;
    }
  }

  // Connect Firebase: /firebase [url] or /setfirebase [url]
  if (trimmed.startsWith('/firebase ') || trimmed.startsWith('/setfirebase ')) {
    const rawUrl = trimmed.replace(/^\/(firebase|setfirebase)\s+/, '').trim();
    if (rawUrl.startsWith('http')) {
      saveFirebaseConfig(rawUrl);
      addLog('edit', senderName, `Firebase URL যুক্ত করা হয়েছে: ${rawUrl}`);
      const reply = `🎉 <b>Firebase Realtime Database সফলভাবে যুক্ত হয়েছে!</b> ✅\n\n🔗 <b>URL:</b> <code>${escapeHtml(rawUrl)}</code>\n\nসমস্ত সাভিস, প্রোফাইল ও সোশ্যাল লিঙ্ক স্বয়ংক্রিয়ভাবে ফায়ারবেসে সিঙ্ক হয়ে গেছে। এখন GitHub Pages-এর সাথে 24/7 লাইভ আপডেট কাজ করবে! 🚀`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getMainMenuKeyboard() });
      return reply;
    } else {
      const err = `❌ অনুগ্রহ করে সঠিক Firebase Realtime Database URL দিন।\n(উদাহরণ: <code>/firebase https://my-project-default-rtdb.firebaseio.com</code>)`;
      await sendTelegramMessage(chatId, err);
      return err;
    }
  }

  // Quick Command: /social
  if (trimmed === '/social') {
    userStates[chatId] = { step: 'idle' };
    const msg = `🌐 <b>সোশ্যাল মিডিয়া প্ল্যাটফর্ম ও লিংক ম্যানেজমেন্ট</b>\n\nযেকোনো সোশ্যাল অ্যাকাউন্টের লিংক, নাম বা বাটন টেক্সট পরিবর্তন করতে নিচের তালিকা থেকে নির্বাচন করুন:`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getSocialMenuKeyboard() });
    return msg;
  }

  // Quick Command: /profile
  if (trimmed === '/profile') {
    userStates[chatId] = { step: 'idle' };
    const msg = getProfileDetailsText();
    await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
    return msg;
  }

  // Quick Command: /badges or /badge
  if (trimmed === '/badges' || trimmed === '/badge') {
    userStates[chatId] = { step: 'idle' };
    const badges = getBadges();
    let msg = `🏷️ <b>ব্যাজ সমূহ (Badges):</b>\n\nমোট <b>${badges.length}</b> টি সক্রিয় ব্যাজ রয়েছে:\n\n`;
    badges.forEach((b, i) => {
      msg += `• <b>${i + 1}.</b> ${escapeHtml(b.text)}\n`;
    });
    msg += `\n<i>নতুন ব্যাজ যোগ করতে বা মুছতে নিচের অপশন ব্যবহার করুন:</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getBadgesMenuKeyboard() });
    return msg;
  }

  // Quick Profile Commands:
  if (trimmed.startsWith('/name ')) {
    const newName = trimmed.substring(6).trim();
    const prof = getProfileInfo();
    prof.name = newName;
    saveProfileInfo(prof);
    addLog('edit', senderName, `প্রোফাইল নাম পরিবর্তন: ${newName}`);
    const reply = `✅ <b>প্রোফাইলের নাম পরিবর্তন সম্পন্ন!</b>\n\n⚡ <b>নাম:</b> <b>${escapeHtml(newName)}</b>\n\n<i>ওয়েবসাইটে সাথে সাথে আপডেট হয়েছে!</i>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getProfileMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/handle ')) {
    let newHandle = trimmed.substring(8).trim();
    if (!newHandle.startsWith('@')) newHandle = '@' + newHandle;
    const prof = getProfileInfo();
    prof.handle = newHandle;
    saveProfileInfo(prof);
    addLog('edit', senderName, `হ্যান্ডেল পরিবর্তন: ${newHandle}`);
    const reply = `✅ <b>ইউজারনেম / হ্যান্ডেল পরিবর্তন সম্পন্ন!</b>\n\n🔗 <code>${escapeHtml(newHandle)}</code>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getProfileMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/title ')) {
    const newTitle = trimmed.substring(7).trim();
    const prof = getProfileInfo();
    prof.title = newTitle;
    saveProfileInfo(prof);
    addLog('edit', senderName, `পদবী / টাইটেল পরিবর্তন: ${newTitle}`);
    const reply = `✅ <b>পদবী / টাইটেল পরিবর্তন সম্পন্ন!</b>\n\n💻 <b>${escapeHtml(newTitle)}</b>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getProfileMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/loc ') || trimmed.startsWith('/location ')) {
    const newLoc = trimmed.replace(/^\/(loc|location)\s+/, '').trim();
    const prof = getProfileInfo();
    prof.location = newLoc;
    saveProfileInfo(prof);
    addLog('edit', senderName, `লোকেশন পরিবর্তন: ${newLoc}`);
    const reply = `✅ <b>লোকেশন পরিবর্তন সম্পন্ন!</b>\n\n📍 <b>${escapeHtml(newLoc)}</b>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getProfileMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/bio ')) {
    const newBio = trimmed.substring(5).trim();
    const prof = getProfileInfo();
    prof.bio = newBio;
    saveProfileInfo(prof);
    addLog('edit', senderName, `বায়ো বিবরণ পরিবর্তন`);
    const reply = `✅ <b>বায়ো বিবরণ পরিবর্তন সম্পন্ন!</b>\n\n📝 <i>"${escapeHtml(newBio)}"</i>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getProfileMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/avatar ')) {
    const newAvatar = trimmed.substring(8).trim();
    const prof = getProfileInfo();
    prof.avatarUrl = newAvatar;
    saveProfileInfo(prof);
    addLog('edit', senderName, `প্রোফাইল ছবি পরিবর্তন`);
    const reply = `✅ <b>প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!</b>\n\n👤 <a href="${escapeHtml(newAvatar)}">নতুন ছবি দেখুন</a>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getProfileMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/banner ')) {
    const newBanner = trimmed.substring(8).trim();
    const prof = getProfileInfo();
    prof.bannerUrl = newBanner;
    saveProfileInfo(prof);
    addLog('edit', senderName, `ব্যানার ছবি পরিবর্তন`);
    const reply = `✅ <b>ব্যানার ছবি সফলভাবে আপডেট হয়েছে!</b>\n\n🏞️ <a href="${escapeHtml(newBanner)}">নতুন ব্যানার দেখুন</a>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getProfileMenuKeyboard() });
    return reply;
  }

  // Quick Badge Commands:
  if (trimmed.startsWith('/addbadge ')) {
    const badgeText = trimmed.substring(10).trim();
    const badges = getBadges();
    const newBadge: BadgeItem = {
      id: 'b_' + Date.now(),
      text: badgeText
    };
    badges.push(newBadge);
    saveBadges(badges);
    addLog('add', senderName, `নতুন ব্যাজ যোগ: ${badgeText}`);
    const reply = `✅ <b>নতুন ব্যাজ সফলভাবে যুক্ত হয়েছে!</b>\n\n🏷️ <b>${escapeHtml(badgeText)}</b>\n\n<i>মোট ব্যাজ: ${badges.length}টি</i>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getBadgesMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/delbadge ')) {
    const query = trimmed.substring(10).trim();
    const badges = getBadges();
    let index = parseInt(query, 10) - 1;
    let target = isNaN(index) ? badges.find(b => b.text.toLowerCase().includes(query.toLowerCase()) || b.id === query) : badges[index];
    if (target) {
      const filtered = badges.filter(b => b.id !== target!.id);
      saveBadges(filtered);
      addLog('delete', senderName, `ব্যাজ মুছে ফেলা হয়েছে: ${target.text}`);
      const reply = `🗑️ <b>'${escapeHtml(target.text)}' ব্যাজটি মুছে ফেলা হয়েছে!</b>`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getBadgesMenuKeyboard() });
      return reply;
    } else {
      const reply = `❌ ব্যাজ খুঁজে পাওয়া যায়নি!`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getBadgesMenuKeyboard() });
      return reply;
    }
  }

  // Quick Command: /addsocial
  if (trimmed.startsWith('/addsocial ') || trimmed.startsWith('/addsoc ')) {
    const rawContent = trimmed.replace(/^\/(addsocial|addsoc)\s+/, '').trim();
    const parts = rawContent.split('|').map(p => p.trim());
    let title = 'Social Link';
    let url = parts[0];
    let buttonText = 'যুক্ত হোন';
    let subtitle = 'সোশ্যাল প্ল্যাটফর্ম';

    if (parts.length >= 2) {
      title = parts[0];
      url = parts[1];
      if (parts[2]) buttonText = parts[2];
      if (parts[3]) subtitle = parts[3];
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let platform: SocialLink['platform'] = 'custom';
    if (url.includes('facebook.com') || url.includes('fb.com')) {
      platform = 'facebook';
      if (title === 'Social Link') title = 'Facebook Profile / Page';
    } else if (url.includes('t.me') || url.includes('telegram')) {
      platform = 'telegram';
      if (title === 'Social Link') title = 'Telegram Channel / Inbox';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'youtube';
      if (title === 'Social Link') title = 'YouTube Channel';
      if (buttonText === 'যুক্ত হোন') buttonText = 'সাবস্ক্রাইব';
    } else if (url.includes('instagram.com')) {
      platform = 'instagram';
      if (title === 'Social Link') title = 'Instagram Profile';
      if (buttonText === 'যুক্ত হোন') buttonText = 'ফলো করুন';
    } else if (url.includes('x.com') || url.includes('twitter.com')) {
      platform = 'twitter';
      if (title === 'Social Link') title = 'X (Twitter) Profile';
      if (buttonText === 'যুক্ত হোন') buttonText = 'ফলো করুন';
    } else if (url.includes('github.com')) {
      platform = 'github';
      if (title === 'Social Link') title = 'GitHub Profile';
      if (buttonText === 'যুক্ত হোন') buttonText = 'ফলো করুন';
    }

    const links = getSocialLinks();
    const newLink: SocialLink = {
      id: 's_' + Date.now(),
      platform,
      title,
      url,
      subtitle,
      buttonText,
      enabled: true
    };
    links.push(newLink);
    saveSocialLinks(links);
    addLog('add', senderName, `নতুন সোশ্যাল লিঙ্ক যোগ: ${title}`);
    const reply = `🎉 <b>নতুন সোশ্যাল লিঙ্ক সফলভাবে যোগ করা হয়েছে!</b>\n\n📌 <b>নাম:</b> ${escapeHtml(title)}\n🔗 <b>লিংক:</b> ${escapeHtml(url)}\n🏷️ <b>সাব-টাইটেল:</b> ${escapeHtml(subtitle)}\n🔘 <b>বাটন:</b> [${escapeHtml(buttonText)}]`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
    return reply;
  }

  // Quick Command: /contact
  if (trimmed === '/contact') {
    userStates[chatId] = { step: 'idle' };
    const contact = getContactInfo();
    const msg = `📞 <b>সরাসরি যোগাযোগ সেটিংস:</b>\n\n📱 <b>WhatsApp নম্বর:</b> <code>${escapeHtml(contact.whatsappNumber)}</code>\n💬 <b>মেসেজ:</b> <code>${escapeHtml(contact.whatsappMessage)}</code>\n✉️ <b>ইমেইল:</b> <code>${escapeHtml(contact.email)}</code>\n📝 <b>কোট:</b> <i>"${escapeHtml(contact.customNote)}"</i>\n\n<i>কোন তথ্যটি পরিবর্তন করতে চান?</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getContactMenuKeyboard() });
    return msg;
  }

  // Quick Direct Social Commands:
  if (trimmed.startsWith('/fb ')) {
    const newUrl = trimmed.substring(4).trim();
    const links = getSocialLinks();
    let fb = links.find(l => l.platform === 'facebook');
    const finalUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    if (fb) {
      fb.url = finalUrl;
    } else {
      fb = {
        id: 's_fb_' + Date.now(),
        platform: 'facebook',
        title: 'Facebook Profile / Page',
        url: finalUrl,
        subtitle: 'অফিসিয়াল ফেসবুক প্রোফাইল',
        buttonText: 'যুক্ত হোন',
        enabled: true
      };
      links.push(fb);
    }
    saveSocialLinks(links);
    addLog('edit', senderName, `ফেসবুক লিংক আপডেট: ${finalUrl}`);
    const reply = `✅ <b>ফেসবুক লিংক সফলভাবে আপডেট হয়েছে!</b>\n\n🔗 ${escapeHtml(finalUrl)}`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/wa ')) {
    const newWa = trimmed.substring(4).trim();
    const contact = getContactInfo();
    contact.whatsappNumber = newWa;
    saveContactInfo(contact);
    addLog('edit', senderName, `WhatsApp নম্বর আপডেট: ${newWa}`);
    const reply = `✅ <b>হোয়াটসঅ্যাপ নম্বর সফলভাবে আপডেট হয়েছে!</b>\n\n📱 <code>${escapeHtml(newWa)}</code>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getContactMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/email ')) {
    const newEmail = trimmed.substring(7).trim();
    const contact = getContactInfo();
    contact.email = newEmail;
    saveContactInfo(contact);
    addLog('edit', senderName, `ইমেইল আপডেট: ${newEmail}`);
    const reply = `✅ <b>ইমেইল সফলভাবে আপডেট হয়েছে!</b>\n\n✉️ <code>${escapeHtml(newEmail)}</code>`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getContactMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/tg ')) {
    const newUrl = trimmed.substring(4).trim();
    const links = getSocialLinks();
    let tg = links.find(l => l.platform === 'telegram');
    const finalUrl = newUrl.startsWith('http') ? newUrl : `https://t.me/${newUrl.replace(/^@/, '')}`;
    if (tg) {
      tg.url = finalUrl;
    } else {
      tg = {
        id: 's_tg_' + Date.now(),
        platform: 'telegram',
        title: 'Telegram Channel / Inbox',
        url: finalUrl,
        subtitle: 'টেলিগ্রাম মেসেজ ইনবক্স',
        buttonText: 'যুক্ত হোন',
        enabled: true
      };
      links.push(tg);
    }
    saveSocialLinks(links);
    addLog('edit', senderName, `টেলিগ্রাম লিংক আপডেট: ${finalUrl}`);
    const reply = `✅ <b>টেলিগ্রাম লিংক সফলভাবে আপডেট হয়েছে!</b>\n\n🔗 ${escapeHtml(finalUrl)}`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/yt ')) {
    const newUrl = trimmed.substring(4).trim();
    const links = getSocialLinks();
    let yt = links.find(l => l.platform === 'youtube');
    const finalUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    if (yt) {
      yt.url = finalUrl;
    } else {
      yt = {
        id: 's_yt_' + Date.now(),
        platform: 'youtube',
        title: 'YouTube Channel',
        url: finalUrl,
        subtitle: 'অফিসিয়াল ইউটিউব চ্যানেল',
        buttonText: 'সাবস্ক্রাইব',
        enabled: true
      };
      links.push(yt);
    }
    saveSocialLinks(links);
    addLog('edit', senderName, `ইউটিউব লিংক আপডেট: ${finalUrl}`);
    const reply = `✅ <b>ইউটিউব চ্যানেল লিংক আপডেট হয়েছে!</b>\n\n🔗 ${escapeHtml(finalUrl)}`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/insta ')) {
    const newUrl = trimmed.substring(7).trim();
    const links = getSocialLinks();
    let insta = links.find(l => l.platform === 'instagram');
    const finalUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    if (insta) {
      insta.url = finalUrl;
    } else {
      insta = {
        id: 's_insta_' + Date.now(),
        platform: 'instagram',
        title: 'Instagram Photos & Reels',
        url: finalUrl,
        subtitle: 'ইনস্টাগ্রাম ফটো ও রিলস',
        buttonText: 'ফলো করুন',
        enabled: true
      };
      links.push(insta);
    }
    saveSocialLinks(links);
    addLog('edit', senderName, `ইনস্টাগ্রাম লিংক আপডেট: ${finalUrl}`);
    const reply = `✅ <b>ইনস্টাগ্রাম লিংক আপডেট হয়েছে!</b>\n\n🔗 ${escapeHtml(finalUrl)}`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
    return reply;
  }

  if (trimmed.startsWith('/x ')) {
    const newUrl = trimmed.substring(3).trim();
    const links = getSocialLinks();
    let xLink = links.find(l => l.platform === 'twitter');
    const finalUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    if (xLink) {
      xLink.url = finalUrl;
    } else {
      xLink = {
        id: 's_x_' + Date.now(),
        platform: 'twitter',
        title: 'X (Twitter) Profile',
        url: finalUrl,
        subtitle: '乂 প্রোফাইল',
        buttonText: 'ফলো করুন',
        enabled: true
      };
      links.push(xLink);
    }
    saveSocialLinks(links);
    addLog('edit', senderName, `X (টুইটার) লিংক আপডেট: ${finalUrl}`);
    const reply = `✅ <b>X (টুইটার) লিংক আপডেট হয়েছে!</b>\n\n🔗 ${escapeHtml(finalUrl)}`;
    await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
    return reply;
  }

  // Quick Command: /services
  if (trimmed === '/services' || trimmed === '/service') {
    userStates[chatId] = { step: 'idle' };
    const msg = `🛠️ <b>সাভিস ম্যানেজমেন্ট</b>\n\nআপনার হাইলাইটস ও মোমেন্টসের সাভিস কার্ডসমূহ পরিচালনা করতে নির্বাচন করুন:`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getServicesMenuKeyboard() });
    return msg;
  }

  // Services commands
  if (trimmed === '/list') {
    return await handleListCommand(chatId);
  }

  if (trimmed === '/add') {
    userStates[chatId] = { step: 'add_title', tempData: {} };
    const msg = `➕ <b>নতুন সাভিস যোগ করুন (ধাপ ১/৪)</b>\n\n📌 অনুগ্রহ করে সাভিসের নাম (Title) লিখুন:`;
    await sendTelegramMessage(chatId, msg, {
      reply_markup: { inline_keyboard: [[{ text: '❌ বাতিল', callback_data: 'cmd_menu' }]] }
    });
    return msg;
  }

  if (trimmed.startsWith('/add ')) {
    const rawContent = trimmed.substring(5).trim();
    const parts = rawContent.split('|').map(p => p.trim());
    if (parts.length >= 2) {
      const title = parts[0];
      const imageUrl = parts[1] || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10';
      const linkUrl = parts[2] || 'https://androadappsdevelopershuvo.github.io/biodata.com';
      const subtitle = parts[3] || 'ফটো ও মেমোরিজ';

      const services = getServices();
      const newService: HighlightService = {
        id: 'h_' + Date.now() + Math.random().toString(36).substring(2, 6),
        title,
        subtitle,
        imageUrl,
        linkUrl,
        createdAt: new Date().toISOString()
      };
      services.push(newService);
      saveServices(services);
      addLog('add', senderName, `সরাসরি কমান্ডে সাভিস যোগ: ${title} (ক্রমিক: ${services.length})`, title);

      const reply = `✅ <b>সাভিস সফলভাবে যোগ করা হয়েছে!</b>\n\n🔢 <b>ক্রমিক নং:</b> #${services.length} (১২ এর পর ${services.length} নং)\n📌 <b>নাম:</b> ${escapeHtml(title)}\n🏷️ <b>ক্যাটাগরি:</b> ${escapeHtml(subtitle)}\n🔗 <b>লিংক:</b> ${escapeHtml(linkUrl)}`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getServicesMenuKeyboard() });
      return reply;
    }
  }

  if (trimmed === '/edit') {
    return await handleEditCommand(chatId);
  }

  if (trimmed === '/delete') {
    return await handleDeleteCommand(chatId);
  }

  // ==========================================
  // STATE MACHINE FOR TEXT RESPONSES
  // ==========================================

  // Edit Social URL
  if (state.step === 'edit_social_url') {
    const linkId = state.tempData?.linkId;
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);
    if (link) {
      let clean = trimmed;
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = link.platform === 'telegram' ? `https://t.me/${clean.replace(/^@/, '')}` : `https://${clean}`;
      }
      link.url = clean;
      saveSocialLinks(links);
      addLog('edit', senderName, `${link.title} লিংক আপডেট: ${link.url}`);
      userStates[chatId] = { step: 'idle' };
      const msg = `✅ <b>${escapeHtml(link.title)} এর লিংক সফলভাবে আপডেট হয়েছে!</b>\n\n🔗 <b>নতুন লিংক:</b> ${escapeHtml(link.url)}\n\n<i>ওয়েবসাইটে তাৎক্ষণিকভাবে লাইভ আপডেট সম্পন্ন হয়েছে!</i>`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getSingleSocialKeyboard(link.id, link.enabled) });
      return msg;
    }
  }

  // Edit Social Title
  if (state.step === 'edit_social_title') {
    const linkId = state.tempData?.linkId;
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);
    if (link) {
      link.title = trimmed;
      saveSocialLinks(links);
      addLog('edit', senderName, `সোশ্যাল টাইটেল আপডেট: ${link.title}`);
      userStates[chatId] = { step: 'idle' };
      const msg = `✅ <b>টাইটেল সফলভাবে পরিবর্তন হয়েছে:</b>\n\n📌 "${escapeHtml(link.title)}"`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getSingleSocialKeyboard(link.id, link.enabled) });
      return msg;
    }
  }

  // Edit Social Subtitle
  if (state.step === 'edit_social_subtitle') {
    const linkId = state.tempData?.linkId;
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);
    if (link) {
      link.subtitle = trimmed;
      saveSocialLinks(links);
      addLog('edit', senderName, `${link.title} সাব-টাইটেল আপডেট: ${link.subtitle}`);
      userStates[chatId] = { step: 'idle' };
      const msg = `✅ <b>সাব-টাইটেল সফলভাবে পরিবর্তন হয়েছে:</b>\n\n🏷️ "${escapeHtml(link.subtitle)}"`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getSingleSocialKeyboard(link.id, link.enabled) });
      return msg;
    }
  }

  // Edit Social Button Text
  if (state.step === 'edit_social_button') {
    const linkId = state.tempData?.linkId;
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);
    if (link) {
      link.buttonText = trimmed;
      saveSocialLinks(links);
      addLog('edit', senderName, `${link.title} বাটন টেক্সট আপডেট: ${link.buttonText}`);
      userStates[chatId] = { step: 'idle' };
      const msg = `✅ <b>বাটন টেক্সট সফলভাবে পরিবর্তন হয়েছে:</b>\n\n🔘 [${escapeHtml(link.buttonText)}]`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getSingleSocialKeyboard(link.id, link.enabled) });
      return msg;
    }
  }

  // Social Add URL -> Instant Save & Confirm
  if (state.step === 'add_social_url') {
    let cleanUrl = trimmed;
    const platform = state.tempData?.platform || 'custom';
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (platform === 'telegram') {
        cleanUrl = 'https://t.me/' + cleanUrl.replace(/^@/, '');
      } else {
        cleanUrl = 'https://' + cleanUrl;
      }
    }

    const title = state.tempData?.title || 'Social Profile';
    const subtitle = state.tempData?.subtitle || 'কানেক্ট থাকুন';
    const buttonText = state.tempData?.buttonText || 'যুক্ত হোন';

    const links = getSocialLinks();
    const newSocial: SocialLink = {
      id: 's_' + Date.now(),
      platform,
      title,
      url: cleanUrl,
      subtitle,
      buttonText,
      enabled: true
    };
    links.push(newSocial);
    saveSocialLinks(links);
    addLog('add', senderName, `নতুন সোশ্যাল লিংক যোগ: ${newSocial.title}`);
    userStates[chatId] = { step: 'idle' };

    const msg = `🎉 <b>নতুন সোশ্যাল লিঙ্ক সফলভাবে যুক্ত হয়েছে!</b>\n\n`
      + `📌 <b>নাম:</b> ${escapeHtml(newSocial.title)}\n`
      + `🔗 <b>লিংক:</b> ${escapeHtml(newSocial.url)}\n`
      + `🏷️ <b>বিবরণ:</b> ${escapeHtml(newSocial.subtitle)}\n`
      + `🔘 <b>বাটন:</b> [${escapeHtml(newSocial.buttonText)}]\n\n`
      + `<i>ওয়েবসাইটে তাৎক্ষণিকভাবে লাইভ সিঙ্ক হয়ে গেছে! নাম বা বাটন কাস্টমাইজ করতে নিচের বাটন চাপুন:</i>`;

    await sendTelegramMessage(chatId, msg, { reply_markup: getSingleSocialKeyboard(newSocial.id, true) });
    return msg;
  }

  // Edit Contact WhatsApp Number
  if (state.step === 'edit_contact_whatsapp') {
    const contact = getContactInfo();
    contact.whatsappNumber = trimmed;
    saveContactInfo(contact);
    addLog('edit', senderName, `WhatsApp নম্বর আপডেট: ${trimmed}`);
    userStates[chatId] = { step: 'idle' };
    const msg = `✅ <b>WhatsApp নম্বর সফলভাবে আপডেট হয়েছে!</b>\n\n📱 <code>${escapeHtml(contact.whatsappNumber)}</code>\n\n<i>ওয়েবসাইটে তাৎক্ষণিকভাবে আপডেট সম্পন্ন হয়েছে!</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getContactMenuKeyboard() });
    return msg;
  }

  // Edit Contact WhatsApp Message
  if (state.step === 'edit_contact_whatsapp_msg') {
    const contact = getContactInfo();
    contact.whatsappMessage = trimmed;
    saveContactInfo(contact);
    addLog('edit', senderName, `WhatsApp মেসেজ আপডেট`);
    userStates[chatId] = { step: 'idle' };
    const msg = `✅ <b>WhatsApp ডিফল্ট মেসেজ সফলভাবে আপডেট হয়েছে!</b>\n\n💬 <code>${escapeHtml(contact.whatsappMessage)}</code>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getContactMenuKeyboard() });
    return msg;
  }

  // Edit Contact Email
  if (state.step === 'edit_contact_email') {
    const contact = getContactInfo();
    contact.email = trimmed;
    saveContactInfo(contact);
    addLog('edit', senderName, `ইমেইল আপডেট: ${trimmed}`);
    userStates[chatId] = { step: 'idle' };
    const msg = `✅ <b>ইমেইল সফলভাবে আপডেট হয়েছে!</b>\n\n✉️ <code>${escapeHtml(contact.email)}</code>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getContactMenuKeyboard() });
    return msg;
  }

  // Edit Contact Note
  if (state.step === 'edit_contact_note') {
    const contact = getContactInfo();
    contact.customNote = trimmed;
    saveContactInfo(contact);
    addLog('edit', senderName, `কন্টাক্ট কোটেশন আপডেট`);
    userStates[chatId] = { step: 'idle' };
    const msg = `✅ <b>কোটেশন বার্তা সফলভাবে আপডেট হয়েছে!</b>\n\n📝 <i>"${escapeHtml(contact.customNote)}"</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getContactMenuKeyboard() });
    return msg;
  }

  // Service Step 1: Title
  if (state.step === 'add_title') {
    state.tempData = { ...state.tempData, title: trimmed };
    state.step = 'add_subtitle';
    userStates[chatId] = state;
    const msg = `🏷️ <b>ধাপ ২/৪: সাব-টাইটেল বা ক্যাটাগরি</b>\n\nক্যাটাগরি বা সাব-টাইটেল লিখুন (যেমন: 'ফটো ও মেমোরিজ' বা 'ওয়েব টুলস'):`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  // Service Step 2: Subtitle
  if (state.step === 'add_subtitle') {
    state.tempData = { ...state.tempData, subtitle: trimmed || 'ফটো ও মেমোরিজ' };
    state.step = 'add_image';
    userStates[chatId] = state;
    const msg = `🖼️ <b>ধাপ ৩/৪: সাভিসের ছবির সরাসরি লিংক (Image URL)</b>:\n\nছবির ওয়েব লিংক লিখে পাঠান অথবা ফটো হিসেবে সেন্ড করুন:`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  // Service Step 3: Image
  if (state.step === 'add_image') {
    state.tempData = { ...state.tempData, imageUrl: trimmed };
    state.step = 'add_link';
    userStates[chatId] = state;
    const msg = `🔗 <b>ধাপ ৪/৪: ক্লিক লিংক (Target URL)</b>:\n\nসাভিস কার্ডটিতে ক্লিক করলে কোন ঠিকানায় নিয়ে যাবে?`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  // Service Step 4: Link & Confirm
  if (state.step === 'add_link') {
    const linkUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const services = getServices();
    const newService: HighlightService = {
      id: 'h_' + Date.now() + Math.random().toString(36).substring(2, 6),
      title: state.tempData?.title || 'New Service',
      subtitle: state.tempData?.subtitle || 'ফটো ও মেমোরিজ',
      imageUrl: state.tempData?.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfH9zfFpRCmlHhd3O2zdevPVkl63_176D67FiAnTlgTQ&s=10',
      linkUrl,
      createdAt: new Date().toISOString()
    };
    services.push(newService);
    saveServices(services);
    addLog('add', senderName, `নতুন সাভিস যোগ: ${newService.title} (ক্রমিক: ${services.length})`, newService.title);
    userStates[chatId] = { step: 'idle' };

    const msg = `🎉 <b>সাভিস সফলভাবে যুক্ত হয়েছে!</b>\n\n🔢 <b>ক্রমিক নং:</b> #${services.length} (১২ এর পর ${services.length} নং সাভিস)\n📌 <b>নাম:</b> ${escapeHtml(newService.title)}\n🏷️ <b>ক্যাটাগরি:</b> ${escapeHtml(newService.subtitle)}\n🔗 <b>লিংক:</b> ${escapeHtml(newService.linkUrl)}\n\n<i>ওয়েবসাইটে ক্রমিক অনুসারে সর্বশেষে লাইভ যুক্ত হয়ে গেছে!</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getServicesMenuKeyboard() });
    return msg;
  }

  // Service Edit Field Value
  if (state.step === 'edit_service_val') {
    const serviceId = state.tempData?.serviceId;
    const field = state.tempData?.field;
    const services = getServices();
    const service = services.find(s => s.id === serviceId);

    if (service && field) {
      if (field === 'linkUrl') service.linkUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      else if (field === 'title') service.title = trimmed;
      else if (field === 'subtitle') service.subtitle = trimmed;
      else if (field === 'imageUrl') service.imageUrl = trimmed;

      saveServices(services);
      addLog('edit', senderName, `সাভিস আপডেট: ${service.title} (${field})`, service.title);
      userStates[chatId] = { step: 'idle' };

      const msg = `✅ <b>সাভিস সফলভাবে আপডেট হয়েছে!</b>\n\n📌 <b>নাম:</b> ${escapeHtml(service.title)}\n🏷️ <b>ক্যাটাগরি:</b> ${escapeHtml(service.subtitle)}\n🔗 <b>লিংক:</b> ${escapeHtml(service.linkUrl)}`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getServicesMenuKeyboard() });
      return msg;
    }
  }

  // Profile Edit: Name
  if (state.step === 'prof_edit_name') {
    const prof = getProfileInfo();
    prof.name = trimmed;
    saveProfileInfo(prof);
    addLog('edit', senderName, `প্রোফাইল নাম আপডেট: ${trimmed}`);
    userStates[chatId] = { step: 'idle' };

    const msg = `✅ <b>প্রোফাইল নাম সফলভাবে পরিবর্তন হয়েছে!</b>\n\n⚡ <b>নতুন নাম:</b> <b>${escapeHtml(prof.name)}</b>\n\n<i>ওয়েবসাইটে লাইভ আপডেট হয়েছে!</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
    return msg;
  }

  // Profile Edit: Handle
  if (state.step === 'prof_edit_handle') {
    let cleanHandle = trimmed;
    if (!cleanHandle.startsWith('@')) cleanHandle = '@' + cleanHandle;
    const prof = getProfileInfo();
    prof.handle = cleanHandle;
    saveProfileInfo(prof);
    addLog('edit', senderName, `প্রোফাইল হ্যান্ডেল আপডেট: ${cleanHandle}`);
    userStates[chatId] = { step: 'idle' };

    const msg = `✅ <b>ইউজারনেম / হ্যান্ডেল সফলভাবে আপডেট হয়েছে!</b>\n\n🔗 <b>নতুন হ্যান্ডেল:</b> <code>${escapeHtml(prof.handle)}</code>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
    return msg;
  }

  // Profile Edit: Title
  if (state.step === 'prof_edit_title') {
    const prof = getProfileInfo();
    prof.title = trimmed;
    saveProfileInfo(prof);
    addLog('edit', senderName, `পদবী / টাইটেল আপডেট: ${trimmed}`);
    userStates[chatId] = { step: 'idle' };

    const msg = `✅ <b>পদবী / টাইটেল সফলভাবে আপডেট হয়েছে!</b>\n\n💻 <b>নতুন টাইটেল:</b> ${escapeHtml(prof.title)}`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
    return msg;
  }

  // Profile Edit: Location
  if (state.step === 'prof_edit_location') {
    const prof = getProfileInfo();
    prof.location = trimmed;
    saveProfileInfo(prof);
    addLog('edit', senderName, `লোকেশন আপডেট: ${trimmed}`);
    userStates[chatId] = { step: 'idle' };

    const msg = `✅ <b>লোকেশন সফলভাবে আপডেট হয়েছে!</b>\n\n📍 <b>নতুন লোকেশন:</b> ${escapeHtml(prof.location)}`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
    return msg;
  }

  // Profile Edit: Bio
  if (state.step === 'prof_edit_bio') {
    const prof = getProfileInfo();
    prof.bio = trimmed;
    saveProfileInfo(prof);
    addLog('edit', senderName, `বায়ো বিবরণ আপডেট`);
    userStates[chatId] = { step: 'idle' };

    const msg = `✅ <b>বায়ো বিবরণ সফলভাবে আপডেট হয়েছে!</b>\n\n📝 <i>"${escapeHtml(prof.bio)}"</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
    return msg;
  }

  // Profile Edit: Avatar URL
  if (state.step === 'prof_edit_avatar') {
    const prof = getProfileInfo();
    prof.avatarUrl = trimmed;
    saveProfileInfo(prof);
    addLog('edit', senderName, `প্রোফাইল ছবি আপডেট`);
    userStates[chatId] = { step: 'idle' };

    const msg = `✅ <b>প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!</b>\n\n👤 <a href="${escapeHtml(prof.avatarUrl)}">নতুন ছবি দেখুন</a>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
    return msg;
  }

  // Profile Edit: Banner URL
  if (state.step === 'prof_edit_banner') {
    const prof = getProfileInfo();
    if (isRemoveCommand(trimmed)) {
      prof.bannerUrl = '';
      saveProfileInfo(prof);
      addLog('edit', senderName, `ব্যানার ছবি অপসারণ`);
      userStates[chatId] = { step: 'idle' };

      const msg = `✅ <b>ব্যানার কভার ছবি সফলভাবে সরিয়ে ফেলা হয়েছে!</b>\n\n<i>ওয়েবসাইটে এখন ব্যানার ছাড়া ফাঁকা ডার্ক ব্যাকগ্রাউন্ড দেখাবে।</i>`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
      return msg;
    } else {
      prof.bannerUrl = trimmed;
      saveProfileInfo(prof);
      addLog('edit', senderName, `ব্যানার ছবি আপডেট`);
      userStates[chatId] = { step: 'idle' };

      const msg = `✅ <b>ব্যানার ছবি সফলভাবে আপডেট হয়েছে!</b>\n\n🏞️ <a href="${escapeHtml(prof.bannerUrl)}">নতুন ব্যানার দেখুন</a>`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
      return msg;
    }
  }

  // Badge Add
  if (state.step === 'badge_add_text') {
    const badges = getBadges();
    const newBadge: BadgeItem = {
      id: 'b_' + Date.now(),
      text: trimmed
    };
    badges.push(newBadge);
    saveBadges(badges);
    addLog('add', senderName, `নতুন ব্যাজ যোগ: ${trimmed}`);
    userStates[chatId] = { step: 'idle' };

    const msg = `✅ <b>নতুন ব্যাজ সফলভাবে যুক্ত হয়েছে!</b>\n\n🏷️ <b>${escapeHtml(newBadge.text)}</b>\n\n<i>মোট ব্যাজ: ${badges.length}টি</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getBadgesMenuKeyboard() });
    return msg;
  }

  // Badge Edit Text
  if (state.step === 'badge_edit_text') {
    const badgeId = state.tempData?.badgeId;
    const badges = getBadges();
    const badge = badges.find(b => b.id === badgeId);
    if (badge) {
      badge.text = trimmed;
      saveBadges(badges);
      addLog('edit', senderName, `ব্যাজ টেক্সট আপডেট: ${trimmed}`);
      userStates[chatId] = { step: 'idle' };

      const msg = `✅ <b>ব্যাজ টেক্সট সফলভাবে পরিবর্তন হয়েছে!</b>\n\n🏷️ <b>${escapeHtml(badge.text)}</b>`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getBadgesMenuKeyboard() });
      return msg;
    }
  }

  // Fallback
  const helpMsg = `❓ আমি বুঝতে পারিনি। নিচের মেন্যু থেকে অপশন নির্বাচন করুন অথবা /start লিখুন।`;
  await sendTelegramMessage(chatId, helpMsg, { reply_markup: getMainMenuKeyboard() });
  return helpMsg;
  } catch (err) {
    console.error('Error in handleUserMessage:', err);
    await sendTelegramMessage(chatId, '⚠️ প্রসেসিং এ সমস্যা হয়েছে। /start চেপে পুনরায় চেষ্টা করুন।');
  }
}

// Commands
async function handleListCommand(chatId: string) {
  const services = getServices();
  let text = `📋 <b>আপনার মোট ${services.length}টি সাভিসের তালিকা:</b>\n\n`;
  services.forEach((s, idx) => {
    text += `<b>${idx + 1}.</b> <a href="${escapeHtml(s.linkUrl)}">${escapeHtml(s.title)}</a>\n🏷️ <i>${escapeHtml(s.subtitle)}</i>\n\n`;
  });
  await sendTelegramMessage(chatId, text, { reply_markup: getServicesMenuKeyboard() });
  return text;
}

async function handleEditCommand(chatId: string) {
  const services = getServices();
  const buttons = services.slice(0, 50).map((s, idx) => [
    { text: `${idx + 1}. ✏️ ${s.title.substring(0, 24)}`, callback_data: `srv_edit:${s.id}` }
  ]);
  buttons.push([{ text: '🔙 সাভিস মেন্যু', callback_data: 'menu_services' }]);

  const msg = `✏️ <b>কোন সাভিসটি এডিট করতে চান নির্বাচন করুন:</b>`;
  await sendTelegramMessage(chatId, msg, { reply_markup: { inline_keyboard: buttons } });
  return msg;
}

async function handleDeleteCommand(chatId: string) {
  const services = getServices();
  const buttons = services.slice(0, 50).map((s, idx) => [
    { text: `${idx + 1}. 🗑️ ${s.title.substring(0, 24)}`, callback_data: `srv_del:${s.id}` }
  ]);
  buttons.push([{ text: '🔙 সাভিস মেন্যু', callback_data: 'menu_services' }]);

  const msg = `🗑️ <b>কোন সাভিসটি ডিলিট করতে চান নির্বাচন করুন:</b>`;
  await sendTelegramMessage(chatId, msg, { reply_markup: { inline_keyboard: buttons } });
  return msg;
}

// Full Summary
async function sendFullSummary(chatId: string) {
  const profile = getProfileInfo();
  const badges = getBadges();
  const social = getSocialLinks();
  const contact = getContactInfo();
  const services = getServices();
  const fbCfg = getFirebaseConfig();

  let text = `📊 <b>ওয়েবসাইটের সম্পূর্ণ লাইভ কনফিগারেশন:</b>\n\n`;
  text += `👤 <b>প্রোফাইল:</b> <b>${escapeHtml(profile.name)}</b>\n`;
  text += `🔗 <b>হ্যান্ডেল:</b> <code>${escapeHtml(profile.handle)}</code>\n`;
  text += `💼 <b>পদবী:</b> ${escapeHtml(profile.title)}\n`;
  text += `📍 <b>লোকেশন:</b> ${escapeHtml(profile.location)}\n`;
  text += `📝 <b>বায়ো:</b> <i>"${escapeHtml(profile.bio)}"</i>\n\n`;

  text += `🏷️ <b>ব্যাজ সমূহ (${badges.length}টি):</b>\n`;
  badges.forEach((b, i) => {
    text += `${i + 1}. ${escapeHtml(b.text)}\n`;
  });

  text += `\n🌐 <b>সোশ্যাল মিডিয়া (${social.length}টি):</b>\n`;
  social.forEach(s => {
    const st = s.enabled !== false ? '🟢' : '⚪';
    text += `• ${st} <b>${escapeHtml(s.title)}</b>: ${escapeHtml(s.url)} [${escapeHtml(s.buttonText)}]\n`;
  });

  text += `\n📞 <b>যোগাযোগ:</b>\n`;
  text += `• WhatsApp: <code>${escapeHtml(contact.whatsappNumber)}</code>\n`;
  text += `• Email: <code>${escapeHtml(contact.email)}</code>\n`;
  text += `• Note: "${escapeHtml(contact.customNote)}"\n`;

  text += `\n🛠️ <b>মোট সাভিস:</b> ${services.length} টি লাইভ\n`;
  text += `🔥 <b>Firebase:</b> ${fbCfg.url ? '🟢 সংযুক্ত' : '⚪ বন্ধ'}\n`;

  await sendTelegramMessage(chatId, text, { reply_markup: getMainMenuKeyboard() });
}

// Handle Callback Queries (Inline button clicks)
async function handleCallbackQuery(cb: any) {
  try {
    const chatId = String(cb.message?.chat?.id || cb.from?.id || '');
    const data = String(cb.data || '');
    const cbId = cb.id;

    if (!chatId) return;
    console.log('🔘 Button clicked (callback_query):', data, 'from chatId:', chatId);

    try {
      await answerCallbackQuery(cbId);
    } catch (e) {
      console.warn('answerCallbackQuery warning:', e);
    }

  // ==========================================
  // ADMIN RESELLER CALLBACKS
  // ==========================================

  if (data === 'admin_webhook_menu') {
    userStates[chatId] = { step: 'idle' };
    const infoRes = await getTelegramWebhookStatus();
    const info = infoRes.result || {};
    const isWebhookActive = !!(info.url && info.url.length > 0);
    if (isWebhookActive) {
      botState.isWebhookMode = true;
      botState.isPolling = false;
    }
    const statusText = isWebhookActive
      ? `🟢 <b>চালু আছে (Webhook Active)</b>\n<code>${escapeHtml(info.url)}</code>`
      : `🟢 <b>সক্রিয় ও অনলাইন (Long Polling 24/7 চালু আছে)</b>`;
    const pending = info.pending_update_count || 0;
    const lastErr = info.last_error_message ? `\n⚠️ <b>সর্বশেষ এরর:</b> <i>${escapeHtml(info.last_error_message)}</i>` : '';

    const msg = `🌐 <b>Telegram Webhook ২৪/৭ কন্ট্রোল প্যানেল:</b>\n\n`
      + `• <b>বর্তমান স্ট্যাটাস:</b> ${statusText}\n`
      + `• <b>পেন্ডিং মেসেজ:</b> ${pending} টি${lastErr}\n\n`
      + `💡 <i>Webhook অন থাকলে ফ্রি সার্ভারেও ২৪/৭ বট কখনো ডাউন হবে না!</i>`;

    await sendTelegramMessage(chatId, msg, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⚡ অটোমেটিক Webhook সেট করুন', callback_data: 'admin_btn_autowebhook' }],
          [{ text: '🔄 Polling Mode এ নিয়ে যান', callback_data: 'admin_btn_delwebhook' }],
          [{ text: '🔙 প্রধান মেন্যু', callback_data: 'cmd_menu' }]
        ]
      }
    });
    return;
  }

  if (data === 'admin_btn_autowebhook') {
    userStates[chatId] = { step: 'idle' };
    await sendTelegramMessage(chatId, `⏳ <b>Webhook লিংক সেট করা হচ্ছে...</b>`);
    const res = await setTelegramWebhook('https://ais-dev-ll677qupqrzjjnbmkbnpfl-12329983830.asia-east1.run.app');
    if (res.ok) {
      await sendTelegramMessage(chatId, `🎉 <b>Telegram Webhook সফলভাবে অন হয়েছে!</b> ✅\n\n🌐 <code>${escapeHtml(res.url || '')}</code>\n\nএখন থেকে আপনার বট সম্পূর্ণ ২৪/৭ অনলাইনে সক্রিয় থাকবে!`, {
        reply_markup: getMainMenuKeyboard()
      });
    } else {
      await sendTelegramMessage(chatId, `⚠️ স্বয়ংক্রিয়ভাবে Webhook সেট করতে আপনার হোস্টিং লিঙ্কের প্রয়োজন:\n\n<code>/setwebhook https://your-domain.com</code> লিখে পাঠান।`);
    }
    return;
  }

  if (data === 'admin_btn_delwebhook') {
    userStates[chatId] = { step: 'idle' };
    await deleteTelegramWebhook();
    startTelegramPolling().catch(() => {});
    await sendTelegramMessage(chatId, `🔄 <b>Webhook বন্ধ করে Long Polling মোড চালু করা হয়েছে।</b>`, {
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  if (data === 'admin_menu_clients') {
    userStates[chatId] = { step: 'idle' };
    const clients = getClients();
    const msg = `📋 <b>নিবন্ধিত ক্লায়েন্ট তালিকা (${clients.length} জন):</b>\n\nযেকোনো ক্লায়েন্টের তথ্য দেখতে, ৩টি ফাইল ডাউনলোড করতে বা ডিলিট করতে নিচে নির্বাচন করুন:`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getAdminClientsListKeyboard() });
    return;
  }

  if (data === 'admin_btn_add_client') {
    userStates[chatId] = { step: 'admin_wizard_chatid', tempData: {} };
    const msg = `👤 <b>নতুন ক্লায়েন্ট তৈরি (ধাপ ১/৪): ক্লায়েন্টের Telegram Chat ID</b>\n\n`
      + `ক্লাইন্টের টেলিগ্রাম চ্যাট আইডিটি লিখে পাঠান:\n`
      + `<i>(ক্লাইন্ট টেলিগ্রামে @userinfobot এ স্টার্ট দিলে তার Chat ID পেয়ে যাবে, যেমন: <code>1234567890</code>)</i>\n\n`
      + `🔙 বাতিল করতে /cancel লিখুন`;
    await sendTelegramMessage(chatId, msg);
    return;
  }

  if (data === 'admin_menu_broadcast' || data === 'admin_btn_broadcast') {
    userStates[chatId] = { step: 'admin_broadcast_msg' };
    const clients = getClients();
    const msg = `📢 <b>সকল নিবন্ধিত ক্লায়েন্টকে বার্তা / নোটিশ পাঠান (Broadcast Notice)</b>\n\n`
      + `• নিবন্ধিত ক্লায়েন্ট সংখ্যা: <b>${clients.length}</b> জন\n\n`
      + `✍️ ক্লায়েন্টদের জন্য আপনার নোটিশ বা বার্তাটি লিখে পাঠান। এই বার্তাটি স্বয়ংক্রিয়ভাবে সকল নিবন্ধিত ক্লায়েন্টের টেলিগ্রাম ইনবক্সে পৌঁছে যাবে:\n\n`
      + `🔙 বাতিল করতে /cancel লিখুন।`;
    await sendTelegramMessage(chatId, msg);
    return;
  }

  if (data.startsWith('admin_view_client:')) {
    const clientId = data.replace('admin_view_client:', '');
    const client = getClientById(clientId) || getClients().find(c => c.id === clientId || c.id.includes(clientId) || clientId.includes(c.id));
    if (!client) {
      await sendTelegramMessage(chatId, `❌ ক্লায়েন্ট খুঁজে পাওয়া যায়নি!`, { reply_markup: getAdminClientsListKeyboard() });
      return;
    }

    const text = `👤 <b>ক্লায়েন্ট প্রোফাইল ও কন্ট্রোল:</b>\n\n`
      + `• 🏷️ <b>অ্যাপের নাম:</b> <b>${escapeHtml(client.appName)}</b>\n`
      + `• 📱 <b>PWA শর্ট নেম:</b> <code>${escapeHtml(client.shortName)}</code>\n`
      + `• 🆔 <b>ক্লায়েন্ট আইডি:</b> <code>${client.id}</code>\n`
      + `• 💬 <b>Telegram Chat ID:</b> <code>${client.chatId}</code>\n`
      + `• 👤 <b>প্রোফাইল নাম:</b> ${escapeHtml(client.profile.name)}\n`
      + `• 🛠️ <b>সাভিস সংখ্যা:</b> ${client.services.length}টি লাইভ\n`
      + `• 🌐 <b>সোশ্যাল লিংক:</b> ${client.socialLinks.length}টি\n`
      + `• 📱 <b>WhatsApp:</b> <code>${escapeHtml(client.contact.whatsappNumber)}</code>\n`
      + `• 📅 <b>তৈরি:</b> ${new Date(client.createdAt).toLocaleDateString('bn-BD')}\n\n`
      + `<i>নিচের বাটন চেপে ৩টি ফাইল ডাউনলোড করুন অথবা ক্লায়েন্ট মুছুন:</i>`;

    await sendTelegramMessage(chatId, text, { reply_markup: getAdminSingleClientKeyboard(client.id) });
    return;
  }

  if (data.startsWith('admin_dl_client:')) {
    const clientId = data.replace('admin_dl_client:', '');
    const client = getClientById(clientId) || getClients().find(c => c.id === clientId || c.id.includes(clientId) || clientId.includes(c.id));
    if (!client) {
      await sendTelegramMessage(chatId, `❌ ক্লায়েন্ট খুঁজে পাওয়া যায়নি!`, { reply_markup: getAdminClientsListKeyboard() });
      return;
    }
    await sendClientFilesToTelegram(chatId, client);
    return;
  }

  if (data.startsWith('admin_del_client:')) {
    const clientId = data.replace('admin_del_client:', '');
    const client = getClientById(clientId) || getClients().find(c => c.id === clientId || c.id.includes(clientId) || clientId.includes(c.id));
    if (client) {
      deleteClient(client.id);
      addLog('delete', 'Master Admin', `ক্লায়েন্ট মুছে ফেলা হয়েছে: ${client.appName} (${client.chatId})`);
      await sendTelegramMessage(chatId, `🗑️ <b>'${escapeHtml(client.appName)}' (${client.chatId}) ক্লায়েন্টটি সফলভাবে মুছে ফেলা হয়েছে!</b>`, {
        reply_markup: getAdminClientsListKeyboard()
      });
    } else {
      await sendTelegramMessage(chatId, `❌ ক্লায়েন্টটি ইতিমধ্যে মুছে ফেলা হয়েছে বা পাওয়া যায়নি!`, {
        reply_markup: getAdminClientsListKeyboard()
      });
    }
    return;
  }

  // Admin Layout Callbacks
  if (data.startsWith('admin_toggle_layout:')) {
    const clientId = data.replace('admin_toggle_layout:', '');
    const client = getClientById(clientId) || getClients().find(c => c.id === clientId || c.id.includes(clientId) || clientId.includes(c.id));
    if (client) {
      const newStyle = client.layoutStyle === 'services_first' ? 'social_first' : 'services_first';
      updateClientData(client.id, c => {
        c.layoutStyle = newStyle;
      });
      const updated = getClientById(client.id) || client;
      const layoutName = newStyle === 'services_first' ? '🛠️ সার্ভিস ও টুলস আগে' : '🌐 সোশ্যাল মিডিয়া আগে (অ্যাডমিন স্টাইল)';
      await sendTelegramMessage(
        chatId,
        `✅ <b>'${escapeHtml(updated.appName)}' এর লেআউট পরিবর্তন সম্পন্ন!</b>\n\n🎨 বর্তমান লেআউট: <b>${layoutName}</b>\n<i>ক্লায়েন্টের ওয়েবসাইটে লাইভ আপডেট হয়ে গেছে! 🚀</i>`,
        { reply_markup: getAdminSingleClientKeyboard(updated.id) }
      );
    } else {
      await sendTelegramMessage(chatId, `❌ ক্লায়েন্ট খুঁজে পাওয়া যায়নি!`, { reply_markup: getAdminClientsListKeyboard() });
    }
    return;
  }

  if (data.startsWith('admin_layout:')) {
    const style = data.replace('admin_layout:', '') as 'social_first' | 'services_first';
    const state = userStates[chatId];
    if (state && state.step === 'admin_wizard_layout') {
      await completeClientCreation(chatId, state.tempData, style, 'Admin');
    }
    return;
  }

  // ==========================================
  // CLIENT INTERACTIVE CALLBACKS (cl_*)
  // ==========================================

  // 1. Client Main Menu
  if (data === 'cl_menu_main' || data === 'cl_menu' || data.startsWith('cl_menu:') || data.startsWith('cl_menu_main')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientMainMenu(chatId, client);
    }
    return;
  }

  // 2. Client Profile Menu
  if (data === 'cl_menu_profile' || data === 'cl_prof' || data.startsWith('cl_prof:') || data.startsWith('cl_menu_profile')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientProfileMenu(chatId, client);
    }
    return;
  }

  // 3. Client Badges Menu
  if (data === 'cl_menu_badges' || data === 'cl_badges' || data.startsWith('cl_badges:') || data.startsWith('cl_menu_badges')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientBadgesMenu(chatId, client);
    }
    return;
  }

  // 4. Client Services Menu
  if (data === 'cl_menu_services' || data === 'cl_services' || data.startsWith('cl_services:') || data.startsWith('cl_menu_services')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientServicesMenu(chatId, client);
    }
    return;
  }

  // 5. Client Social Menu
  if (data === 'cl_menu_social' || data === 'cl_social' || data.startsWith('cl_social:') || data.startsWith('cl_menu_social')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientSocialMenu(chatId, client);
    }
    return;
  }

  // 6. Client Contact Menu
  if (data === 'cl_menu_contact' || data === 'cl_contact' || data.startsWith('cl_contact:') || data.startsWith('cl_menu_contact')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientContactMenu(chatId, client);
    }
    return;
  }

  // 7. Client Full Preview / Summary
  if (data === 'cl_cmd_summary' || data === 'cl_preview' || data.startsWith('cl_preview:') || data.startsWith('cl_cmd_summary')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientFullSummary(chatId, client);
    }
    return;
  }

  // 8. Client Layout & Theme Sub-Menus
  if (data === 'cl_menu_layout' || data === 'cl_layout' || data.startsWith('cl_layout:') || data.startsWith('cl_menu_layout') || data.startsWith('cl_layout_theme_main:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientLayoutThemeMainMenu(chatId, client);
    }
    return;
  }

  if (data === 'cl_sub_layout' || data.startsWith('cl_sub_layout:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientLayoutOnlyMenu(chatId, client);
    }
    return;
  }

  if (data === 'cl_sub_theme' || data.startsWith('cl_sub_theme:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      await sendClientThemeOnlyMenu(chatId, client);
    }
    return;
  }

  // 9. Client Set Layout Choice
  if (data.startsWith('cl_set_layout:')) {
    const parts = data.split(':');
    const style = parts[1] as 'social_first' | 'services_first';
    const clientId = parts[2];
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      updateClientData(client.id, c => {
        c.layoutStyle = style;
      });
      const updated = getClientById(client.id) || client;
      saveThemeConfig(updated.themeStyle, style);
      const styleName = style === 'services_first' ? '🛠️ সার্ভিস ও টুলস আগে' : '🌐 সোশ্যাল মিডিয়া আগে (অ্যাডমিন স্টাইল)';
      await sendTelegramMessage(
        chatId,
        `✅ <b>লেআউট সফলভাবে পরিবর্তন হয়েছে!</b>\n\n📐 বর্তমান সাজানো: <b>${styleName}</b>\n\n<i>আপনার লাইভ ওয়েবসাইটে তাৎক্ষণিকভাবে এই লেআউট কার্যকর হয়ে গেছে! 🚀</i>`,
        { reply_markup: getClientLayoutOnlyKeyboard(updated) }
      );
    }
    return;
  }

  // 10. Client Set Theme Choice
  if (data.startsWith('cl_set_theme:')) {
    const parts = data.split(':');
    const themeStyle = parts[1];
    const clientId = parts[2];
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      updateClientData(client.id, c => {
        c.themeStyle = themeStyle;
      });
      const updated = getClientById(client.id) || client;
      saveThemeConfig(themeStyle, updated.layoutStyle);
      const themeName = themeStyle === 'ultra_cyber_glass'
        ? '✨ ১. আল্ট্রা প্রিমিয়াম সাইবার গ্লাস (Ultra Cyber Glass 3D)'
        : themeStyle === 'organic_nature'
        ? '🍃 ২. অর্গানিক নেচার (Organic Nature)'
        : themeStyle === 'bold_flat_popart'
        ? '💥 ৩. বোল্ড ফ্ল্যাট পপ আর্ট (Bold Flat Pop Art)'
        : '🕶️ ৪. ক্লাসিক ডার্ক (Classic Dark)';
      await sendTelegramMessage(
        chatId,
        `🎨 <b>ওয়েবসাইট থিম সফলভাবে পরিবর্তন হয়েছে!</b>\n\n✨ বর্তমান থিম: <b>${themeName}</b>\n\n<i>আপনার লাইভ ওয়েবসাইটে তাৎক্ষণিকভাবে এই থিম কার্যকর হয়ে গেছে! 🚀</i>`,
        { reply_markup: getClientThemeOnlyKeyboard(updated) }
      );
    }
    return;
  }

  // Profile Field Edit Triggers
  if (data === 'cl_prof_edit_name' || data.startsWith('cl_prof_edit_name:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_prof_name', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `⚡ <b>নতুন নাম লিখে পাঠান:</b>\n\n<i>(ওয়েবসাইটে সাথে সাথে নাম পরিবর্তন হবে)</i>`);
    return;
  }

  if (data === 'cl_prof_edit_handle' || data.startsWith('cl_prof_edit_handle:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_prof_handle', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `🔗 <b>নতুন ইউজারনেম / হ্যান্ডেল লিখে পাঠান:</b>\n<i>(যেমন: @my_name)</i>`);
    return;
  }

  if (data === 'cl_prof_edit_title' || data.startsWith('cl_prof_edit_title:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_prof_title', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `💻 <b>নতুন পদবী / পেশাগত টাইটেল লিখে পাঠান:</b>`);
    return;
  }

  if (data === 'cl_prof_edit_loc' || data.startsWith('cl_prof_edit_loc:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_prof_location', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `📍 <b>নতুন লোকেশন লিখে পাঠান:</b>\n<i>(যেমন: Dhaka, Bangladesh)</i>`);
    return;
  }

  if (data === 'cl_prof_edit_bio' || data.startsWith('cl_prof_edit_bio:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_prof_bio', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `📝 <b>নতুন বায়ো বিবরণ লিখে পাঠান:</b>`);
    return;
  }

  if (data === 'cl_prof_edit_avatar' || data.startsWith('cl_prof_edit_avatar:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_prof_avatar', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `🖼️ <b>প্রোফাইল ছবি পরিবর্তন</b>\n\n📷 আপনার পছন্দের ছবিটি সরাসরি <b>ফটো হিসেবে সেন্ড করুন</b> অথবা ছবির <b>সরাসরি ওয়েব লিংক (URL)</b> লিখে পাঠান:`);
    return;
  }

  if (data === 'cl_prof_edit_banner' || data.startsWith('cl_prof_edit_banner:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_prof_banner', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `🏞️ <b>ব্যানার ছবি পরিবর্তন</b>\n\n📷 আপনার ব্যানার ছবিটি সরাসরি <b>ফটো হিসেবে সেন্ড করুন</b> অথবা ব্যানারের <b>সরাসরি ওয়েব লিংক (URL)</b> লিখে পাঠান:\n\n💡 <i>(ব্যানার কভার তুলে দিতে বা খালি রাখতে <code>/remove</code> অথবা <code>none</code> লিখে পাঠান)</i>`);
    return;
  }

  // Badges Management
  if (data === 'cl_badge_add' || data.startsWith('cl_badge_add:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_badge_add_text', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `➕ <b>নতুন ব্যাজ যোগ করুন:</b>\n\nব্যাজের লেখা লিখে পাঠান (যেমন: "⚡ Pro Gamer"):`);
    return;
  }

  if (data.startsWith('cl_badge_del:')) {
    const parts = data.split(':');
    const badgeId = parts[parts.length - 1];
    const clientId = parts.length >= 3 ? parts[1] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      updateClientData(client.id, c => {
        c.badges = c.badges.filter(b => b.id !== badgeId);
      });
      const updated = getClientById(client.id) || client;
      await sendTelegramMessage(chatId, `🗑️ <b>ব্যাজটি সফলভাবে মুছে ফেলা হয়েছে!</b>`, {
        reply_markup: getClientBadgesMenuKeyboard(updated)
      });
    }
    return;
  }

  // Services Management
  if (data.startsWith('cl_srv_view:')) {
    const parts = data.split(':');
    const serviceId = parts[parts.length - 1];
    const clientId = parts.length >= 3 ? parts[1] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (!client) return;
    const s = client.services.find(item => item.id === serviceId);
    if (!s) return;

    await sendTelegramMessage(
      chatId,
      `🛠️ <b>সাভিস:</b> <b>${escapeHtml(s.title)}</b>\n🏷️ <b>ক্যাটাগরি:</b> ${escapeHtml(s.subtitle)}\n🔗 <b>লিংক:</b> ${escapeHtml(s.linkUrl)}\n\nকী পরিবর্তন করতে চান?`,
      { reply_markup: getClientSingleServiceKeyboard(s.id, client.id) }
    );
    return;
  }

  if (data === 'cl_srv_add' || data.startsWith('cl_srv_add:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_srv_title', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `➕ <b>নতুন সাভিস যোগ (ধাপ ১/৪)</b>\n\n📌 সাভিসের নাম (Title) লিখে পাঠান:`);
    return;
  }

  if (data.startsWith('cl_srv_ed:')) {
    const parts = data.split(':');
    const field = parts[1];
    const serviceId = parts[2];
    const clientId = parts.length >= 4 ? parts[3] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = {
      step: 'client_srv_edit_val',
      tempData: { clientId: client?.id, serviceId, field }
    };
    const fieldNames: Record<string, string> = {
      title: 'নতুন শিরোনাম',
      sub: 'নতুন সাব-টাইটেল বা ক্যাটাগরি',
      img: 'নতুন ছবির ওয়েব লিংক (URL) বা ছবি সেন্ড করুন',
      lnk: 'নতুন ক্লিক লিংক (URL)'
    };
    await sendTelegramMessage(chatId, `✍️ <b>${fieldNames[field] || 'নতুন মান'} লিখে পাঠান:</b>`);
    return;
  }

  if (data.startsWith('cl_srv_del:')) {
    const parts = data.split(':');
    const serviceId = parts[parts.length - 1];
    const clientId = parts.length >= 3 ? parts[1] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      updateClientData(client.id, c => {
        c.services = c.services.filter(s => s.id !== serviceId);
      });
      const updated = getClientById(client.id) || client;
      await sendTelegramMessage(chatId, `🗑️ <b>সাভিসটি সফলভাবে মুছে ফেলা হয়েছে!</b>`, {
        reply_markup: getClientServicesMenuKeyboard(updated)
      });
    }
    return;
  }

  // Client Social Management
  if (data.startsWith('cl_soc_view:')) {
    const parts = data.split(':');
    const clientId = parts[1];
    const linkId = parts[2];
    const client = resolveClientForChat(chatId, clientId);
    if (!client) return;
    const link = client.socialLinks.find(l => l.id === linkId);
    if (!link) return;

    const statusText = link.enabled !== false ? '🟢 সক্রিয় (Active)' : '⚪ লুকানো (Hidden)';
    const text = `🌐 <b>সোশ্যাল অ্যাকাউন্ট বিস্তারিত:</b>\n\n`
      + `• 📌 <b>নাম:</b> ${escapeHtml(link.title)}\n`
      + `• 🔗 <b>লিংক:</b> ${escapeHtml(link.url)}\n`
      + `• 🏷️ <b>সাব-টাইটেল:</b> ${escapeHtml(link.subtitle || '-')}\n`
      + `• 🔘 <b>বাটন টেক্সট:</b> [${escapeHtml(link.buttonText || '-')}]\n`
      + `• 👁️ <b>অবস্থা:</b> ${statusText}\n\n`
      + `<i>কী পরিবর্তন করতে চান নির্বাচন করুন:</i>`;

    await sendTelegramMessage(chatId, text, { reply_markup: getClientSingleSocialKeyboard(client.id, link.id, link.enabled !== false) });
    return;
  }

  if (data.startsWith('cl_soc_add') || data === 'cl_soc_add') {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (!client) return;
    await sendTelegramMessage(
      chatId,
      `➕ <b>নতুন সোশ্যাল লিঙ্ক যোগ করুন</b>\n\n📌 অনুগ্রহ করে প্ল্যাটফর্ম নির্বাচন করুন:`,
      { reply_markup: getClientSocialPlatformKeyboard(client.id) }
    );
    return;
  }

  if (data.startsWith('cl_soc_plat:')) {
    const parts = data.split(':');
    const platform = parts[1] as SocialLink['platform'];
    const clientId = parts[2];
    const client = resolveClientForChat(chatId, clientId);

    const defaultTitles: Record<string, { title: string; subtitle: string; btn: string }> = {
      facebook: { title: 'Facebook Profile / Page', subtitle: 'অফিসিয়াল ফেসবুক প্রোফাইল', btn: 'যুক্ত হোন' },
      telegram: { title: 'Telegram Channel / Group', subtitle: 'টেলিগ্রাম চ্যানেল', btn: 'যুক্ত হোন' },
      youtube: { title: 'YouTube Channel', subtitle: 'অফিসিয়াল ইউটিউব চ্যানেল', btn: 'সাবস্ক্রাইব' },
      instagram: { title: 'Instagram Profile', subtitle: 'ইনস্টাগ্রাম ফটো ও রিলস', btn: 'ফলো করুন' },
      tiktok: { title: 'TikTok Profile', subtitle: 'ভাইরাল শর্ট ভিডিও', btn: 'ফলো করুন' },
      snapchat: { title: 'Snapchat Profile', subtitle: 'স্ন্যাপ ও স্টোরিজ', btn: 'অ্যাড করুন' },
      twitter: { title: 'X (Twitter) Profile', subtitle: '乂 প্রোফাইল', btn: 'ফলো করুন' },
      github: { title: 'GitHub Profile', subtitle: 'ওপেন সোর্স প্রজেক্ট', btn: 'ফলো করুন' },
      custom: { title: 'Social Link', subtitle: 'কানেক্ট থাকুন', btn: 'ভিজিট করুন' }
    };
    const def = defaultTitles[platform] || defaultTitles.custom;

    userStates[chatId] = {
      step: 'client_social_url',
      tempData: {
        clientId: client?.id,
        platform,
        title: def.title,
        subtitle: def.subtitle,
        buttonText: def.btn,
        isAdding: true
      }
    };
    await sendTelegramMessage(
      chatId,
      `🔗 <b>আপনার ${platform} এর সম্পূর্ণ লিঙ্ক (URL) লিখে পাঠান:</b>\n\n<i>(যেমন: https://... বা username)</i>`
    );
    return;
  }

  if (data.startsWith('cl_soc_edit_url:')) {
    const parts = data.split(':');
    const clientId = parts[1];
    const linkId = parts[2];
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_social_url', tempData: { clientId: client?.id, linkId, isAdding: false } };
    await sendTelegramMessage(chatId, `🔗 <b>নতুন সোশ্যাল লিঙ্ক (URL) লিখে পাঠান:</b>`);
    return;
  }

  if (data.startsWith('cl_soc_edit_title:')) {
    const parts = data.split(':');
    const clientId = parts[1];
    const linkId = parts[2];
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_social_title', tempData: { clientId: client?.id, linkId } };
    await sendTelegramMessage(chatId, `📌 <b>নতুন সোশ্যাল নাম বা টাইটেল লিখে পাঠান:</b>`);
    return;
  }

  if (data.startsWith('cl_soc_edit_sub:')) {
    const parts = data.split(':');
    const clientId = parts[1];
    const linkId = parts[2];
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_social_subtitle', tempData: { clientId: client?.id, linkId } };
    await sendTelegramMessage(chatId, `🏷️ <b>নতুন সাব-টাইটেল বা বিবরণ লিখে পাঠান:</b>`);
    return;
  }

  if (data.startsWith('cl_soc_edit_btn:')) {
    const parts = data.split(':');
    const clientId = parts[1];
    const linkId = parts[2];
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_social_button', tempData: { clientId: client?.id, linkId } };
    await sendTelegramMessage(chatId, `🔘 <b>নতুন বাটন টেক্সট লিখে পাঠান:</b>\n<i>(যেমন: "যুক্ত হোন", "সাবস্ক্রাইব", "ফলো করুন")</i>`);
    return;
  }

  if (data.startsWith('cl_soc_toggle:')) {
    const parts = data.split(':');
    const linkId = parts[parts.length - 1];
    const clientId = parts.length >= 3 ? parts[1] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      updateClientData(client.id, c => {
        const l = c.socialLinks.find(item => item.id === linkId);
        if (l) l.enabled = l.enabled === false ? true : false;
      });
      const updated = getClientById(client.id) || client;
      const l = updated.socialLinks.find(item => item.id === linkId);
      const st = l && l.enabled !== false ? 'অন করা হয়েছে 🟢' : 'হাইড করা হয়েছে ⚪';
      await sendTelegramMessage(chatId, `✅ <b>সোশ্যাল লিংকের অবস্থা ${st}!</b>`, {
        reply_markup: getClientSingleSocialKeyboard(updated.id, linkId, l ? l.enabled !== false : true)
      });
    }
    return;
  }

  if (data.startsWith('cl_soc_del:')) {
    const parts = data.split(':');
    const linkId = parts[parts.length - 1];
    const clientId = parts.length >= 3 ? parts[1] : '';
    const client = resolveClientForChat(chatId, clientId);
    if (client) {
      updateClientData(client.id, c => {
        c.socialLinks = c.socialLinks.filter(l => l.id !== linkId);
      });
      const updated = getClientById(client.id) || client;
      await sendTelegramMessage(chatId, `🗑️ <b>সোশ্যাল লিঙ্কটি সফলভাবে মুছে ফেলা হয়েছে!</b>`, {
        reply_markup: getClientSocialMenuKeyboard(updated)
      });
    }
    return;
  }

  // Contact Field Edit Triggers
  if (data === 'cl_contact_edit_wa' || data.startsWith('cl_contact_edit_wa:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_contact_wa', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `📱 <b>নতুন WhatsApp নম্বর দিন:</b>\n<i>(যেমন: +8801700000000)</i>`);
    return;
  }

  if (data === 'cl_contact_edit_wa_msg' || data.startsWith('cl_contact_edit_wa_msg:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_contact_wa_msg', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `💬 <b>হোয়াটসঅ্যাপে স্বয়ংক্রিয় টাইপ বার্তাটি লিখুন:</b>`);
    return;
  }

  if (data === 'cl_contact_edit_email' || data.startsWith('cl_contact_edit_email:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_contact_email', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `✉️ <b>নতুন ইমেইল ঠিকানা লিখে পাঠান:</b>`);
    return;
  }

  if (data === 'cl_contact_edit_note' || data.startsWith('cl_contact_edit_note:')) {
    const clientId = data.includes(':') ? data.split(':').slice(-1)[0] : '';
    const client = resolveClientForChat(chatId, clientId);
    userStates[chatId] = { step: 'client_contact_note', tempData: { clientId: client?.id } };
    await sendTelegramMessage(chatId, `📝 <b>যোগাযোগ বক্সের নিচে দেখানো বার্তাটি লিখুন:</b>`);
    return;
  }

  // ==========================================
  // MASTER ADMIN ORIGINAL CALLBACKS
  // ==========================================

  // Main Menus
  if (data === 'cmd_menu') {
    userStates[chatId] = { step: 'idle' };
    await sendTelegramMessage(chatId, `🏠 <b>প্রধান মেন্যু:</b>\nকোন বিভাগটি পরিচালনা করতে চান?`, {
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  // Profile Menu
  if (data === 'menu_profile') {
    userStates[chatId] = { step: 'idle' };
    await sendTelegramMessage(chatId, getProfileDetailsText(), {
      reply_markup: getProfileMenuKeyboard()
    });
    return;
  }

  // Badges Menu
  if (data === 'menu_badges') {
    userStates[chatId] = { step: 'idle' };
    const badges = getBadges();
    let msg = `🏷️ <b>ব্যাজ সমূহ (Badges):</b>\n\nমোট <b>${badges.length}</b> টি সক্রিয় ব্যাজ রয়েছে:\n\n`;
    badges.forEach((b, i) => {
      msg += `• <b>${i + 1}.</b> ${escapeHtml(b.text)}\n`;
    });
    msg += `\n<i>যেকোনো ব্যাজ এডিট বা ডিলিট করতে নিচে ট্যাপ করুন, অথবা নতুন ব্যাজ যোগ করুন:</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getBadgesMenuKeyboard() });
    return;
  }

  if (data === 'menu_social') {
    userStates[chatId] = { step: 'idle' };
    await sendTelegramMessage(
      chatId,
      `🌐 <b>সোশ্যাল মিডিয়া প্ল্যাটফর্ম ও লিঙ্কসমূহ:</b>\n\nযে অ্যাকাউন্টের লিংক বা বাটন পরিবর্তন করতে চান নির্বাচন করুন:`,
      { reply_markup: getSocialMenuKeyboard() }
    );
    return;
  }

  if (data === 'menu_contact') {
    userStates[chatId] = { step: 'idle' };
    const contact = getContactInfo();
    const msg = `📞 <b>সরাসরি যোগাযোগ সেটিংস:</b>\n\n📱 <b>WhatsApp:</b> <code>${escapeHtml(contact.whatsappNumber)}</code>\n💬 <b>বার্তা:</b> <code>${escapeHtml(contact.whatsappMessage)}</code>\n✉️ <b>ইমেইল:</b> <code>${escapeHtml(contact.email)}</code>\n📝 <b>কোট:</b> <i>"${escapeHtml(contact.customNote)}"</i>\n\n<i>কোনটি পরিবর্তন করতে চান?</i>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getContactMenuKeyboard() });
    return;
  }

  if (data === 'menu_services') {
    userStates[chatId] = { step: 'idle' };
    await sendTelegramMessage(
      chatId,
      `🛠️ <b>সাভিস ম্যানেজমেন্ট:</b>\nএকটি অপশন নির্বাচন করুন:`,
      { reply_markup: getServicesMenuKeyboard() }
    );
    return;
  }

  if (data === 'cmd_full_summary') {
    await sendFullSummary(chatId);
    return;
  }

  // Profile Edit Queries
  if (data === 'prof_edit_name') {
    userStates[chatId] = { step: 'prof_edit_name' };
    const prof = getProfileInfo();
    await sendTelegramMessage(
      chatId,
      `⚡ <b>নতুন প্রোফাইল নাম লিখুন:</b>\n\nবর্তমান নাম: <b>${escapeHtml(prof.name)}</b>\n\nনতুন নামটি লিখে পাঠান:`
    );
    return;
  }

  if (data === 'prof_edit_handle') {
    userStates[chatId] = { step: 'prof_edit_handle' };
    const prof = getProfileInfo();
    await sendTelegramMessage(
      chatId,
      `🔗 <b>নতুন ইউজারনেম / হ্যান্ডেল লিখুন:</b>\n\nবর্তমান: <code>${escapeHtml(prof.handle)}</code>\n\nনতুন হ্যান্ডেল লিখে পাঠান:\n<i>(যেমন: @shuvo_bhai_444)</i>`
    );
    return;
  }

  if (data === 'prof_edit_title') {
    userStates[chatId] = { step: 'prof_edit_title' };
    const prof = getProfileInfo();
    await sendTelegramMessage(
      chatId,
      `💻 <b>নতুন পদবী / পেশাগত টাইটেল লিখুন:</b>\n\nবর্তমান: ${escapeHtml(prof.title)}\n\nনতুন টাইটেল লিখে পাঠান:`
    );
    return;
  }

  if (data === 'prof_edit_loc') {
    userStates[chatId] = { step: 'prof_edit_location' };
    const prof = getProfileInfo();
    await sendTelegramMessage(
      chatId,
      `📍 <b>নতুন লোকেশন লিখুন:</b>\n\nবর্তমান: ${escapeHtml(prof.location)}\n\nনতুন লোকেশন লিখে পাঠান:\n<i>(যেমন: Natore, Bangladesh বা Dhaka, Bangladesh)</i>`
    );
    return;
  }

  if (data === 'prof_edit_bio') {
    userStates[chatId] = { step: 'prof_edit_bio' };
    const prof = getProfileInfo();
    await sendTelegramMessage(
      chatId,
      `📝 <b>নতুন বায়ো বিবরণ লিখুন:</b>\n\nবর্তমান বায়ো: <i>"${escapeHtml(prof.bio)}"</i>\n\nনতুন বিস্তারিত বায়ো টেক্সট লিখে পাঠান:`
    );
    return;
  }

  if (data === 'prof_edit_avatar') {
    userStates[chatId] = { step: 'prof_edit_avatar' };
    const prof = getProfileInfo();
    await sendTelegramMessage(
      chatId,
      `🖼️ <b>প্রোফাইল ছবি পরিবর্তন</b>\n\nবর্তমান ছবি: ${prof.avatarUrl ? `<a href="${escapeHtml(prof.avatarUrl)}">দেখুন</a>` : '<i>(খালি)</i>'}\n\n📷 আপনার পছন্দের প্রোফাইল ছবিটি সরাসরি এই চ্যাটে <b>ফটো হিসেবে সেন্ড করুন</b> অথবা ছবির <b>সরাসরি ওয়েব লিংক (URL)</b> লিখে পাঠান:`
    );
    return;
  }

  if (data === 'prof_edit_banner') {
    userStates[chatId] = { step: 'prof_edit_banner' };
    const prof = getProfileInfo();
    await sendTelegramMessage(
      chatId,
      `🏞️ <b>ব্যানার কভার ছবি পরিবর্তন</b>\n\nবর্তমান ব্যানার: ${prof.bannerUrl ? `<a href="${escapeHtml(prof.bannerUrl)}">দেখুন</a>` : '<i>(খালি)</i>'}\n\n📷 আপনার পছন্দের ব্যানার ছবিটি সরাসরি <b>ফটো হিসেবে সেন্ড করুন</b> অথবা ব্যানারের <b>সরাসরি ওয়েব লিংক (URL)</b> লিখে পাঠান:\n\n💡 <i>(ব্যানার কভার তুলে দিতে/খালি করতে <code>/remove</code> অথবা <code>none</code> লিখে পাঠান)</i>`
    );
    return;
  }

  // Badge Queries
  if (data === 'badge_add') {
    userStates[chatId] = { step: 'badge_add_text' };
    await sendTelegramMessage(
      chatId,
      `➕ <b>নতুন ব্যাজ যোগ করুন</b>\n\nব্যাজের লেখা লিখে পাঠান:\n<i>(যেমন: "⚡ Pro Gamer" বা "🎮 Free Fire Lover")</i>`
    );
    return;
  }

  if (data.startsWith('badge_manage:')) {
    const badgeId = data.replace('badge_manage:', '');
    const badges = getBadges();
    const badge = badges.find(b => b.id === badgeId);
    if (!badge) {
      await sendTelegramMessage(chatId, '❌ ব্যাজ খুঁজে পাওয়া যায়নি!');
      return;
    }
    await sendTelegramMessage(
      chatId,
      `🏷️ <b>ব্যাজ:</b> <b>${escapeHtml(badge.text)}</b>\n\nকী করতে চান নির্বাচন করুন:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✍️ টেক্সট পরিবর্তন', callback_data: `badge_edit_prompt:${badge.id}` },
              { text: '🗑️ ব্যাজটি মুছুন', callback_data: `badge_del:${badge.id}` }
            ],
            [{ text: '🔙 ব্যাজ তালিকা', callback_data: 'menu_badges' }]
          ]
        }
      }
    );
    return;
  }

  if (data.startsWith('badge_edit_prompt:')) {
    const badgeId = data.replace('badge_edit_prompt:', '');
    userStates[chatId] = { step: 'badge_edit_text', tempData: { badgeId } };
    await sendTelegramMessage(chatId, `✍️ ব্যাজের নতুন লেখা লিখে পাঠান:`);
    return;
  }

  if (data.startsWith('badge_del:')) {
    const badgeId = data.replace('badge_del:', '');
    const badges = getBadges();
    const badge = badges.find(b => b.id === badgeId);
    if (badge) {
      const filtered = badges.filter(b => b.id !== badgeId);
      saveBadges(filtered);
      addLog('delete', 'Telegram Bot', `ব্যাজ মুছে ফেলা হয়েছে: ${badge.text}`);
      await sendTelegramMessage(
        chatId,
        `🗑️ <b>'${escapeHtml(badge.text)}' ব্যাজটি সফলভাবে মুছে ফেলা হয়েছে!</b>`,
        { reply_markup: getBadgesMenuKeyboard() }
      );
    }
    return;
  }

  // Social Management
  if (data.startsWith('soc_manage:')) {
    const linkId = data.replace('soc_manage:', '');
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);
    if (!link) {
      await sendTelegramMessage(chatId, '❌ সোশ্যাল লিঙ্ক খুঁজে পাওয়া যায়নি!', { reply_markup: getSocialMenuKeyboard() });
      return;
    }

    const statusText = link.enabled !== false ? '🟢 সক্রিয় (Active)' : '⚪ লুকানো (Hidden)';
    const text = `🌐 <b>সোশ্যাল অ্যাকাউন্ট বিস্তারিত:</b>\n\n`
      + `• 📌 <b>নাম:</b> ${escapeHtml(link.title)}\n`
      + `• 🔗 <b>লিংক:</b> ${escapeHtml(link.url)}\n`
      + `• 🏷️ <b>সাব-টাইটেল:</b> ${escapeHtml(link.subtitle || '-')}\n`
      + `• 🔘 <b>বাটন টেক্সট:</b> [${escapeHtml(link.buttonText || '-')}]\n`
      + `• 👁️ <b>অবস্থা:</b> ${statusText}\n\n`
      + `<i>কী পরিবর্তন করতে চান নির্বাচন করুন:</i>`;

    await sendTelegramMessage(chatId, text, { reply_markup: getSingleSocialKeyboard(link.id, link.enabled !== false) });
    return;
  }

  if (data.startsWith('soc_edit_url:')) {
    const linkId = data.replace('soc_edit_url:', '');
    userStates[chatId] = { step: 'edit_social_url', tempData: { linkId } };
    await sendTelegramMessage(chatId, `🔗 নতুন লিঙ্ক (URL) লিখে পাঠান:`);
    return;
  }

  if (data.startsWith('soc_edit_title:')) {
    const linkId = data.replace('soc_edit_title:', '');
    userStates[chatId] = { step: 'edit_social_title', tempData: { linkId } };
    await sendTelegramMessage(chatId, `📌 নতুন নাম বা টাইটেল লিখে পাঠান:`);
    return;
  }

  if (data.startsWith('soc_edit_sub:')) {
    const linkId = data.replace('soc_edit_sub:', '');
    userStates[chatId] = { step: 'edit_social_subtitle', tempData: { linkId } };
    await sendTelegramMessage(chatId, `🏷️ নতুন সাব-টাইটেল বা বিবরণ লিখে পাঠান:`);
    return;
  }

  if (data.startsWith('soc_edit_btn:')) {
    const linkId = data.replace('soc_edit_btn:', '');
    userStates[chatId] = { step: 'edit_social_button', tempData: { linkId } };
    await sendTelegramMessage(chatId, `🔘 নতুন বাটন টেক্সট লিখে পাঠান (যেমন: "যুক্ত হোন", "সাবস্ক্রাইব", "ফলো করুন"):`);
    return;
  }

  if (data.startsWith('soc_toggle:')) {
    const linkId = data.replace('soc_toggle:', '');
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);
    if (link) {
      link.enabled = link.enabled === false ? true : false;
      saveSocialLinks(links);
      const st = link.enabled ? 'সক্রিয় করা হয়েছে 🟢' : 'লুকানো হয়েছে ⚪';
      addLog('edit', 'Telegram Bot', `${link.title} অবস্থা পরিবর্তন: ${st}`);
      await sendTelegramMessage(
        chatId,
        `✅ <b>${escapeHtml(link.title)}</b> সফলভাবে ${st}!`,
        { reply_markup: getSingleSocialKeyboard(link.id, link.enabled) }
      );
    }
    return;
  }

  if (data.startsWith('soc_del:')) {
    const linkId = data.replace('soc_del:', '');
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);
    if (link) {
      const filtered = links.filter(l => l.id !== linkId);
      saveSocialLinks(filtered);
      addLog('delete', 'Telegram Bot', `সোশ্যাল লিঙ্ক ডিলিট: ${link.title}`);
      await sendTelegramMessage(chatId, `🗑️ <b>'${escapeHtml(link.title)}' সোশ্যাল লিঙ্কটি সফলভাবে মুছে ফেলা হয়েছে!</b>`, {
        reply_markup: getSocialMenuKeyboard()
      });
    }
    return;
  }

  // Social Add Handler
  if (data === 'soc_add') {
    userStates[chatId] = { step: 'idle' };
    const platButtons = [
      [
        { text: '📘 Facebook', callback_data: 'soc_new_plat:facebook' },
        { text: '✈️ Telegram', callback_data: 'soc_new_plat:telegram' }
      ],
      [
        { text: '🔴 YouTube', callback_data: 'soc_new_plat:youtube' },
        { text: '📸 Instagram', callback_data: 'soc_new_plat:instagram' }
      ],
      [
        { text: '✖️ Twitter / X', callback_data: 'soc_new_plat:twitter' },
        { text: '🐙 GitHub', callback_data: 'soc_new_plat:github' }
      ],
      [
        { text: '🔗 অন্যান্য / Custom লিংক', callback_data: 'soc_new_plat:custom' }
      ],
      [
        { text: '🔙 সোশ্যাল মেন্যু', callback_data: 'menu_social' }
      ]
    ];
    await sendTelegramMessage(
      chatId,
      `➕ <b>নতুন সোশ্যাল লিঙ্ক যোগ করুন</b>\n\n📌 অনুগ্রহ করে প্ল্যাটফর্ম নির্বাচন করুন:`,
      { reply_markup: { inline_keyboard: platButtons } }
    );
    return;
  }

  if (data.startsWith('soc_new_plat:')) {
    const platform = data.replace('soc_new_plat:', '') as SocialLink['platform'];
    const defaultTitles: Record<string, { title: string; subtitle: string; btn: string }> = {
      facebook: { title: 'Facebook Profile / Page', subtitle: 'অফিসিয়াল ফেসবুক প্রোফাইল', btn: 'যুক্ত হোন' },
      telegram: { title: 'Telegram Channel / Group', subtitle: 'টেলিগ্রাম চ্যানেল', btn: 'যুক্ত হোন' },
      youtube: { title: 'YouTube Channel', subtitle: 'অফিসিয়াল ইউটিউব চ্যানেল', btn: 'সাবস্ক্রাইব' },
      instagram: { title: 'Instagram Profile', subtitle: 'ইনস্টাগ্রাম ফটো ও রিলস', btn: 'ফলো করুন' },
      twitter: { title: 'X (Twitter) Profile', subtitle: '乂 প্রোফাইল', btn: 'ফলো করুন' },
      github: { title: 'GitHub Profile', subtitle: 'ওপেন সোর্স প্রজেক্ট', btn: 'ফলো করুন' },
      custom: { title: 'Social Link', subtitle: 'কানেক্ট থাকুন', btn: 'ভিজিট করুন' }
    };
    const def = defaultTitles[platform] || defaultTitles.custom;
    userStates[chatId] = {
      step: 'add_social_url',
      tempData: {
        platform,
        title: def.title,
        subtitle: def.subtitle,
        buttonText: def.btn
      }
    };
    await sendTelegramMessage(
      chatId,
      `🔗 <b>আপনার ${platform} এর সম্পূর্ণ লিঙ্ক (URL) লিখে পাঠান:</b>\n\n<i>(যেমন: https://... বা username)</i>`
    );
    return;
  }

  // Contact edits
  if (data === 'contact_edit_wa') {
    userStates[chatId] = { step: 'edit_contact_whatsapp' };
    const contact = getContactInfo();
    await sendTelegramMessage(
      chatId,
      `📱 <b>নতুন WhatsApp নম্বর দিন:</b>\n\nবর্তমান নম্বর: <code>${escapeHtml(contact.whatsappNumber)}</code>\n\nআন্তর্জাতিক কোডসহ নম্বরটি লিখে পাঠান:\n<i>(যেমন: +8801778526313)</i>`
    );
    return;
  }

  if (data === 'contact_edit_wa_msg') {
    userStates[chatId] = { step: 'edit_contact_whatsapp_msg' };
    const contact = getContactInfo();
    await sendTelegramMessage(
      chatId,
      `💬 <b>WhatsApp এ কেউ ক্লিক করলে স্বয়ংক্রিয় যে মেসেজটি টাইপ হবে তা লিখুন:</b>\n\nবর্তমান মেসেজ: <code>${escapeHtml(contact.whatsappMessage)}</code>`
    );
    return;
  }

  if (data === 'contact_edit_email') {
    userStates[chatId] = { step: 'edit_contact_email' };
    const contact = getContactInfo();
    await sendTelegramMessage(
      chatId,
      `✉️ <b>নতুন ইমেইল ঠিকানা দিন:</b>\n\nবর্তমান ইমেইল: <code>${escapeHtml(contact.email)}</code>\n\nইমেইল লিখে পাঠান:`
    );
    return;
  }

  if (data === 'contact_edit_note') {
    userStates[chatId] = { step: 'edit_contact_note' };
    const contact = getContactInfo();
    await sendTelegramMessage(
      chatId,
      `📝 <b>যোগাযোগ বক্সের নিচে দেখানো কোটেশন বা বার্তাটি লিখুন:</b>\n\nবর্তমান: <i>"${escapeHtml(contact.customNote)}"</i>`
    );
    return;
  }

  // Service actions
  if (data === 'cmd_list') {
    await handleListCommand(chatId);
    return;
  }

  if (data === 'cmd_add') {
    userStates[chatId] = { step: 'add_title', tempData: {} };
    await sendTelegramMessage(chatId, `➕ <b>নতুন সাভিস যোগ (ধাপ ১/৪)</b>\n\n📌 অনুগ্রহ করে সাভিসের নাম (Title) লিখুন:`);
    return;
  }

  if (data === 'cmd_edit') {
    await handleEditCommand(chatId);
    return;
  }

  if (data === 'cmd_delete') {
    await handleDeleteCommand(chatId);
    return;
  }

  // Service Edit Item
  if (data.startsWith('srv_edit:')) {
    const serviceId = data.replace('srv_edit:', '');
    const services = getServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    await sendTelegramMessage(
      chatId,
      `✏️ <b>সাভিস:</b> <b>${escapeHtml(service.title)}</b>\n\nকোনটি এডিট করবেন?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📌 নাম পরিবর্তন', callback_data: `srv_fld:title:${service.id}` },
              { text: '🔗 লিংক পরিবর্তন', callback_data: `srv_fld:linkUrl:${service.id}` }
            ],
            [
              { text: '🖼️ ছবি পরিবর্তন', callback_data: `srv_fld:imageUrl:${service.id}` },
              { text: '🏷️ সাবটাইটেল পরিবর্তন', callback_data: `srv_fld:subtitle:${service.id}` }
            ],
            [{ text: '🔙 সাভিস মেন্যু', callback_data: 'menu_services' }]
          ]
        }
      }
    );
    return;
  }

  if (data.startsWith('srv_fld:')) {
    const parts = data.split(':');
    const field = parts[1];
    const serviceId = parts[2];
    userStates[chatId] = { step: 'edit_service_val', tempData: { serviceId, field } };
    await sendTelegramMessage(chatId, `✍️ নতুন মান লিখে পাঠান:`);
    return;
  }

  // Service Delete Confirm
  if (data.startsWith('srv_del:')) {
    const serviceId = data.replace('srv_del:', '');
    const services = getServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const filtered = services.filter(s => s.id !== serviceId);
    saveServices(filtered);
    addLog('delete', 'Telegram Bot', `সাভিস ডিলিট: ${service.title}`);
    await sendTelegramMessage(
      chatId,
      `🗑️ <b>'${escapeHtml(service.title)}' সাভিসটি মুছে ফেলা হয়েছে!</b>`,
      { reply_markup: getServicesMenuKeyboard() }
    );
    return;
  }
} catch (err) {
  console.error('Error in handleCallbackQuery:', err);
}
}

// Telegram Long Polling Loop & Resilience Infrastructure
declare global {
  var __telegram_polling_active: boolean | undefined;
}

const botStateInternal = {
  isPolling: false,
  offset: 0,
  errorsCount: 0,
  botUsername: '',
  botFirstName: '',
  lastActiveTimestamp: Date.now()
};

// Webhook endpoint for Telegram Updates
app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    if (update && typeof update === 'object') {
      botStateInternal.lastActiveTimestamp = Date.now();
      if (update.callback_query) {
        await handleCallbackQuery(update.callback_query);
      } else if (update.message) {
        const msg = update.message;
        const chatId = String(msg.chat.id);
        const sender = msg.from?.first_name || 'User';

        if (msg.photo && Array.isArray(msg.photo) && msg.photo.length > 0) {
          const state = userStates[chatId];
          if (state && (
            state.step === 'add_image' ||
            state.step === 'edit_service_val' ||
            state.step === 'prof_edit_avatar' ||
            state.step === 'prof_edit_banner' ||
            state.step === 'admin_wizard_logo' ||
            state.step === 'client_srv_image' ||
            state.step === 'client_prof_avatar' ||
            state.step === 'client_prof_banner'
          )) {
            const bestPhoto = msg.photo[msg.photo.length - 1];
            const fileInfo = await telegramRequest('getFile', { file_id: bestPhoto.file_id });
            if (fileInfo.ok && fileInfo.result?.file_path) {
              const directPhotoUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.result.file_path}`;
              await handleUserMessage(chatId, directPhotoUrl, sender);
            }
          }
        } else if (msg.text) {
          await handleUserMessage(chatId, msg.text, sender);
        }
      }
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(200).json({ ok: true });
  }
});

let currentPollAbortController: AbortController | null = null;

async function startTelegramPolling() {
  if (botState.isWebhookMode) {
    console.log('🌐 Telegram Bot is in Webhook mode. Skipping long polling start.');
    return;
  }

  if (globalThis.__telegram_polling_active && botState.isPolling) {
    console.log('🤖 Telegram polling already active. Skipping duplicate instance.');
    return;
  }
  
  if (currentPollAbortController) {
    try {
      currentPollAbortController.abort();
    } catch {}
    currentPollAbortController = null;
  }

  globalThis.__telegram_polling_active = true;
  botState.isPolling = true;

  try {
    const delCtrl = new AbortController();
    const delTimer = setTimeout(() => delCtrl.abort(), 10000);
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=true`, {
      method: 'POST',
      signal: delCtrl.signal
    }).catch(() => {});
    clearTimeout(delTimer);

    const meRes = await telegramRequest('getMe', {});
    if (meRes.ok && meRes.result) {
      botState.botUsername = meRes.result.username;
      botState.botFirstName = meRes.result.first_name;
      console.log(`🤖 Telegram Bot connected as @${botState.botUsername} (${botState.botFirstName}) via Long Polling`);
    }
  } catch (err) {
    console.error('Telegram bot init error:', err);
  }

  (async () => {
    while (botState.isPolling && !botState.isWebhookMode) {
      try {
        botStateInternal.lastActiveTimestamp = Date.now();
        currentPollAbortController = new AbortController();
        const fetchTimeoutId = setTimeout(() => {
          try {
            currentPollAbortController?.abort();
          } catch {}
        }, 18000);

        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${botState.offset}&timeout=10`,
          {
            method: 'GET',
            signal: currentPollAbortController.signal
          }
        );
        clearTimeout(fetchTimeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle 409 Conflict (another instance running)
        if (!data.ok && data.error_code === 409) {
          console.warn('⚠️ Telegram 409 Conflict: Another bot instance is polling. Resetting offset & waiting...');
          botState.offset = 0;
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            botState.offset = update.update_id + 1;
            botStateInternal.lastActiveTimestamp = Date.now();
            try {
              if (update.callback_query) {
                await handleCallbackQuery(update.callback_query);
                continue;
              }

              if (update.message) {
                const msg = update.message;
                const chatId = String(msg.chat.id);
                const sender = msg.from?.first_name || 'User';

                // Photo support
                if (msg.photo && Array.isArray(msg.photo) && msg.photo.length > 0) {
                  const state = userStates[chatId];
                  if (state && (
                    state.step === 'add_image' ||
                    state.step === 'edit_service_val' ||
                    state.step === 'prof_edit_avatar' ||
                    state.step === 'prof_edit_banner' ||
                    state.step === 'admin_wizard_logo' ||
                    state.step === 'client_srv_image' ||
                    state.step === 'client_prof_avatar' ||
                    state.step === 'client_prof_banner'
                  )) {
                    const bestPhoto = msg.photo[msg.photo.length - 1];
                    const fileInfo = await telegramRequest('getFile', { file_id: bestPhoto.file_id });
                    if (fileInfo.ok && fileInfo.result?.file_path) {
                      const directPhotoUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.result.file_path}`;
                      await handleUserMessage(chatId, directPhotoUrl, sender);
                      continue;
                    }
                  }
                }

                if (msg.text) {
                  await handleUserMessage(chatId, msg.text, sender);
                }
              }
            } catch (updateErr) {
              console.error('Error processing update item:', updateErr);
            }
          }
        }
        botState.errorsCount = 0;
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          botState.errorsCount++;
          console.warn(`⚠️ Telegram polling loop warning (${botState.errorsCount}):`, err?.message || err);
        }
        await new Promise(r => setTimeout(r, Math.min(botState.errorsCount * 1000, 5000)));
      }
      await new Promise(r => setTimeout(r, 500));
    }
  })();
}

// Watchdog timer: Auto-restarts Telegram polling if polling loop stops or hangs >25s (ONLY when not in Webhook mode)
setInterval(() => {
  if (botState.isWebhookMode) {
    return;
  }
  const isStale = Date.now() - botStateInternal.lastActiveTimestamp > 25000;
  if (!botState.isPolling || isStale) {
    console.log('🤖 Bot Watchdog: Polling inactive or stale (>25s). Force restarting Telegram bot...');
    if (currentPollAbortController) {
      try {
        currentPollAbortController.abort();
      } catch {}
      currentPollAbortController = null;
    }
    globalThis.__telegram_polling_active = false;
    botState.isPolling = false;
    startTelegramPolling().catch(e => console.error('Watchdog restart error:', e));
  }
}, 8000);

// Keep-alive internal self pinger to prevent Node process idle suspension
setInterval(() => {
  fetch(`http://localhost:${PORT}/api/health`).catch(() => {});
}, 15000);

// Setup Express + Vite Server
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Telegram Bot Master Controller Active for Admin: ${TELEGRAM_ADMIN_CHAT_ID}`);

    // Check existing Webhook status on startup
    try {
      const webhookStatus = await getTelegramWebhookStatus();
      if (webhookStatus.ok && webhookStatus.result?.url) {
        if (webhookStatus.result.url.includes('ais-dev-') || webhookStatus.result.url.includes('ais-pre-') || webhookStatus.result?.last_error_message) {
          console.log('🔄 Dev preview Webhook or blocked URL detected. Resetting to active Long Polling mode...');
          await deleteTelegramWebhook();
        } else {
          botState.isWebhookMode = true;
          botState.isPolling = false;
          console.log(`🌐 Telegram Webhook active on startup: ${webhookStatus.result.url}`);
        }
      } else {
        startTelegramPolling();
      }
    } catch {
      startTelegramPolling();
    }
  });
}

setupServer();
