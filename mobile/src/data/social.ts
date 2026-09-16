/** Feed, post detail, friends, clubs and the club room. */

import { colors } from '../theme/tokens';

export type FeedPost = {
  name: string;
  initials: string;
  level: string;
  meta: string;
  time: string;
  text: string;
  card?: { kicker: string; title: string; sub: string; gradient: readonly [string, string] };
  likes: string;
  comments: string;
  cta: string;
  avatar: readonly [string, string];
};

export const FEED: FeedPost[] = [
  {
    name: 'Gözde',
    initials: 'GÖ',
    level: 'B2',
    meta: 'Lv 31 · Altın Lig',
    time: '12 dk',
    text: 'Bugün 50 yeni kelime öğrendim. Seyahat modülünü bitirdim, sırada iş İngilizcesi var 🎯',
    card: {
      kicker: 'BAŞARIM',
      title: '1.000 Kelime',
      sub: 'Koleksiyon rozeti açıldı',
      gradient: ['rgba(124,92,255,.3)', 'rgba(34,211,238,.16)'],
    },
    likes: '48',
    comments: '12',
    cta: 'Düelloya çağır',
    avatar: [colors.secondary, colors.accent],
  },
  {
    name: 'Mert',
    initials: 'ME',
    level: 'B1+',
    meta: 'Lv 31 · Altın Lig',
    time: '1 sa',
    text: '"I have been working here since 2020" ile "I worked here since 2020" arasındaki farkı nihayet anladım. Kimse bana bunu bu kadar net anlatmamıştı.',
    likes: '31',
    comments: '9',
    cta: 'Yorum yap',
    avatar: [colors.orange, colors.error],
  },
  {
    name: 'Elif',
    initials: 'EL',
    level: 'B2',
    meta: 'Lv 38 · Elmas Lig',
    time: '3 sa',
    text: 'Harf Arenası hayatta kalma modunda 28 kelime! Rekor kırdım 🔥',
    card: {
      kicker: 'SKOR',
      title: '28 kelime · 1.420 XP',
      sub: 'Hayatta Kalma · kişisel rekor',
      gradient: ['rgba(46,107,255,.28)', 'rgba(124,92,255,.18)'],
    },
    likes: '126',
    comments: '34',
    cta: 'Skoru geç',
    avatar: [colors.secondary, colors.primary],
  },
];

export const SOCIAL_TABS = ['Akış', 'Arkadaşlar', 'Kulüpler'];

/** Post detail screen. */
export const POST = {
  author: {
    name: 'Gözde',
    initials: 'GÖ',
    level: 'B2',
    meta: 'Lv 31 · 🔥 58 gün · Altın Lig',
    avatar: [colors.secondary, colors.accent] as const,
  },
  text: 'Bugün 50 yeni kelime öğrendim. Seyahat modülünü bitirdim, sırada iş İngilizcesi var 🎯',
  achievement: {
    kicker: 'BAŞARIM',
    title: '1.000 Kelime',
    sub: 'Öğrenenlerin %8’i bu rozete sahip',
    glyph: '🏅',
  },
  commentCount: 'Yorumlar · 12',
  comments: [
    {
      name: 'Mert',
      initials: 'ME',
      time: '8 dk',
      text: 'Tebrikler! İş İngilizcesi ünitesinde görüşürüz 💪',
      avatar: [colors.orange, colors.error] as const,
    },
    {
      name: 'Elif',
      initials: 'EL',
      time: '21 dk',
      text: 'Hangi modülle başladın? Ben de seyahat bitirdim.',
      avatar: [colors.secondary, colors.accent] as const,
    },
    {
      name: 'Deniz',
      initials: 'DE',
      time: '34 dk',
      text: '50 kelime çok iyi, benim rekorum 32 😄',
      avatar: [colors.success, colors.accent] as const,
    },
  ],
  toasts: {
    follow: { title: 'Gözde takip ediliyor', note: 'Etkinlikleri akışında görünecek' },
    unfollow: { title: 'Takipten çıkıldı', note: 'Etkinlikleri akışında görünecek' },
    comment: { title: 'Yorum alanı açıldı', note: 'Klavye ile yanıt yaz' },
  },
};

export const FRIEND_TABS = ['Arkadaşlar · 48', 'Takipçi · 126', 'Takip · 92'];

export type Friend = {
  name: string;
  initials: string;
  level: string;
  activity: string;
  online: boolean;
  avatar: readonly [string, string];
  action: 'Düello' | 'Dürt' | 'Takip et';
};

