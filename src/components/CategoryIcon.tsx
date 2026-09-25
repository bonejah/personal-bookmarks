import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', style }) => {
  const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>>)[name] || Icons.Folder;
  return <IconComponent className={className} style={style} />;
};

export const AVAILABLE_CATEGORY_ICONS = [
  'GraduationCap',
  'Newspaper',
  'Bot',
  'CloudSun',
  'Briefcase',
  'Tv',
  'Code2',
  'BookOpen',
  'Globe',
  'Folder',
  'Sparkles',
  'Zap',
  'Bookmark',
  'Cpu',
  'Flame',
  'Music',
  'Film',
  'Heart',
  'Star',
  'Shield',
  'Compass',
  'Terminal',
];

export const AVAILABLE_CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#38bdf8', // Sky
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#8b5cf6', // Violet
];
