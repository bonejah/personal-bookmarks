import { db } from '../db/database';
import type { Bookmark, Category } from '../types/bookmark';

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

export async function importUserDataJSON(jsonString: string): Promise<{ categoriesImported: number; bookmarksImported: number }> {
  const data: BackupData = JSON.parse(jsonString);

  if (!data.categories || !Array.isArray(data.bookmarks)) {
    throw new Error('Invalid JSON structure. Missing categories or bookmarks array.');
  }

  let catCount = 0;
  let bmCount = 0;

  await db.transaction('rw', db.categories, db.bookmarks, async () => {
    // Import categories (avoid duplicate slugs)
    for (const cat of data.categories) {
      const existing = await db.categories.where('slug').equals(cat.slug).first();
      if (!existing) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...newCat } = cat;
        await db.categories.add(newCat);
        catCount++;
      }
    }

    // Import bookmarks
    for (const bm of data.bookmarks) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...newBm } = bm;
      await db.bookmarks.add(newBm);
      bmCount++;
    }
  });

  return { categoriesImported: catCount, bookmarksImported: bmCount };
}
