import React, { useState, useEffect } from 'react';
import type { Bookmark, Category } from '../types/bookmark';
import { X, Edit2, Check, FileText, Tag } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface EditBookmarkModalProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdateBookmark: (id: number, updates: Partial<Bookmark>) => void;
}

export const EditBookmarkModal: React.FC<EditBookmarkModalProps> = ({
  bookmark,
  isOpen,
  onClose,
  categories,
  onUpdateBookmark,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (bookmark) {
      setTitle(bookmark.title);
      setUrl(bookmark.url);
      setCategorySlug(bookmark.categorySlug);
      setDescription(bookmark.description || '');
      setTagsInput(bookmark.tags ? bookmark.tags.join(', ') : '');
    }
  }, [bookmark]);

  if (!isOpen || !bookmark) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmark.id) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onUpdateBookmark(bookmark.id, {
      title: title.trim(),
      url: url.trim(),
      categorySlug,
      description: description.trim(),
      tags,
      updatedAt: Date.now(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Edit2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Edit Bookmark</h2>
              <p className="text-xs text-slate-400">Modify title, category or tags</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Display Name / Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL Link
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subject / Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = categorySlug === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setCategorySlug(cat.slug)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border transition-all text-left ${
                      isSelected
                        ? 'bg-purple-600/30 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-3 h-3" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes / Description</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Tags (comma separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full glass-input px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Update Bookmark</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
