export interface Category {
  id?: number;
  slug: string;
  name: string;
  description?: string;
  icon: string; // Lucide icon name or emoji
  color: string; // Tailwind color class / hex
  parentSlug?: string; // Parent category slug for nested folders
  isCustom?: boolean;
  createdAt: number;
}

export type PlatformType = 
  | 'youtube' 
  | 'linkedin' 
  | 'github' 
  | 'twitter' 
  | 'weather' 
  | 'news' 
  | 'medium' 
  | 'devto' 
  | 'general';

export interface Bookmark {
  id?: number;
  url: string;
  title: string;
  domain: string;
  platform: PlatformType;
  platformDetail?: string; // e.g. "@username", "channel name", "repo name"
  thumbnailUrl?: string;
  faviconUrl?: string;
  categorySlug: string;
  description?: string;
  tags?: string[];
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ParsedUrlMetadata {
  url: string;
  title: string;
  domain: string;
  platform: PlatformType;
  platformDetail?: string;
  thumbnailUrl?: string;
  faviconUrl?: string;
  suggestedCategorySlug: string;
}