export const FRIENDS: Friend[] = [
  {
    name: 'Gözde',
    initials: 'GÖ',
    level: 'B2',
    activity: 'Az önce 320 XP kazandı',
    online: true,
    avatar: [colors.secondary, colors.accent],
    action: 'Düello',
  },
  {
    name: 'Mert',
    initials: 'ME',
    level: 'B1+',
    activity: 'Ünite 9 · Modals çalışıyor',
    online: true,
    avatar: [colors.orange, colors.error],
    action: 'Düello',
  },
  {
    name: 'Elif',
    initials: 'EL',
    level: 'B2',
    activity: '2 saat önce · 28 kelime rekoru',
    online: false,
    avatar: [colors.secondary, colors.primary],
    action: 'Düello',
  },
  {
    name: 'Deniz',
    initials: 'DE',
    level: 'B1',
    activity: 'Dün · Hayatta Kalma oynadı',
    online: false,
    avatar: [colors.success, colors.accent],
    action: 'Düello',
  },
  {
    name: 'Kaan',
    initials: 'KA',
    level: 'B2',
    activity: '3 gündür çevrimdışı',
    online: false,
    avatar: [colors.primary, colors.accent],
    action: 'Dürt',
  },
  {
    name: 'Ayşe',
    initials: 'AY',
    level: 'A2+',
    activity: 'Yeni katıldı · selam ver',
    online: true,
    avatar: [colors.warning, colors.error],
    action: 'Takip et',
  },
];

/** Duel invitation banner, shown on home and friends. */
export const DUEL_INVITE = {
  title: 'Gözde seni düelloya çağırdı',
  sub: '"Skorumu geç." · 2 dk önce',
  initials: 'GÖ',
  accept: 'KABUL ET',
  acceptLong: 'DÜELLOYU KABUL ET',
};

export type Club = {
  glyph: string;
  name: string;
  meta: string;
  tag: string;
  tint: string;
  cta: string;
};

export const CLUBS: Club[] = [
  { glyph: '💻', name: 'Developers English', meta: '12.480 üye · 248K XP', tag: 'SENİN', tint: colors.primary, cta: 'Aç' },
  { glyph: '✈', name: 'Travel English', meta: '8.240 üye · 186K XP', tag: 'POPÜLER', tint: colors.accent, cta: 'Katıl' },
  { glyph: '💼', name: 'Business English', meta: '6.910 üye · 162K XP', tag: '', tint: colors.secondary, cta: 'Katıl' },
  { glyph: '🎮', name: 'Gamers', meta: '15.320 üye · 301K XP', tag: 'AKTİF', tint: colors.success, cta: 'Katıl' },
  { glyph: '🎬', name: 'Movie English', meta: '4.180 üye · 88K XP', tag: '', tint: colors.warning, cta: 'Katıl' },
  { glyph: '🌱', name: 'English Beginners', meta: '21.640 üye · 402K XP', tag: 'A1-A2', tint: colors.orange, cta: 'Katıl' },
];

export const CLUB_DETAIL = {
  glyph: '💻',
  name: 'Developers English',
  meta: '12.480 üye · 248.600 haftalık XP',
  description:
    'Code review, stand-up ve teknik mülakat İngilizcesi. Günlük görev + haftalık turnuva.',
  dailyTask: {
    title: 'Günün görevi',
    sub: 'Stand-up’ta dünkü işini 3 cümleyle anlat',
    cta: 'Yap',
  },
  stats: [
    { value: '#3', label: 'kulüp sırası', tint: colors.accent },
    { value: '842', label: 'senin katkın', tint: colors.secondary },
    { value: '2 gün', label: 'turnuvaya', tint: colors.warning },
  ],
  board: [
    { rank: '1', name: 'Jonas', initials: 'JO', xp: '12.480', avatar: [colors.secondary, colors.accent] as const },
    { rank: '2', name: 'Priya', initials: 'PR', xp: '11.240', avatar: [colors.primary, colors.accent] as const },
    { rank: '3', name: 'Sen', initials: 'A', xp: '842', avatar: [colors.primary, colors.secondary] as const },
    { rank: '4', name: 'Tomás', initials: 'TO', xp: '780', avatar: [colors.warning, colors.error] as const },
  ],
  chat: [
    { name: 'Priya', initials: 'PR', text: 'Anyone up for a mock stand-up at 8pm?', avatar: [colors.primary, colors.accent] as const },
    { name: 'Jonas', initials: 'JO', text: 'I can join. Let me prepare 3 sentences.', avatar: [colors.secondary, colors.accent] as const },
    { name: 'Sen', initials: 'A', text: 'Count me in — I need speaking practice.', avatar: [colors.primary, colors.secondary] as const },
  ],
  toasts: {
    joined: { title: 'Kulübe katıldın', note: 'Developers English' },
    left: { title: 'Kulüpten ayrıldın', note: 'Developers English' },
  },
};
