import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8649772073:AAHvhPRNE5pZmWPN1qU68z0ug3isdP7fNPg';
const TELEGRAM_ADMIN_CHAT_ID = String(process.env.TELEGRAM_CHAT_ID || '5440151107');

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
  platform: 'facebook' | 'telegram' | 'youtube' | 'instagram' | 'twitter' | 'github' | 'custom';
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

const DEFAULT_BADGES: BadgeItem[] = [
  { id: "b1", text: "⚡ Pro Gamer" },
  { id: "b2", text: "🔥 Shuvo Official" },
  { id: "b3", text: "💻 Developer" },
  { id: "b4", text: "🎧 Music Lover" },
  { id: "b5", text: "🇧🇩 Bangladesh" },
  { id: "b6", text: "💥 Free Fire Lover" },
  { id: "b7", text: "👨‍💻 Professional Web & Apps Developer" }
];

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
}

initDataStore();

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

async function syncToFirebase() {
  const cfg = getFirebaseConfig();
  if (!cfg.url || !cfg.url.startsWith('http')) return;
  const baseUrl = cfg.url.replace(/\/+$/, '');
  try {
    const payload = {
      profile: getProfileInfo(),
      badges: getBadges(),
      services: getServices(),
      socialLinks: getSocialLinks(),
      contact: getContactInfo(),
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

// Initial Firebase sync on startup
setTimeout(() => {
  syncToFirebase();
}, 2000);

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
app.get('/api/data', (req, res) => {
  res.json({
    success: true,
    profile: getProfileInfo(),
    badges: getBadges(),
    services: getServices(),
    socialLinks: getSocialLinks(),
    contact: getContactInfo()
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

app.post('/api/telegram/simulate', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });
  const reply = await handleUserMessage(TELEGRAM_ADMIN_CHAT_ID, text, 'Admin (Simulated)');
  res.json({ success: true, reply });
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
    | 'badge_edit_text';
  tempData?: any;
}

const userStates: Record<string, TelegramUserState> = {};

const botState = {
  isPolling: false,
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

// Telegram API Helper Functions
async function telegramRequest(method: string, body: any) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram ${method} failed:`, err);
    return { ok: false, error: String(err) };
  }
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

// Handle User Message Text
async function handleUserMessage(chatId: string, text: string, senderName: string = 'User') {
  const trimmed = text.trim();
  const state = userStates[chatId] || { step: 'idle' };

  // Quick Command: /start or /help or /status
  if (trimmed === '/start' || trimmed === '/help' || trimmed === '/status' || trimmed.toLowerCase() === 'hi' || trimmed.toLowerCase() === 'hello') {
    userStates[chatId] = { step: 'idle' };
    addLog('start', senderName, '/start কমান্ড রান করা হয়েছে');
    
    const profile = getProfileInfo();
    const services = getServices();
    const social = getSocialLinks();
    const badges = getBadges();
    const contact = getContactInfo();
    const fbCfg = getFirebaseConfig();

    const fbStatus = fbCfg.url ? `🟢 যুক্ত আছে (<code>${escapeHtml(fbCfg.url)}</code>)` : '⚪ যুক্ত নেই';

    const msg = `👋 আসসালামু আলাইকুম <b>${escapeHtml(profile.name)}</b>!\n\n`
      + `আপনার অফিসিয়াল বায়ো ডাটা ওয়েবসাইটের <b>মাস্টার কন্ট্রোল বটে</b> স্বাগতম! 🚀\n\n`
      + `📊 <b>বর্তমান সংরক্ষিত তথ্য:</b>\n`
      + `• 👤 নাম: <b>${escapeHtml(profile.name)}</b> (<code>${escapeHtml(profile.handle)}</code>)\n`
      + `• 💻 পদবী: ${escapeHtml(profile.title)}\n`
      + `• 🏷️ ব্যাজ: <b>${badges.length}</b> টি সক্রিয়\n`
      + `• 🌐 সোশ্যাল লিংক: <b>${social.length}</b> টি সক্রিয়\n`
      + `• 🛠️ মোট সাভিস: <b>${services.length}</b> টি লাইভ\n`
      + `• 📱 WhatsApp: <code>${escapeHtml(contact.whatsappNumber)}</code>\n`
      + `• ✉️ Email: <code>${escapeHtml(contact.email)}</code>\n`
      + `• 🔥 Firebase Realtime DB: ${fbStatus}\n\n`
      + `👇 <b>কী পরিবর্তন করতে চান নির্বাচন করুন:</b>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getMainMenuKeyboard() });
    return msg;
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
    prof.bannerUrl = trimmed;
    saveProfileInfo(prof);
    addLog('edit', senderName, `ব্যানার ছবি আপডেট`);
    userStates[chatId] = { step: 'idle' };

    const msg = `✅ <b>ব্যানার ছবি সফলভাবে আপডেট হয়েছে!</b>\n\n🏞️ <a href="${escapeHtml(prof.bannerUrl)}">নতুন ব্যানার দেখুন</a>`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getProfileMenuKeyboard() });
    return msg;
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
  const chatId = String(cb.message.chat.id);
  const data = cb.data;
  const cbId = cb.id;

  await answerCallbackQuery(cbId);

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
      `🖼️ <b>প্রোফাইল ছবি পরিবর্তন</b>\n\nবর্তমান ছবি: <a href="${escapeHtml(prof.avatarUrl)}">দেখুন</a>\n\n📷 আপনার পছন্দের প্রোফাইল ছবিটি সরাসরি এই চ্যাটে <b>ফটো হিসেবে সেন্ড করুন</b> অথবা ছবির <b>সরাসরি ওয়েব লিংক (URL)</b> লিখে পাঠান:`
    );
    return;
  }

  if (data === 'prof_edit_banner') {
    userStates[chatId] = { step: 'prof_edit_banner' };
    const prof = getProfileInfo();
    await sendTelegramMessage(
      chatId,
      `🏞️ <b>ব্যানার কভার ছবি পরিবর্তন</b>\n\nবর্তমান ব্যানার: <a href="${escapeHtml(prof.bannerUrl)}">দেখুন</a>\n\n📷 আপনার পছন্দের ব্যানার ছবিটি সরাসরি <b>ফটো হিসেবে সেন্ড করুন</b> অথবা ব্যানারের <b>সরাসরি ওয়েব লিংক (URL)</b> লিখে পাঠান:`
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
}

// Telegram Long Polling Loop
async function startTelegramPolling() {
  if (botState.isPolling) return;
  botState.isPolling = true;

  try {
    const meRes = await telegramRequest('getMe', {});
    if (meRes.ok) {
      botState.botUsername = meRes.result.username;
      botState.botFirstName = meRes.result.first_name;
      console.log(`🤖 Telegram Bot connected as @${botState.botUsername} (${botState.botFirstName})`);
    }
  } catch (err) {
    console.error('Telegram bot init error:', err);
  }

  (async () => {
    while (botState.isPolling) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${botState.offset}&timeout=25`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            botState.offset = update.update_id + 1;

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
                if (state && (state.step === 'add_image' || state.step === 'edit_service_val' || state.step === 'prof_edit_avatar' || state.step === 'prof_edit_banner')) {
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
          }
        }
        botState.errorsCount = 0;
      } catch (err) {
        botState.errorsCount++;
        await new Promise(r => setTimeout(r, Math.min(botState.errorsCount * 1500, 10000)));
      }
    }
  })();
}

startTelegramPolling();

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Telegram Bot Master Controller Active for Admin: ${TELEGRAM_ADMIN_CHAT_ID}`);
  });
}

setupServer();
