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

export interface Badge {
  id: string;
  text: string;
  color?: string;
}

export interface PersonalInfo {
  name: string;
  handle: string;
  title: string;
  bio: string;
  location: string;
  avatarUrl: string;
  bannerUrl: string;
  avatarShape?: 'squircle' | 'round';
  verifiedBadge?: boolean;
  onlineStatus?: 'online' | 'offline' | 'busy';
  customStatusText?: string;
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

export interface TelegramBotStatus {
  active: boolean;
  botUsername?: string;
  adminChatId: string;
  totalServices: number;
  lastUpdateAt?: string;
  logs: BotLog[];
}
