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

// Storage directory & files
const DATA_DIR = path.resolve(process.cwd(), 'data');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');
const SOCIAL_FILE = path.join(DATA_DIR, 'social.json');
const CONTACT_FILE = path.join(DATA_DIR, 'contact.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

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

// Initial default services
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

// Initial default contact info
const DEFAULT_CONTACT: ContactInfo = {
  enabled: true,
  whatsappNumber: "+8801778526313",
  whatsappMessage: "𝐻𝐼々ᗪᴇᴠʟᴏᴘᴇʀ—͟͞Sʜᴜᴠᴏ...𝐼 𝐜𝐚𝐦𝐞 𝐟𝐫𝐨𝐦 𝐘𝐨𝐮𝐫 𝘄𝗲𝗯𝘀𝗶𝘁𝗲...𝐼 𝘄𝗮𝗻𝘁  𝗧𝗼 𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝘄𝗶𝘁𝗵 𝐘𝐨𝐮 👨‍💻",
  email: "freefirelover2111887942@gmail.com",
  telegramUsername: "djhakar007ff",
  customNote: "যেকোনো প্রজেক্ট, কলাবোরেশন বা যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন।"
};

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
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

initDataStore();

// Read / Write Helpers
function getServices(): HighlightService[] {
  try {
    return JSON.parse(fs.readFileSync(SERVICES_FILE, 'utf-8'));
  } catch {
    return DEFAULT_SERVICES;
  }
}

function saveServices(services: HighlightService[]): boolean {
  try {
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2), 'utf-8');
    notifySSE({ type: 'services_updated', data: services });
    return true;
  } catch (err) {
    console.error('Error saving services:', err);
    return false;
  }
}

function getSocialLinks(): SocialLink[] {
  try {
    return JSON.parse(fs.readFileSync(SOCIAL_FILE, 'utf-8'));
  } catch {
    return DEFAULT_SOCIAL;
  }
}

function saveSocialLinks(links: SocialLink[]): boolean {
  try {
    fs.writeFileSync(SOCIAL_FILE, JSON.stringify(links, null, 2), 'utf-8');
    notifySSE({ type: 'social_updated', data: links });
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
    return true;
  } catch (err) {
    console.error('Error saving contact info:', err);
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
    services: getServices(),
    socialLinks: getSocialLinks(),
    contact: getContactInfo()
  });
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
    | 'add_confirm'
    | 'edit_service_val'
    // Social flows
    | 'edit_social_url'
    | 'edit_social_title'
    | 'edit_social_subtitle'
    | 'edit_social_button'
    | 'add_social_platform'
    | 'add_social_title'
    | 'add_social_url'
    | 'add_social_button'
    // Contact flows
    | 'edit_contact_whatsapp'
    | 'edit_contact_whatsapp_msg'
    | 'edit_contact_email'
    | 'edit_contact_note';
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

async function sendTelegramMessage(chatId: string | number, text: string, extra: any = {}) {
  return await telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    ...extra
  });
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return await telegramRequest('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text
  });
}

// Main Menu Keyboard
function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🌐 সোশ্যাল মিডিয়া লিংক (5)', callback_data: 'menu_social' },
        { text: '📞 সরাসরি যোগাযোগ (WhatsApp/Email)', callback_data: 'menu_contact' }
      ],
      [
        { text: '🛠️ সাভিস সমূহ (১২টি)', callback_data: 'menu_services' },
        { text: '📋 সম্পূর্ণ বায়ো প্রিভিউ', callback_data: 'cmd_full_summary' }
      ],
      [
        { text: '🌐 ওয়েবসাইট লাইভ দেখুন', url: 'https://androadappsdevelopershuvo.github.io/biodata.com' }
      ]
    ]
  };
}

// Services Menu
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

