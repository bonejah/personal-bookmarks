import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedDatabaseIfEmpty } from './db/database';
import type { Bookmark, Category } from './types/bookmark';
import { collectSubtreeSlugs, buildRecursiveCounts } from './utils/categoryTree';
import { isDuplicateUrl } from './utils/dedup';
import type { Command } from './utils/commandFilter';
import { useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BookmarkGrid } from './components/BookmarkGrid';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { EditBookmarkModal } from './components/EditBookmarkModal';
import { AddCategoryModal } from './components/AddCategoryModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import { ExportImportModal } from './components/ExportImportModal';
import { CommandPalette } from './components/CommandPalette';

export function App() {
  const { showToast } = useToast();

  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;

    // Suppress every transition for one frame while the theme class flips, so
    // all colors repaint together in a single pass instead of each element
    // animating its own color change on its own duration (which looked like a
    // flicker over the many blurred panels and transition-* utilities).
    root.classList.add('theme-no-transition');

    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.remove('theme-no-transition'));
    });
    return () => window.cancelAnimationFrame(id);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Modals state
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [isEditBookmarkOpen, setIsEditBookmarkOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Initialize seed data if database is empty
  useEffect(() => {
    seedDatabaseIfEmpty().catch((err) => console.error('Failed to seed DB:', err));
  }, []);

  // Live Query Categories & Bookmarks from Dexie IndexedDB
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];
  const bookmarks = useLiveQuery(() => db.bookmarks.toArray(), []) || [];

  // Bookmark counts per category, rolled up so a parent folder includes
  // the bookmarks of all its descendant folders.
  const categoryCounts = useMemo(() => {
    const direct: Record<string, number> = {};
    bookmarks.forEach((bm) => {
      direct[bm.categorySlug] = (direct[bm.categorySlug] || 0) + 1;
    });
    return buildRecursiveCounts(categories, direct);
  }, [bookmarks, categories]);

  // Bookmark Handlers
  const handleSaveBookmark = async (
    bmData: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<boolean> => {
    const existingUrls = await db.bookmarks.orderBy('url').keys();
    if (isDuplicateUrl(bmData.url, existingUrls as string[])) {
      return false;
    }
    const now = Date.now();
    await db.bookmarks.add({
      ...bmData,
      createdAt: now,
      updatedAt: now,
    });
    showToast({ type: 'success', message: 'Bookmark added.' });
    return true;
  };

  const handleUpdateBookmark = async (id: number, updates: Partial<Bookmark>) => {
    await db.bookmarks.update(id, updates);
  };

  const handleDeleteBookmark = async (id: number) => {
    const snapshot = await db.bookmarks.get(id);
    if (!snapshot) return;
    await db.bookmarks.delete(id);
    showToast({
      type: 'success',
      message: `Deleted "${snapshot.title}".`,
      action: {
        label: 'Undo',
        onClick: () => {
          db.bookmarks.add(snapshot).catch((err) => console.error('Undo failed:', err));
        },
      },
    });
  };

  const handleTogglePin = async (id: number, currentPinned: boolean) => {
    await db.bookmarks.update(id, { isPinned: !currentPinned });
  };

  // Move one or more bookmarks into another subject (drag-and-drop or bulk).
  const handleMoveBookmarks = useCallback(
    async (ids: number[], targetSlug: string) => {
      const affected = await db.bookmarks.bulkGet(ids);
      const previous = affected
        .filter((bm): bm is Bookmark => !!bm)
        .map((bm) => ({ id: bm.id!, categorySlug: bm.categorySlug }));
      if (previous.length === 0) return;

      await db.bookmarks.bulkUpdate(
        previous.map((p) => ({ key: p.id, changes: { categorySlug: targetSlug } })),
      );

      const target = categories.find((c) => c.slug === targetSlug);
      showToast({
        type: 'success',
        message: `Moved ${previous.length} ${previous.length === 1 ? 'bookmark' : 'bookmarks'} to ${target?.name ?? targetSlug}.`,
        action: {
          label: 'Undo',
          onClick: () => {
            db.bookmarks
              .bulkUpdate(previous.map((p) => ({ key: p.id, changes: { categorySlug: p.categorySlug } })))
              .catch((err) => console.error('Undo failed:', err));
          },
        },
      });
    },
    [categories, showToast],
  );

  const handleBulkDelete = useCallback(
    async (ids: number[]) => {
      const snapshot = (await db.bookmarks.bulkGet(ids)).filter((bm): bm is Bookmark => !!bm);
      if (snapshot.length === 0) return;
      await db.bookmarks.bulkDelete(ids);
      showToast({
        type: 'success',
        message: `Deleted ${snapshot.length} ${snapshot.length === 1 ? 'bookmark' : 'bookmarks'}.`,
        action: {
          label: 'Undo',
          onClick: () => {
            db.bookmarks.bulkAdd(snapshot).catch((err) => console.error('Undo failed:', err));
          },
        },
      });
    },
    [showToast],
  );

  const handleBulkPin = useCallback(async (ids: number[], pinned: boolean) => {
    await db.bookmarks.bulkUpdate(ids.map((id) => ({ key: id, changes: { isPinned: pinned } })));
  }, []);

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
    if (!cat) return;

    const allCategories = await db.categories.toArray();
    const slugsToDelete = collectSubtreeSlugs(allCategories, cat.slug);
    const categorySnapshot = allCategories.filter((c) => slugsToDelete.includes(c.slug));
    const bookmarkSnapshot = await db.bookmarks.where('categorySlug').anyOf(slugsToDelete).toArray();

    await db.transaction('rw', db.categories, db.bookmarks, async () => {
      for (const slug of slugsToDelete) {
        await db.bookmarks.where('categorySlug').equals(slug).delete();
        await db.categories.where('slug').equals(slug).delete();
      }
    });

    if (activeCategorySlug === cat.slug) {
      setActiveCategorySlug('all');
    }

    const extra = bookmarkSnapshot.length > 0 ? ` and ${bookmarkSnapshot.length} bookmark${bookmarkSnapshot.length === 1 ? '' : 's'}` : '';
    showToast({
      type: 'success',
      message: `Deleted "${cat.name}"${extra}.`,
      action: {
        label: 'Undo',
        onClick: () => {
          db.transaction('rw', db.categories, db.bookmarks, async () => {
            await db.categories.bulkAdd(categorySnapshot);
            if (bookmarkSnapshot.length > 0) await db.bookmarks.bulkAdd(bookmarkSnapshot);
          }).catch((err) => console.error('Undo failed:', err));
        },
      },
    });
  };

  const handleOpenEditBookmark = (bm: Bookmark) => {
    setEditingBookmark(bm);
    setIsEditBookmarkOpen(true);
  };

  const handleSelectCategory = useCallback((slug: string) => {
    setActiveCategorySlug(slug);
    setIsSidebarOpen(false);
  }, []);

  // Command palette commands
  const commands = useMemo<Command[]>(() => {
    const base: Command[] = [
      {
        id: 'add-bookmark',
        label: 'Add Bookmark',
        hint: 'Save a new link',
        keywords: ['new', 'link', 'create'],
        perform: () => setIsAddBookmarkOpen(true),
      },
      {
        id: 'add-category',
        label: 'Create Subject / Folder',
        hint: 'New category',
        keywords: ['folder', 'category', 'subject'],
        perform: () => setIsAddCategoryOpen(true),
      },
      {
        id: 'backup',
        label: 'Backup & Data Tools',
        hint: 'Import or export',
        keywords: ['export', 'import', 'json', 'backup'],
        perform: () => setIsExportImportOpen(true),
      },
      {
        id: 'toggle-theme',
        label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        keywords: ['theme', 'dark', 'light', 'appearance'],
        perform: toggleTheme,
      },
      {
        id: 'go-all',
        label: 'Go to All Bookmarks',
        keywords: ['all', 'home'],
        perform: () => handleSelectCategory('all'),
      },
    ];

    const navCommands: Command[] = categories.map((cat) => ({
      id: `go-${cat.slug}`,
      label: `Go to ${cat.name}`,
      hint: 'Subject',
      keywords: ['subject', 'folder', 'category', cat.slug],
      perform: () => handleSelectCategory(cat.slug),
    }));

    return [...base, ...navCommands];
  }, [categories, theme, toggleTheme, handleSelectCategory]);

  // Global keyboard shortcuts
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      );
    };

    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((v) => !v);
        return;
      }
      if (isTyping()) return;
      if (e.key === 'n') {
        e.preventDefault();
        setIsAddBookmarkOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddCategory={() => setIsAddCategoryOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
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
          onSelectCategory={handleSelectCategory}
          onOpenAddCategory={() => setIsAddCategoryOpen(true)}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onMoveBookmarks={handleMoveBookmarks}
          categoryCounts={categoryCounts}
          totalCount={bookmarks.length}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
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
          onBulkDelete={handleBulkDelete}
          onBulkMove={handleMoveBookmarks}
          onBulkPin={handleBulkPin}
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
        categories={categories}
        onSaveCategory={handleSaveCategory}
      />

      <EditCategoryModal
        isOpen={isEditCategoryOpen}
        onClose={() => setIsEditCategoryOpen(false)}
        category={editingCategory}
        categories={categories}
        onUpdateCategory={handleUpdateCategory}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        onDataImported={() => {
          // Live query auto updates!
        }}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}

export default App;
