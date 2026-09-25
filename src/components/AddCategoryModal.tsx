import React, { useState } from 'react';
import type { Category } from '../types/bookmark';
import {
  AVAILABLE_CATEGORY_COLORS,
  AVAILABLE_CATEGORY_ICONS,
  CategoryIcon,
} from './CategoryIcon';
import { X, FolderPlus, Check } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => void;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSaveCategory,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState('#6366f1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    onSaveCategory({
      name: name.trim(),
      slug: slug || `subject-${Date.now()}`,
      description: description.trim(),
      icon,
      color,
      isCustom: true,
    });

    setName('');
    setDescription('');
    setIcon('Folder');
    setColor('#6366f1');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Custom Subject</h2>
              <p className="text-xs text-slate-400">Add a new category with icon and theme color</p>
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
              Subject Name <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design, Crypto, Cooking, Gaming, Finance"
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short info about this category..."
              className="w-full glass-input px-4 py-2.5 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              {AVAILABLE_CATEGORY_ICONS.map((ic) => {
                const isSelected = icon === ic;
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-purple-600/30 border border-purple-500 text-purple-300 shadow-md'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                    }`}
                  >
                    <CategoryIcon name={ic} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              {AVAILABLE_CATEGORY_COLORS.map((c) => {
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                      isSelected ? 'scale-110 ring-2 ring-white shadow-lg' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Category Badge Preview */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Preview:</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border" style={{ backgroundColor: `${color}18`, borderColor: `${color}40`, color: color }}>
              <CategoryIcon name={icon} className="w-4 h-4" />
              <span className="text-xs font-bold">{name || 'Subject Name'}</span>
            </div>
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Create Subject</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
