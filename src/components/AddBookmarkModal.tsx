import React, { useState, useEffect } from 'react';
import type { Category, Bookmark } from '../types/bookmark';
import { parseUrlMetadata } from '../utils/urlParser';
import { X, Link2, Sparkles, Tag, FileText, Check } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  defaultCategorySlug?: string;
  onSaveBookmark: (bm: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultCategorySlug = 'studies',
  onSaveBookmark,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [categorySlug, setCategorySlug] = useState(defaultCategorySlug);
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isAutoParsed, setIsAutoParsed] = useState(false);

  // Live parsed state
  const [parsedMeta, setParsedMeta] = useState<ReturnType<typeof parseUrlMetadata> | null>(null);

  useEffect(() => {
    if (defaultCategorySlug && defaultCategorySlug !== 'all') {
      setCategorySlug(defaultCategorySlug);
    }
  }, [defaultCategorySlug]);

  if (!isOpen) return null;

  const handleUrlChange = (input: string) => {
    setUrl(input);
    if (input.trim().length > 4) {
      const meta = parseUrlMetadata(input);
      setParsedMeta(meta);
      setTitle(meta.title);
      if (meta.suggestedCategorySlug && meta.suggestedCategorySlug !== 'general') {
        const catExists = categories.some((c) => c.slug === meta.suggestedCategorySlug);
        if (catExists) {
          setCategorySlug(meta.suggestedCategorySlug);
        }
      }
      setIsAutoParsed(true);
    } else {
      setParsedMeta(null);
      setIsAutoParsed(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const finalMeta = parsedMeta || parseUrlMetadata(url);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSaveBookmark({
      url: finalMeta.url,
      title: title.trim() || finalMeta.title,
      domain: finalMeta.domain,
      platform: finalMeta.platform,
      platformDetail: finalMeta.platformDetail,
      thumbnailUrl: finalMeta.thumbnailUrl,
      faviconUrl: finalMeta.faviconUrl,
      categorySlug,
      description: description.trim(),
      tags,
      isPinned: false,
    });

    // Reset & Close
    setUrl('');
    setTitle('');
    setDescription('');
    setTagsInput('');
    setParsedMeta(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Bookmark</h2>
              <p className="text-xs text-slate-400">Paste any URL to auto-detect metadata</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL Link <span className="text-indigo-400">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://github.com/..."
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {isAutoParsed && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Detected</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Metadata Preview Card */}
          {parsedMeta && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 flex items-start gap-3">
              {parsedMeta.thumbnailUrl ? (
                <img
                  src={parsedMeta.thumbnailUrl}
                  alt=""
                  className="w-20 h-14 object-cover rounded-lg shrink-0 border border-slate-800"
                />
              ) : parsedMeta.faviconUrl ? (
                <img
                  src={parsedMeta.faviconUrl}
                  alt=""
                  className="w-7 h-7 rounded-md shrink-0 mt-1 object-contain"
                />
              ) : null}
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 block mb-0.5">
                  Platform: {parsedMeta.platformDetail || parsedMeta.platform}
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">{parsedMeta.title}</p>
                <p className="text-[11px] text-slate-400 font-mono">{parsedMeta.domain}</p>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Display Name / Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Channel Name, Project Name, Article Title"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject / Category Selection */}
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
                        ? 'bg-indigo-600/30 text-white border-indigo-500 shadow-sm'
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

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes / Description (Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or personal notes..."
              className="w-full glass-input px-4 py-2 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Tags (comma separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="react, tutorial, youtube"
              className="w-full glass-input px-4 py-2 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Bookmark</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
