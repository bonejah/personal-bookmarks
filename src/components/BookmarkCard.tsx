import React, { useState } from 'react';
import type { Bookmark, Category } from '../types/bookmark';
import {
  ExternalLink,
  Copy,
  Check,
  Pin,
  Edit2,
  Trash2,
  CloudSun,
  Newspaper,
  Globe,
} from 'lucide-react';
import { YoutubeIcon, LinkedinIcon, GithubIcon, TwitterIcon } from './PlatformIcons';
import { CategoryIcon } from './CategoryIcon';

interface BookmarkCardProps {
  bookmark: Bookmark;
  category?: Category;
  onEdit: (bm: Bookmark) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number, currentPinned: boolean) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  category,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(bookmark.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformBadge = () => {
    switch (bookmark.platform) {
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-500/15 text-red-400 border border-red-500/30">
            <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
            <span>{bookmark.platformDetail || 'YouTube'}</span>
          </span>
        );
      case 'linkedin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>{bookmark.platformDetail || 'LinkedIn'}</span>
          </span>
        );
      case 'github':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-400/15 text-slate-200 border border-slate-400/30">
            <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
            <span>{bookmark.platformDetail || 'GitHub'}</span>
          </span>
        );
      case 'twitter':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <TwitterIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{bookmark.platformDetail || 'X / Twitter'}</span>
          </span>
        );
      case 'weather':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <CloudSun className="w-3.5 h-3.5 text-sky-400" />
            <span>{bookmark.platformDetail || 'Weather'}</span>
          </span>
        );
      case 'news':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Newspaper className="w-3.5 h-3.5 text-amber-400" />
            <span>{bookmark.platformDetail || 'News'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{bookmark.domain}</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`group relative glass-card rounded-2xl overflow-hidden flex flex-col justify-between p-5 ${
        bookmark.isPinned ? 'border-amber-500/40 ring-1 ring-amber-500/20 bg-slate-900/60' : ''
      }`}
    >
      {/* Pinned Badge Ribbon */}
      {bookmark.isPinned && (
        <div className="absolute top-3 right-3 text-amber-400" title="Pinned Bookmark">
          <Pin className="w-4 h-4 fill-amber-400 text-amber-400 transform rotate-45" />
        </div>
      )}

      <div>
        {/* Top Header: Platform Badge + Subject Badge */}
        <div className="flex items-center justify-between gap-2 mb-3 pr-6">
          {getPlatformBadge()}

          {category && (
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide flex items-center gap-1"
              style={{
                backgroundColor: `${category.color}18`,
                color: category.color,
                border: `1px solid ${category.color}35`,
              }}
            >
              <CategoryIcon name={category.icon} className="w-3 h-3" />
              <span>{category.name}</span>
            </span>
          )}
        </div>

        {/* Thumbnail Preview (for YouTube videos or media) */}
        {bookmark.thumbnailUrl && (
          <div className="relative mb-3.5 rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
            <img
              src={bookmark.thumbnailUrl}
              alt={bookmark.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
          </div>
        )}

        {/* Main Title & Favicon */}
        <div className="flex items-start gap-3 mb-2">
          {bookmark.faviconUrl ? (
            <img
              src={bookmark.faviconUrl}
              alt=""
              className="w-5 h-5 rounded-md shrink-0 mt-0.5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Globe className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          )}

          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-white hover:text-indigo-300 transition-colors line-clamp-2 leading-snug"
          >
            {bookmark.title}
          </a>
        </div>

        {/* Description / Notes */}
        {bookmark.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {bookmark.description}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bookmark.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-2">
        <span className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">
          {bookmark.domain}
        </span>

        <div className="flex items-center gap-1">
          {/* Toggle Pin */}
          <button
            onClick={() => bookmark.id && onTogglePin(bookmark.id, !!bookmark.isPinned)}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmark.isPinned
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
            title={bookmark.isPinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          {/* Copy URL */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(bookmark)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
            title="Edit Bookmark"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (bookmark.id && confirm(`Delete bookmark "${bookmark.title}"?`)) {
                onDelete(bookmark.id);
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Delete Bookmark"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Open Link */}
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 p-1.5 rounded-lg bg-indigo-600/80 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center"
            title="Open Link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
