import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabaseIfEmpty } from './db/database';
import type { Bookmark, Category } from './types/bookmark';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BookmarkGrid } from './components/BookmarkGrid';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { EditBookmarkModal } from './components/EditBookmarkModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import { ExportImportModal } from './components/ExportImportModal';

export function App() {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modals state
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [isEditBookmarkOpen, setIsEditBookmarkOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // Initialize seed data if database is empty
  useEffect(() => {
    seedDatabaseIfEmpty().catch((err) => console.error('Failed to seed DB:', err));
  }, []);

  // Live Query Categories & Bookmarks from Dexie IndexedDB
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const bookmarks = useLiveQuery(() => db.bookmarks.toArray(), []) || [];

  // Calculate bookmark counts per category
  const categoryCounts: Record<string, number> = {};
  bookmarks.forEach((bm) => {
    categoryCounts[bm.categorySlug] = (categoryCounts[bm.categorySlug] || 0) + 1;
  });

  // Bookmark Handlers
  const handleSaveBookmark = async (bmData: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    await db.bookmarks.add({
      ...bmData,
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleUpdateBookmark = async (id: number, updates: Partial<Bookmark>) => {
    await db.bookmarks.update(id, updates);
  };

  const handleDeleteBookmark = async (id: number) => {
    await db.bookmarks.delete(id);
  };

  const handleTogglePin = async (id: number, currentPinned: boolean) => {
    await db.bookmarks.update(id, { isPinned: !currentPinned });
  };

  // Category Handlers
  const handleSaveCategory = async (catData: Omit<Category, 'id' | 'createdAt'>) => {
    await db.categories.add({
      ...catData,
      createdAt: Date.now(),
    });
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setIsEditCategoryOpen(true);
  };

  const handleUpdateCategory = async (id: number, updates: Partial<Category>) => {
    await db.categories.update(id, updates);
  };

  const handleDeleteCategory = async (id: number) => {
    const cat = await db.categories.get(id);
    if (cat) {
      await db.categories.delete(id);
      if (activeCategorySlug === cat.slug) {
        setActiveCategorySlug('all');
      }
    }
  };

  const handleOpenEditBookmark = (bm: Bookmark) => {
    setEditingBookmark(bm);
    setIsEditBookmarkOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddCategory={() => setIsAddCategoryOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        totalBookmarks={bookmarks.length}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <Sidebar
          categories={categories}
          activeCategory={activeCategorySlug}
          onSelectCategory={setActiveCategorySlug}
          onOpenAddCategory={() => setIsAddCategoryOpen(true)}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={handleDeleteCategory}
          categoryCounts={categoryCounts}
          totalCount={bookmarks.length}
        />

        {/* Bookmark Grid */}
        <BookmarkGrid
          bookmarks={bookmarks}
          categories={categories}
          activeCategorySlug={activeCategorySlug}
          searchQuery={searchQuery}
          onOpenAddBookmark={() => setIsAddBookmarkOpen(true)}
          onEditBookmark={handleOpenEditBookmark}
          onDeleteBookmark={handleDeleteBookmark}
          onTogglePin={handleTogglePin}
        />
      </main>

      {/* Modals */}
      <AddBookmarkModal
        isOpen={isAddBookmarkOpen}
        onClose={() => setIsAddBookmarkOpen(false)}
        categories={categories}
        defaultCategorySlug={activeCategorySlug}
        onSaveBookmark={handleSaveBookmark}
      />

      <EditBookmarkModal
        isOpen={isEditBookmarkOpen}
        onClose={() => setIsEditBookmarkOpen(false)}
        bookmark={editingBookmark}
        categories={categories}
        onUpdateBookmark={handleUpdateBookmark}
      />

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSaveCategory={handleSaveCategory}
      />

      <EditCategoryModal
        isOpen={isEditCategoryOpen}
        onClose={() => setIsEditCategoryOpen(false)}
        category={editingCategory}
        onUpdateCategory={handleUpdateCategory}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        onDataImported={() => {
          // Live query auto updates!
        }}
      />
    </div>
  );
}

export default App;
