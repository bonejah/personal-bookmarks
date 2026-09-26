import React, { useState } from 'react';
import type { Bookmark, Category } from '../types/bookmark';
import { BookmarkCard } from './BookmarkCard';
import { CategoryIcon } from './CategoryIcon';
import { Plus, ArrowUpDown, Filter, BookmarkX, Sparkles } from 'lucide-react';

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  categories: Category[];
  activeCategorySlug: string;
  searchQuery: string;
  onOpenAddBookmark: () => void;
  onEditBookmark: (bm: Bookmark) => void;
  onDeleteBookmark: (id: number) => void;
  onTogglePin: (id: number, currentPinned: boolean) => void;
}

export const BookmarkGrid: React.FC<BookmarkGridProps> = ({
  bookmarks,
  categories,
  activeCategorySlug,
  searchQuery,
  onOpenAddBookmark,
  onEditBookmark,
  onDeleteBookmark,
  onTogglePin,
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const currentCategory = categories.find((c) => c.slug === activeCategorySlug);

  // Filter Bookmarks
  let filtered = bookmarks.filter((bm) => {
    // Direct category match (exact folder match)
    if (activeCategorySlug !== 'all' && bm.categorySlug !== activeCategorySlug) {
      return false;
    }

    if (platformFilter !== 'all' && bm.platform !== platformFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = bm.title.toLowerCase().includes(q);
      const urlMatch = bm.url.toLowerCase().includes(q);
      const domainMatch = bm.domain.toLowerCase().includes(q);
      const tagMatch = bm.tags?.some((t) => t.toLowerCase().includes(q));
      const platformMatch = bm.platformDetail?.toLowerCase().includes(q);

      return titleMatch || urlMatch || domainMatch || tagMatch || platformMatch;
    }

    return true;
  });

  // Sort Bookmarks (Pinned items always come first)
  filtered = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === 'newest') return b.createdAt - a.createdAt;
    if (sortBy === 'oldest') return a.createdAt - b.createdAt;
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    return 0;
  });

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.slug, c]));

  return (
    <div className="flex-1 min-w-0">
      {/* Category Header Banner */}
      <div className="glass-panel rounded-2xl p-6 mb-6 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5 z-10">
          {currentCategory ? (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
              style={{
                backgroundColor: `${currentCategory.color}22`,
                color: currentCategory.color,
                border: `1px solid ${currentCategory.color}40`,
              }}
            >
              <CategoryIcon name={currentCategory.icon} className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{currentCategory ? currentCategory.name : 'All Bookmarks'}</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentCategory?.description || 'Browse and manage all your saved links across all subjects.'}
            </p>
          </div>
        </div>

        {/* Header Action */}
        <button
          onClick={onOpenAddBookmark}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Link to {currentCategory ? currentCategory.name : 'Subject'}</span>
        </button>
      </div>

      {/* Filter & Sort Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Platform Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter:</span>
          </span>

          {[
            { id: 'all', label: 'All' },
            { id: 'youtube', label: 'YouTube' },
            { id: 'linkedin', label: 'LinkedIn' },
            { id: 'github', label: 'GitHub' },
            { id: 'twitter', label: 'X' },
            { id: 'weather', label: 'Weather' },
            { id: 'news', label: 'News' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatformFilter(p.id)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
                platformFilter === p.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
            className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid of Cards or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              category={categoryMap.get(bookmark.categorySlug)}
              onEdit={onEditBookmark}
              onDelete={onDeleteBookmark}
              onTogglePin={onTogglePin}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800/80 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-4">
            <BookmarkX className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Bookmarks Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-5">
            {searchQuery
              ? `No bookmarks matching "${searchQuery}" in this view.`
              : 'You haven\'t added any bookmarks to this subject yet.'}
          </p>
          <button
            onClick={onOpenAddBookmark}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Bookmark</span>
          </button>
        </div>
      )}
    </div>
  );
};
