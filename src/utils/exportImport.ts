import { db } from '../db/database';
import type { Bookmark, Category } from '../types/bookmark';
import { parseHTMLBookmarks } from './htmlBookmarkParser';

export interface BackupData {
  version: number;
  exportedAt: string;
  categories: Category[];
  bookmarks: Bookmark[];
}

export async function exportUserDataJSON(): Promise<string> {
  const categories = await db.categories.toArray();
  const bookmarks = await db.bookmarks.toArray();

  const backupData: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    bookmarks,
  };

  return JSON.stringify(backupData, null, 2);
}

export function downloadJSONFile(jsonContent: string, filename = 'personal-bookmarks-backup.json') {
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.categories, db.bookmarks, async () => {
    await db.bookmarks.clear();
    await db.categories.clear();
  });
}

export async function importUserData(
  content: string,
  filename = '',
  clearExisting = false
): Promise<{ categoriesImported: number; bookmarksImported: number }> {
  let backupData: BackupData;

  const isHtmlFile =
    filename.endsWith('.html') ||
    filename.endsWith('.htm') ||
    content.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1') ||
    content.includes('<DL>') ||
    content.includes('<H3>') ||
    content.includes('<A HREF=');

  if (isHtmlFile) {
    backupData = parseHTMLBookmarks(content);
  } else {
    try {
      backupData = JSON.parse(content);
    } catch {
      backupData = parseHTMLBookmarks(content);
    }
  }

  if (!backupData.categories || !Array.isArray(backupData.bookmarks)) {
    throw new Error('Invalid structure. Missing categories or bookmarks array.');
  }

  if (backupData.bookmarks.length === 0) {
    throw new Error('No valid bookmarks found in the imported file.');
  }

  let catCount = 0;
  let bmCount = 0;

  await db.transaction('rw', db.categories, db.bookmarks, async () => {
    if (clearExisting) {
      await db.bookmarks.clear();
      await db.categories.clear();
    }

    // Import categories (avoid duplicate slugs unless clearExisting is true)
    for (const cat of backupData.categories) {
      const existing = await db.categories.where('slug').equals(cat.slug).first();
      if (!existing || clearExisting) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...newCat } = cat;
        await db.categories.add(newCat as Category);
        catCount++;
      }
    }

    // Import bookmarks
    for (const bm of backupData.bookmarks) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...newBm } = bm;
      await db.bookmarks.add(newBm as Bookmark);
      bmCount++;
    }
  });

  return { categoriesImported: catCount, bookmarksImported: bmCount };
}

export async function importUserDataJSON(jsonString: string): Promise<{ categoriesImported: number; bookmarksImported: number }> {
  return importUserData(jsonString);
}