// Social Links Menu
function getSocialMenuKeyboard() {
  const links = getSocialLinks();
  const buttons: any[] = [];

  links.forEach(l => {
    const icon = l.platform === 'facebook' ? '📘'
      : l.platform === 'telegram' ? '✈️'
      : l.platform === 'youtube' ? '🔴'
      : l.platform === 'instagram' ? '📸'
      : l.platform === 'twitter' ? '✖️' : '🔗';
    const status = l.enabled ? '🟢' : '⚪ (লুকানো)';
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

  // Quick Command: /start or /help
  if (trimmed === '/start' || trimmed === '/help' || trimmed.toLowerCase() === 'hi' || trimmed.toLowerCase() === 'hello') {
    userStates[chatId] = { step: 'idle' };
    addLog('start', senderName, '/start কমান্ড রান করা হয়েছে');
    const msg = `👋 আসসালামু আলাইকুম *⚡ 乂 ＳＨＵＶＯ 乂 ⚡*!\n\nআপনার অফিসিয়াল বায়ো ডাটা ওয়েবসাইটের *মাস্টার কন্ট্রোল বটে* স্বাগতম! 🚀\n\nআপনি এখান থেকে ওয়েবসাইটের:\n1️⃣ *সোশ্যাল মিডিয়া লিংক* (Facebook, Telegram, YouTube, Instagram, X)\n2️⃣ *সরাসরি যোগাযোগ* (WhatsApp নম্বর, মেসেজ ও ইমেইল)\n3️⃣ *হাইলাইটস ও সাভিস সমূহ* (QR Generator, PDF Converter ইত্যাদি)\nসবকিছু রিয়েল-টাইমে পরিবর্তন করতে পারবেন।\n\n👇 *নিচের অপশন থেকে নির্বাচন করুন:*`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getMainMenuKeyboard() });
    return msg;
  }

  // Quick Command: /social
  if (trimmed === '/social') {
    userStates[chatId] = { step: 'idle' };
    const msg = `🌐 *সোশ্যাল মিডিয়া প্ল্যাটফর্ম ও লিংক ম্যানেজমেন্ট*\n\nযেকোনো সোশ্যাল অ্যাকাউন্টের লিংক, নাম বা বাটন টেক্সট পরিবর্তন করতে নিচের তালিকা থেকে নির্বাচন করুন:`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getSocialMenuKeyboard() });
    return msg;
  }

  // Quick Command: /contact
  if (trimmed === '/contact') {
    userStates[chatId] = { step: 'idle' };
    const contact = getContactInfo();
    const msg = `📞 *সরাসরি যোগাযোগ সেটিংস:*\n\n📱 *WhatsApp নম্বর:* \`${contact.whatsappNumber}\`\n💬 *মেসেজ:* \`${contact.whatsappMessage}\`\n✉️ *ইমেইল:* \`${contact.email}\`\n📝 *কোট:* _"${contact.customNote}"_\n\n_কোন তথ্যটি পরিবর্তন করতে চান?_`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getContactMenuKeyboard() });
    return msg;
  }

  // Quick Direct Social Commands:
  // /fb [url]
  if (trimmed.startsWith('/fb ')) {
    const newUrl = trimmed.substring(4).trim();
    const links = getSocialLinks();
    const fb = links.find(l => l.platform === 'facebook');
    if (fb) {
      fb.url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      saveSocialLinks(links);
      addLog('edit', senderName, `ফেসবুক লিংক আপডেট: ${fb.url}`);
      const reply = `✅ *ফেসবুক লিংক সফলভাবে আপডেট হয়েছে!*\n\n🔗 ${fb.url}`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
      return reply;
    }
  }

  // /wa [number]
  if (trimmed.startsWith('/wa ')) {
    const newWa = trimmed.substring(4).trim();
    const contact = getContactInfo();
    contact.whatsappNumber = newWa;
    saveContactInfo(contact);
    addLog('edit', senderName, `WhatsApp নম্বর আপডেট: ${newWa}`);
    const reply = `✅ *হোয়াটসঅ্যাপ নম্বর সফলভাবে আপডেট হয়েছে!*\n\n📱 \`${newWa}\``;
    await sendTelegramMessage(chatId, reply, { reply_markup: getContactMenuKeyboard() });
    return reply;
  }

  // /email [email]
  if (trimmed.startsWith('/email ')) {
    const newEmail = trimmed.substring(7).trim();
    const contact = getContactInfo();
    contact.email = newEmail;
    saveContactInfo(contact);
    addLog('edit', senderName, `ইমেইল আপডেট: ${newEmail}`);
    const reply = `✅ *ইমেইল সফলভাবে আপডেট হয়েছে!*\n\n✉️ \`${newEmail}\``;
    await sendTelegramMessage(chatId, reply, { reply_markup: getContactMenuKeyboard() });
    return reply;
  }

  // /tg [url]
  if (trimmed.startsWith('/tg ')) {
    const newUrl = trimmed.substring(4).trim();
    const links = getSocialLinks();
    const tg = links.find(l => l.platform === 'telegram');
    if (tg) {
      tg.url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      saveSocialLinks(links);
      addLog('edit', senderName, `টেলিগ্রাম লিংক আপডেট: ${tg.url}`);
      const reply = `✅ *টেলিগ্রাম লিংক সফলভাবে আপডেট হয়েছে!*\n\n🔗 ${tg.url}`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
      return reply;
    }
  }

  // /yt [url]
  if (trimmed.startsWith('/yt ')) {
    const newUrl = trimmed.substring(4).trim();
    const links = getSocialLinks();
    const yt = links.find(l => l.platform === 'youtube');
    if (yt) {
      yt.url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      saveSocialLinks(links);
      addLog('edit', senderName, `ইউটিউব লিংক আপডেট: ${yt.url}`);
      const reply = `✅ *ইউটিউব চ্যানেল লিংক আপডেট হয়েছে!*\n\n🔗 ${yt.url}`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
      return reply;
    }
  }

  // /insta [url]
  if (trimmed.startsWith('/insta ')) {
    const newUrl = trimmed.substring(7).trim();
    const links = getSocialLinks();
    const insta = links.find(l => l.platform === 'instagram');
    if (insta) {
      insta.url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      saveSocialLinks(links);
      addLog('edit', senderName, `ইনস্টাগ্রাম লিংক আপডেট: ${insta.url}`);
      const reply = `✅ *ইনস্টাগ্রাম লিংক আপডেট হয়েছে!*\n\n🔗 ${insta.url}`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
      return reply;
    }
  }

  // /x [url]
  if (trimmed.startsWith('/x ')) {
    const newUrl = trimmed.substring(3).trim();
    const links = getSocialLinks();
    const xLink = links.find(l => l.platform === 'twitter');
    if (xLink) {
      xLink.url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
      saveSocialLinks(links);
      addLog('edit', senderName, `X (টুইটার) লিংক আপডেট: ${xLink.url}`);
      const reply = `✅ *X (টুইটার) লিংক আপডেট হয়েছে!*\n\n🔗 ${xLink.url}`;
      await sendTelegramMessage(chatId, reply, { reply_markup: getSocialMenuKeyboard() });
      return reply;
    }
  }

  // Quick Command: /services
  if (trimmed === '/services' || trimmed === '/service') {
    userStates[chatId] = { step: 'idle' };
    const msg = `🛠️ *সাভিস ম্যানেজমেন্ট*\n\nআপনার হাইলাইটস ও মোমেন্টসের সাভিস কার্ডসমূহ পরিচালনা করতে নির্বাচন করুন:`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getServicesMenuKeyboard() });
    return msg;
  }

  // Services commands
  if (trimmed === '/list') {
    return await handleListCommand(chatId);
  }

  if (trimmed === '/add') {
    userStates[chatId] = { step: 'add_title', tempData: {} };
    const msg = `➕ *নতুন সাভিস যোগ করুন (ধাপ ১/৪)*\n\n📌 অনুগ্রহ করে সাভিসের নাম (Title) লিখুন:`;
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
      services.unshift(newService);
      saveServices(services);
      addLog('add', senderName, `সরাসরি কমান্ডে সাভিস যোগ: ${title}`, title);

      const reply = `✅ *সাভিস সফলভাবে যোগ করা হয়েছে!*\n\n📌 *নাম:* ${title}\n🏷️ *ক্যাটাগরি:* ${subtitle}\n🔗 *লিংক:* ${linkUrl}`;
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
      link.url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      saveSocialLinks(links);
      addLog('edit', senderName, `${link.title} লিংক আপডেট: ${link.url}`);
      userStates[chatId] = { step: 'idle' };
      const msg = `✅ *${link.title} এর লিংক সফলভাবে আপডেট হয়েছে!*\n\n🔗 *নতুন লিংক:* ${link.url}\n\n_ওয়েবসাইটে তাৎক্ষণিকভাবে আপডেট হয়ে গেছে!_`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getSocialMenuKeyboard() });
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
      const msg = `✅ *টাইটেল সফলভাবে পরিবর্তন হয়েছে:*\n\n📌 "${link.title}"`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getSocialMenuKeyboard() });
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
      const msg = `✅ *সাব-টাইটেল সফলভাবে পরিবর্তন হয়েছে:*\n\n🏷️ "${link.subtitle}"`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getSocialMenuKeyboard() });
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
      const msg = `✅ *বাটন টেক্সট সফলভাবে পরিবর্তন হয়েছে:*\n\n🔘 [${link.buttonText}]`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getSocialMenuKeyboard() });
      return msg;
    }
  }

  // Edit Contact WhatsApp Number
  if (state.step === 'edit_contact_whatsapp') {
    const contact = getContactInfo();
    contact.whatsappNumber = trimmed;
    saveContactInfo(contact);
    addLog('edit', senderName, `WhatsApp নম্বর আপডেট: ${trimmed}`);
    userStates[chatId] = { step: 'idle' };
    const msg = `✅ *WhatsApp নম্বর সফলভাবে আপডেট হয়েছে!*\n\n📱 \`${contact.whatsappNumber}\`\n\n_ওয়েবসাইটে তাৎক্ষণিকভাবে আপডেট সম্পন্ন হয়েছে!_`;
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
    const msg = `✅ *WhatsApp ডিফল্ট মেসেজ সফলভাবে আপডেট হয়েছে!*\n\n💬 \`${contact.whatsappMessage}\``;
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
    const msg = `✅ *ইমেইল সফলভাবে আপডেট হয়েছে!*\n\n✉️ \`${contact.email}\``;
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
    const msg = `✅ *কোটেশন বার্তা সফলভাবে আপডেট হয়েছে!*\n\n📝 _"${contact.customNote}"_`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getContactMenuKeyboard() });
    return msg;
  }

  // Service Step 1: Title
  if (state.step === 'add_title') {
    state.tempData = { ...state.tempData, title: trimmed };
    state.step = 'add_subtitle';
    userStates[chatId] = state;
    const msg = `🏷️ *ধাপ ২/৪: সাব-টাইটেল বা ক্যাটাগরি*\n\nক্যাটাগরি বা সাব-টাইটেল লিখুন (যেমন: 'ফটো ও মেমোরিজ' বা 'ওয়েব টুলস'):`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  // Service Step 2: Subtitle
  if (state.step === 'add_subtitle') {
    state.tempData = { ...state.tempData, subtitle: trimmed || 'ফটো ও মেমোরিজ' };
    state.step = 'add_image';
    userStates[chatId] = state;
    const msg = `🖼️ *ধাপ ৩/৪: সাভিসের ছবির সরাসরি লিংক (Image URL)*:\n\nছবির ওয়েব লিংক লিখে পাঠান:`;
    await sendTelegramMessage(chatId, msg);
    return msg;
  }

  // Service Step 3: Image
  if (state.step === 'add_image') {
    state.tempData = { ...state.tempData, imageUrl: trimmed };
    state.step = 'add_link';
    userStates[chatId] = state;
    const msg = `🔗 *ধাপ ৪/৪: ক্লিক লিংক (Target URL)*:\n\nসাভিস কার্ডটিতে ক্লিক করলে কোন ঠিকানায় নিয়ে যাবে?`;
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
    services.unshift(newService);
    saveServices(services);
    addLog('add', senderName, `নতুন সাভিস যোগ: ${newService.title}`, newService.title);
    userStates[chatId] = { step: 'idle' };

    const msg = `🎉 *সাভিস সফলভাবে যুক্ত হয়েছে!*\n\n📌 *নাম:* ${newService.title}\n🏷️ *ক্যাটাগরি:* ${newService.subtitle}\n🔗 *লিংক:* ${newService.linkUrl}\n\n_ওয়েবসাইটে তাৎক্ষণিকভাবে লাইভ হয়ে গেছে!_`;
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

      const msg = `✅ *সাভিস সফলভাবে আপডেট হয়েছে!*\n\n📌 *নাম:* ${service.title}\n🏷️ *ক্যাটাগরি:* ${service.subtitle}\n🔗 *লিংক:* ${service.linkUrl}`;
      await sendTelegramMessage(chatId, msg, { reply_markup: getServicesMenuKeyboard() });
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
  let text = `📋 *আপনার মোট ${services.length}টি সাভিসের তালিকা:*\n\n`;
  services.forEach((s, idx) => {
    text += `*${idx + 1}.* [${s.title}](${s.linkUrl})\n🏷️ _${s.subtitle}_\n\n`;
  });
  await sendTelegramMessage(chatId, text, { reply_markup: getServicesMenuKeyboard() });
  return text;
}

async function handleEditCommand(chatId: string) {
  const services = getServices();
  const buttons = services.slice(0, 15).map((s, idx) => [
    { text: `${idx + 1}. ✏️ ${s.title.substring(0, 24)}`, callback_data: `srv_edit:${s.id}` }
  ]);
  buttons.push([{ text: '🔙 সাভিস মেন্যু', callback_data: 'menu_services' }]);

  const msg = `✏️ *কোন সাভিসটি এডিট করতে চান নির্বাচন করুন:*`;
  await sendTelegramMessage(chatId, msg, { reply_markup: { inline_keyboard: buttons } });
  return msg;
}

async function handleDeleteCommand(chatId: string) {
  const services = getServices();
  const buttons = services.slice(0, 15).map((s, idx) => [
    { text: `${idx + 1}. 🗑️ ${s.title.substring(0, 24)}`, callback_data: `srv_del:${s.id}` }
  ]);
  buttons.push([{ text: '🔙 সাভিস মেন্যু', callback_data: 'menu_services' }]);

  const msg = `🗑️ *কোন সাভিসটি ডিলিট করতে চান নির্বাচন করুন:*`;
  await sendTelegramMessage(chatId, msg, { reply_markup: { inline_keyboard: buttons } });
  return msg;
}

// Full Summary
async function sendFullSummary(chatId: string) {
  const social = getSocialLinks();
  const contact = getContactInfo();
  const services = getServices();

  let text = `📊 *ওয়েবসাইটের সম্পূর্ণ লাইভ কনফিগারেশন:*\n\n`;
  text += `🌐 *সোশ্যাল মিডিয়া (${social.length}টি):*\n`;
  social.forEach(s => {
    text += `• *${s.title}*: ${s.url} [${s.buttonText}]\n`;
  });

  text += `\n📞 *যোগাযোগ:*\n`;
  text += `• WhatsApp: \`${contact.whatsappNumber}\`\n`;
  text += `• Email: \`${contact.email}\`\n`;
  text += `• Note: "${contact.customNote}"\n`;

  text += `\n🛠️ *মোট সাভিস:* ${services.length} টি লাইভ\n`;

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
    await sendTelegramMessage(chatId, `🏠 *প্রধান মেন্যু:*\nকোন বিভাগটি পরিবর্তন করতে চান?`, {
      reply_markup: getMainMenuKeyboard()
    });
    return;
  }

  if (data === 'menu_social') {
    userStates[chatId] = { step: 'idle' };
    await sendTelegramMessage(
      chatId,
      `🌐 *সোশ্যাল মিডিয়া প্ল্যাটফর্ম ও লিংক:*\n\nযে অ্যাকাউন্টের লিংক বা বাটন পরিবর্তন করতে চান নির্বাচন করুন:`,
      { reply_markup: getSocialMenuKeyboard() }
    );
    return;
  }

  if (data === 'menu_contact') {
    userStates[chatId] = { step: 'idle' };
    const contact = getContactInfo();
    const msg = `📞 *সরাসরি যোগাযোগ সেটিংস:*\n\n📱 *WhatsApp:* \`${contact.whatsappNumber}\`\n💬 *বার্তা:* \`${contact.whatsappMessage}\`\n✉️ *ইমেইল:* \`${contact.email}\`\n📝 *কোট:* _"${contact.customNote}"_\n\n_কোনটি পরিবর্তন করতে চান?_`;
    await sendTelegramMessage(chatId, msg, { reply_markup: getContactMenuKeyboard() });
    return;
  }

  if (data === 'menu_services') {
    userStates[chatId] = { step: 'idle' };
    await sendTelegramMessage(
      chatId,
      `🛠️ *সাভিস ম্যানেজমেন্ট:*\nএকটি অপশন নির্বাচন করুন:`,
      { reply_markup: getServicesMenuKeyboard() }
    );
    return;
  }

  if (data === 'cmd_full_summary') {
    await sendFullSummary(chatId);
    return;
  }

  // Social Links Management
  if (data.startsWith('soc_manage:')) {
    const linkId = data.replace('soc_manage:', '');
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);

    if (!link) {
      await sendTelegramMessage(chatId, '❌ লিংক খুঁজে পাওয়া যায়নি!');
      return;
    }

    const msg = `⚙️ *ম্যানেজ করুন: ${link.title}*\n\n🔗 *বর্তমান লিংক:* ${link.url}\n🏷️ *সাব-টাইটেল:* ${link.subtitle}\n🔘 *বাটন টেক্সট:* [${link.buttonText}]\n👁️ *অবস্থা:* ${link.enabled ? '🟢 দৃশ্যমান (Active)' : '⚪ লুকানো (Hidden)'}\n\n_আপনি কোনটি পরিবর্তন করতে চান?_`;
    await sendTelegramMessage(chatId, msg, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔗 সরাসরি লিংক পরিবর্তন', callback_data: `soc_edit_url:${link.id}` },
            { text: '🔘 বাটন টেক্সট পরিবর্তন', callback_data: `soc_edit_btn:${link.id}` }
          ],
          [
            { text: '✏️ নাম / টাইটেল পরিবর্তন', callback_data: `soc_edit_title:${link.id}` },
            { text: '🏷️ সাব-টাইটেল পরিবর্তন', callback_data: `soc_edit_sub:${link.id}` }
          ],
          [
            { text: link.enabled ? '👁️ হাইড করুন' : '🟢 অন করুন', callback_data: `soc_toggle:${link.id}` },
            { text: '🔙 সোশ্যাল মেন্যু', callback_data: 'menu_social' }
          ]
        ]
      }
    });
    return;
  }

  if (data.startsWith('soc_edit_url:')) {
    const linkId = data.replace('soc_edit_url:', '');
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);
    userStates[chatId] = { step: 'edit_social_url', tempData: { linkId } };
    await sendTelegramMessage(
      chatId,
      `🔗 *${link?.title} এর নতুন লিংক লিখুন:*\n\nনতুন সম্পূর্ণ ওয়েব লিংক লিখে পাঠান:\n_(যেমন: https://facebook.com/... বা https://t.me/...)_`
    );
    return;
  }

  if (data.startsWith('soc_edit_title:')) {
    const linkId = data.replace('soc_edit_title:', '');
    userStates[chatId] = { step: 'edit_social_title', tempData: { linkId } };
    await sendTelegramMessage(chatId, `✏️ নতুন টাইটেল বা নাম লিখে পাঠান:`);
    return;
  }

  if (data.startsWith('soc_edit_sub:')) {
    const linkId = data.replace('soc_edit_sub:', '');
    userStates[chatId] = { step: 'edit_social_subtitle', tempData: { linkId } };
    await sendTelegramMessage(chatId, `🏷️ নতুন সাব-টাইটেল লিখে পাঠান:`);
    return;
  }

  if (data.startsWith('soc_edit_btn:')) {
    const linkId = data.replace('soc_edit_btn:', '');
    userStates[chatId] = { step: 'edit_social_button', tempData: { linkId } };
    await sendTelegramMessage(
      chatId,
      `🔘 *বাটনে কী লেখা থাকবে লিখে পাঠান:*\n_(যেমন: "যুক্ত হোন", "সাবস্ক্রাইব", "ফলো করুন", "ভিজিট করুন")_`
    );
    return;
  }

  if (data.startsWith('soc_toggle:')) {
    const linkId = data.replace('soc_toggle:', '');
    const links = getSocialLinks();
    const link = links.find(l => l.id === linkId);
    if (link) {
      link.enabled = !link.enabled;
      saveSocialLinks(links);
      addLog('edit', 'Telegram Bot', `${link.title} অবস্থা পরিবর্তন: ${link.enabled ? 'Active' : 'Hidden'}`);
      await sendTelegramMessage(
        chatId,
        `✅ *${link.title} এখন ${link.enabled ? '🟢 দৃশ্যমান' : '⚪ লুকানো'} করা হয়েছে!*`,
        { reply_markup: getSocialMenuKeyboard() }
      );
    }
    return;
  }

  // Contact edits
  if (data === 'contact_edit_wa') {
    userStates[chatId] = { step: 'edit_contact_whatsapp' };
    const contact = getContactInfo();
    await sendTelegramMessage(
      chatId,
      `📱 *নতুন WhatsApp নম্বর দিন:*\n\nবর্তমান নম্বর: \`${contact.whatsappNumber}\`\n\nআন্তর্জাতিক কোডসহ নম্বরটি লিখে পাঠান:\n_(যেমন: +8801778526313)_`
    );
    return;
  }

  if (data === 'contact_edit_wa_msg') {
    userStates[chatId] = { step: 'edit_contact_whatsapp_msg' };
    const contact = getContactInfo();
    await sendTelegramMessage(
      chatId,
      `💬 *WhatsApp এ কেউ ক্লিক করলে স্বয়ংক্রিয় যে মেসেজটি টাইপ হবে তা লিখুন:*\n\nবর্তমান মেসেজ: \`${contact.whatsappMessage}\``
    );
    return;
  }

  if (data === 'contact_edit_email') {
    userStates[chatId] = { step: 'edit_contact_email' };
    const contact = getContactInfo();
    await sendTelegramMessage(
      chatId,
      `✉️ *নতুন ইমেইল ঠিকানা দিন:*\n\nবর্তমান ইমেইল: \`${contact.email}\`\n\nইমেইল লিখে পাঠান:`
    );
    return;
  }

  if (data === 'contact_edit_note') {
    userStates[chatId] = { step: 'edit_contact_note' };
    const contact = getContactInfo();
    await sendTelegramMessage(
      chatId,
      `📝 *যোগাযোগ বক্সের নিচে দেখানো কোটেশন বা মেসেজটি লিখুন:*\n\nবর্তমান: "${contact.customNote}"`
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
    await sendTelegramMessage(chatId, `➕ *নতুন সাভিস যোগ (ধাপ ১/৪)*\n\n📌 অনুগ্রহ করে সাভিসের নাম (Title) লিখুন:`);
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
      `✏️ *সাভিস:* **${service.title}**\n\nকোনটি এডিট করবেন?`,
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
      `🗑️ *'${service.title}' সাভিসটি মুছে ফেলা হয়েছে!*`,
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
                if (state && (state.step === 'add_image' || state.step === 'edit_service_val')) {
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
