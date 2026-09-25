import React from 'react';
import { Search, FolderPlus, Bookmark, Download, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddCategory: () => void;
  onOpenExportImport: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  totalBookmarks: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddCategory,
  onOpenExportImport,
  theme,
  onToggleTheme,
  totalBookmarks,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/25">
              <Bookmark className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                Personal <span className="gradient-text-primary">Bookmark</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Organized subjects • Smart link display
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl glass-card text-amber-400 hover:text-amber-300 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bookmarks by title, URL, tag, or domain..."
            className="w-full glass-input pl-10 pr-10 py-2.5 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl text-xs font-semibold glass-card hover:border-slate-500 transition-all flex items-center justify-center text-amber-400"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <button
            onClick={onOpenAddCategory}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold glass-card hover:border-slate-500 transition-all flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4 text-purple-400" />
            <span>New Subject</span>
          </button>

          <button
            onClick={onOpenExportImport}
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold glass-card hover:border-slate-500 transition-all flex items-center gap-2"
            title="Export / Import Backup"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Backup</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800/80 text-[10px] font-mono text-slate-300">
              {totalBookmarks}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
