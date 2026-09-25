import React from 'react';
import type { Category } from '../types/bookmark';
import { CategoryIcon } from './CategoryIcon';
import { Layers, Plus, Edit2, Trash2, Sparkles } from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  activeCategory: string; // 'all' or category slug
  onSelectCategory: (slug: string) => void;
  onOpenAddCategory: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: number) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenAddCategory,
  onEditCategory,
  onDeleteCategory,
  categoryCounts,
  totalCount,
}) => {
  return (
    <aside className="w-full md:w-64 shrink-0 glass-panel rounded-2xl p-4 border border-slate-800/80 flex flex-col gap-4">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Subjects / Categories</span>
        </h2>
        <button
          onClick={onOpenAddCategory}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Add New Subject"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Categories Navigation List */}
      <div className="flex flex-col gap-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
        {/* 'All Bookmarks' Tab */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/40'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>All Bookmarks</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Dynamic Category List */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          const count = categoryCounts[cat.slug] || 0;

          return (
            <div key={cat.slug} className="group relative flex items-center">
              <button
                onClick={() => onSelectCategory(cat.slug)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-white border border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-16">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="w-4 h-4" />
                  </div>
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </button>

              {/* Action Buttons for Edit & Delete Category */}
              {cat.id && (
                <div className="opacity-0 group-hover:opacity-100 absolute right-2 flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-700/80 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCategory(cat);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-300 transition-colors"
                    title="Edit Subject"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete subject "${cat.name}"?`)) {
                        onDeleteCategory(cat.id!);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Subject Button Footer */}
      <div className="pt-2 border-t border-slate-800 mt-auto">
        <button
          onClick={onOpenAddCategory}
          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50 text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>+ Create New Subject</span>
        </button>
      </div>
    </aside>
  );
};
