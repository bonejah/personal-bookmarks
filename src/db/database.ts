import Dexie, { type Table } from 'dexie';
import type { Bookmark, Category } from '../types/bookmark';

export class PersonalBookmarkDB extends Dexie {
  categories!: Table<Category, number>;
  bookmarks!: Table<Bookmark, number>;

  constructor() {
    super('PersonalBookmarkDB');
    this.version(1).stores({
      categories: '++id, &slug, name, isCustom, createdAt',
      bookmarks: '++id, url, categorySlug, platform, domain, isPinned, createdAt',
    });
  }
}

export const db = new PersonalBookmarkDB();

// Initial Default Categories
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  {
    slug: 'studies',
    name: 'Studies',
    description: 'Learning materials, courses & research papers',
    icon: 'GraduationCap',
    color: '#6366f1',
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    slug: 'news',
    name: 'News',
    description: 'Tech, global updates & media outlets',
    icon: 'Newspaper',
    color: '#f59e0b',
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    slug: 'ai',
    name: 'AI & Tools',
    description: 'Artificial intelligence platforms & prompt engineering',
    icon: 'Bot',
    color: '#a855f7',
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    slug: 'weather',
    name: 'Weather',
    description: 'Local & global weather forecasts, radar & climate',
    icon: 'CloudSun',
    color: '#38bdf8',
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    slug: 'work',
    name: 'Work & Career',
    description: 'Job applications, portfolio links & networking',
    icon: 'Briefcase',
    color: '#10b981',
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    slug: 'entertainment',
    name: 'Entertainment',
    description: 'Videos, YouTube channels, music & podcasts',
    icon: 'Tv',
    color: '#ec4899',
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    slug: 'dev',
    name: 'Dev & Tech',
    description: 'GitHub repos, documentation & coding tools',
    icon: 'Code2',
    color: '#3b82f6',
    isCustom: false,
    createdAt: Date.now(),
  },
];

// Initial Seed Bookmarks (for impressive first load experience)
export const DEFAULT_BOOKMARKS: Omit<Bookmark, 'id'>[] = [
  {
    url: 'https://youtube.com/@Fireship',
    title: 'Fireship • YouTube Channel',
    domain: 'youtube.com',
    platform: 'youtube',
    platformDetail: 'Channel: @Fireship',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
    categorySlug: 'entertainment',
    description: 'High-energy code tutorials and tech news.',
    tags: ['coding', 'youtube', 'tech'],
    isPinned: true,
    createdAt: Date.now() - 10000,
    updatedAt: Date.now() - 10000,
  },
  {
    url: 'https://github.com/facebook/react',
    title: 'facebook/react',
    domain: 'github.com',
    platform: 'github',
    platformDetail: 'GitHub Repo: facebook/react',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
    categorySlug: 'dev',
    description: 'The library for web and native user interfaces.',
    tags: ['react', 'open-source', 'frontend'],
    isPinned: true,
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 20000,
  },
  {
    url: 'https://chatgpt.com',
    title: 'ChatGPT',
    domain: 'chatgpt.com',
    platform: 'general',
    platformDetail: 'OpenAI Platform',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=128',
    categorySlug: 'ai',
    description: 'Conversational AI assistant by OpenAI.',
    tags: ['ai', 'assistant', 'productivity'],
    isPinned: false,
    createdAt: Date.now() - 30000,
    updatedAt: Date.now() - 30000,
  },
  {
    url: 'https://weather.com',
    title: 'Weather Channel Forecast',
    domain: 'weather.com',
    platform: 'weather',
    platformDetail: 'Weather Service',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=weather.com&sz=128',
    categorySlug: 'weather',
    description: 'Global weather updates and storm tracking.',
    tags: ['weather', 'forecast'],
    isPinned: false,
    createdAt: Date.now() - 40000,
    updatedAt: Date.now() - 40000,
  },
  {
    url: 'https://news.ycombinator.com',
    title: 'Hacker News',
    domain: 'ycombinator.com',
    platform: 'news',
    platformDetail: 'Tech & Startup News',
    faviconUrl: 'https://www.google.com/s2/favicons?domain=ycombinator.com&sz=128',
    categorySlug: 'news',
    description: 'Social news website focusing on computer science & entrepreneurship.',
    tags: ['news', 'startups', 'tech'],
    isPinned: false,
    createdAt: Date.now() - 50000,
    updatedAt: Date.now() - 50000,
  },
];

export async function seedDatabaseIfEmpty() {
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }

  const bookmarkCount = await db.bookmarks.count();
  if (bookmarkCount === 0) {
    await db.bookmarks.bulkAdd(DEFAULT_BOOKMARKS);
  }
}
