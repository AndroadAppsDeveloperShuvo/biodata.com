import { HighlightService, PersonalInfo, SocialLink, Badge, ContactInfo } from '../types/bio';

// No hardcoded default services - fully dynamic from Telegram Bot / Database
export const INITIAL_SERVICES: HighlightService[] = [];

export const PROFILE_INFO: PersonalInfo = {
  name: "⚡ 乂 ＳＨＵＶＯ 乂 ⚡",
  handle: "@shuvo_bhai_444",
  title: "💻 Full-Stack Developer",
  bio: "যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন।",
  location: "Bangladesh",
  avatarUrl: "https://i.ibb.co/bRWhx1Lf/4880.jpg",
  bannerUrl: "https://simpleprogrammer.com/wp-content/uploads/2023/05/Coding-Desk.jpg",
  avatarShape: "squircle",
  verifiedBadge: true,
  onlineStatus: "online",
  customStatusText: ""
};

// No hardcoded badges - fully dynamic from Telegram Bot / Database
export const BADGES: Badge[] = [];

// No hardcoded social links - fully dynamic from Telegram Bot / Database
export const SOCIAL_LINKS: SocialLink[] = [];

export const CONTACT_INFO: ContactInfo = {
  enabled: true,
  whatsappNumber: "+8801778526313",
  whatsappMessage: "Hi Developer Shuvo, I came from your website!",
  email: "freefirelover2111887942@gmail.com",
  telegramUsername: "djhakar007ff",
  customNote: "যেকোনো প্রজেক্ট বা প্রয়োজনে সরাসরি যোগাযোগ করুন।"
};
