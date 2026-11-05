import React, { useState } from 'react';
import type { Category } from '../types/bookmark';
import { CategoryIcon } from './CategoryIcon';
import { Layers, Plus, Edit2, Trash2, Sparkles, ChevronRight, ChevronDown, Folder, FolderOpen, X } from 'lucide-react';
import { BOOKMARK_DND_TYPE } from '../utils/dnd';

interface SidebarProps {
  categories: Category[];
  activeCategory: string; // 'all' or category slug
  onSelectCategory: (slug: string) => void;
  onOpenAddCategory: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: number) => void;
  onMoveBookmarks: (ids: number[], targetSlug: string) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenAddCategory,
  onEditCategory,
  onDeleteCategory,
  onMoveBookmarks,
  categoryCounts,
  totalCount,
  isOpen,
  onClose,
}) => {
  // State for expanded parent folders
  const [expandedSlugs, setExpandedSlugs] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      if (cat.parentSlug) {
        initial[cat.parentSlug] = true;
      }
    });
    return initial;
  });
  const [dropTargetSlug, setDropTargetSlug] = useState<string | null>(null);

  const toggleExpand = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSlugs((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const readDraggedIds = (e: React.DragEvent): number[] => {
    const raw = e.dataTransfer.getData(BOOKMARK_DND_TYPE);
    if (!raw) return [];
    return raw
      .split(',')
      .map((n) => parseInt(n, 10))
      .filter((n) => !Number.isNaN(n));
  };

  const handleDrop = (slug: string) => (e: React.DragEvent) => {
    e.preventDefault();
    setDropTargetSlug(null);
    const ids = readDraggedIds(e);
    if (ids.length > 0) onMoveBookmarks(ids, slug);
  };

  const handleDragOver = (slug: string) => (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(BOOKMARK_DND_TYPE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTargetSlug(slug);
    }
  };

  // Group categories into roots and children
  const rootCategories = categories.filter((c) => !c.parentSlug);
  const childrenMap = new Map<string, Category[]>();

  categories.forEach((cat) => {
    if (cat.parentSlug) {
      const existing = childrenMap.get(cat.parentSlug) || [];
      existing.push(cat);
      childrenMap.set(cat.parentSlug, existing);
    }
  });

  const renderCategoryItem = (cat: Category, isChild = false) => {
    const isActive = activeCategory === cat.slug;
    const children = childrenMap.get(cat.slug) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedSlugs[cat.slug] ?? true;
    const isDropTarget = dropTargetSlug === cat.slug;

    // Direct count of bookmarks inside this specific folder
    const count = categoryCounts[cat.slug] || 0;

    return (
      <div key={cat.slug} className="flex flex-col gap-1">
        <div className="group relative flex items-center">
          {/* Expand/Collapse Chevron for parent categories */}
          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(cat.slug, e)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-0.5 shrink-0"
              title={isExpanded ? 'Collapse subfolders' : 'Expand subfolders'}
              aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          )}

          <button
            onClick={() => onSelectCategory(cat.slug)}
            onDragOver={handleDragOver(cat.slug)}
            onDragLeave={() => setDropTargetSlug((s) => (s === cat.slug ? null : s))}
            onDrop={handleDrop(cat.slug)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isChild ? 'ml-1' : ''
            } ${
              isDropTarget
                ? 'bg-indigo-500/20 text-white border border-indigo-400 ring-2 ring-indigo-500/40'
                : isActive
                ? 'bg-slate-800/90 text-white border border-indigo-500/50 shadow-md shadow-indigo-500/10'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                {hasChildren ? (
                  isExpanded ? (
                    <FolderOpen className="w-3.5 h-3.5" />
                  ) : (
                    <Folder className="w-3.5 h-3.5" />
                  )
                ) : (
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="truncate text-left" title={cat.name}>
                {cat.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-opacity ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                } group-hover:opacity-0`}
              >
                {count}
              </span>
            </div>
          </button>

          {/* Action Buttons for Edit & Delete Category (Overlay on hover without clipping) */}
          {cat.id && (
            <div className="opacity-0 group-hover:opacity-100 absolute right-1.5 flex items-center gap-1 bg-slate-900/95 px-1.5 py-1 rounded-lg border border-slate-700/80 shadow-lg transition-opacity z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCategory(cat);
                }}
                className="p-1 text-slate-400 hover:text-indigo-300 transition-colors"
                title="Edit Subject"
                aria-label={`Edit subject ${cat.name}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory(cat.id!);
                }}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                title="Delete Subject"
                aria-label={`Delete subject ${cat.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Render Nested Children Subfolders */}
        {hasChildren && isExpanded && (
          <div className="pl-2 ml-2 border-l border-slate-800/80 flex flex-col gap-1 py-0.5">
            {children.map((child) => renderCategoryItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`glass-panel border border-slate-800/80 flex flex-col gap-4 p-4
          fixed top-0 left-0 z-50 h-full w-72 max-w-[85%] rounded-r-2xl transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:h-auto md:w-72 lg:w-80 md:rounded-2xl md:shrink-0`}
        aria-label="Subjects navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Subjects & Folders</span>
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenAddCategory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Add New Subject / Folder"
              aria-label="Add new subject or folder"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close menu"
              aria-label="Close subjects menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Navigation List */}
        <div className="flex flex-col gap-1.5 flex-1 md:max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
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

          {/* Dynamic Nested Category Tree */}
          {rootCategories.map((cat) => renderCategoryItem(cat))}
        </div>

        {/* Add New Subject Button Footer */}
        <div className="pt-2 border-t border-slate-800 mt-auto">
          <button
            onClick={onOpenAddCategory}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50 text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>+ Create Subject / Folder</span>
          </button>
        </div>
      </aside>
    </>
  );
};
