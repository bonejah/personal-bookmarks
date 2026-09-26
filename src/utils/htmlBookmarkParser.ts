import type { BackupData } from './exportImport';
import type { Category, Bookmark } from '../types/bookmark';
import { parseUrlMetadata } from './urlParser';

const CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#38bdf8', // Sky
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
];

function generateSlug(text: string): string {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'imported';
}

function unescapeHtml(text: string): string {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  return doc.body.textContent || text;
}

export function parseHTMLBookmarks(htmlString: string): BackupData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const categoriesMap = new Map<string, Category>();
  const bookmarks: Bookmark[] = [];
  let colorIndex = 0;

  function getNextColor(): string {
    const color = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
    colorIndex++;
    return color;
  }

  function traverseContainer(element: Element, folderPath: string[], parentSlug?: string) {
    const children = Array.from(element.children);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const tagName = child.tagName.toUpperCase();

      if (tagName === 'DT') {
        const h3 = child.querySelector(':scope > H3, :scope > h3');
        const a = child.querySelector(':scope > A, :scope > a');
        const nextDl = child.querySelector(':scope > DL, :scope > dl') || child.nextElementSibling;

        if (h3) {
          const rawFolderName = unescapeHtml(h3.textContent || '').trim();
          // Skip root wrapper titles like Bookmarks or Bookmarks Bar
          if (rawFolderName && rawFolderName.toLowerCase() !== 'bookmarks' && rawFolderName.toLowerCase() !== 'bookmarks bar') {
            const newFolderPath = [...folderPath, rawFolderName];
            // Create a unique hierarchical slug (e.g., canada-school-matheus)
            const slug = generateSlug(newFolderPath.join('-'));

            if (!categoriesMap.has(slug)) {
              categoriesMap.set(slug, {
                name: rawFolderName,
                slug,
                description: `Folder: ${newFolderPath.join(' > ')}`,
                icon: 'Folder',
                color: getNextColor(),
                parentSlug,
                isCustom: true,
                createdAt: Date.now(),
              });
            }

            if (nextDl && nextDl.tagName.toUpperCase() === 'DL') {
              traverseContainer(nextDl, newFolderPath, slug);
            }
          } else if (nextDl && nextDl.tagName.toUpperCase() === 'DL') {
            traverseContainer(nextDl, folderPath, parentSlug);
          }
        } else if (a) {
          const href = a.getAttribute('href') || a.getAttribute('HREF') || '';
          if (!href || href.startsWith('javascript:')) continue;

          const rawTitle = unescapeHtml(a.textContent || '').trim();
          const addDateAttr = a.getAttribute('add_date') || a.getAttribute('ADD_DATE');
          const iconAttr = a.getAttribute('icon') || a.getAttribute('ICON');

          const timestamp = addDateAttr ? parseInt(addDateAttr, 10) * 1000 : Date.now();
          const validTimestamp = isNaN(timestamp) ? Date.now() : timestamp;

          const metadata = parseUrlMetadata(href);
          const currentFolderSlug = folderPath.length > 0 ? generateSlug(folderPath.join('-')) : metadata.suggestedCategorySlug;

          if (!categoriesMap.has(currentFolderSlug)) {
            const catName = folderPath.length > 0 ? folderPath[folderPath.length - 1] : metadata.suggestedCategorySlug;
            categoriesMap.set(currentFolderSlug, {
              name: catName.charAt(0).toUpperCase() + catName.slice(1),
              slug: currentFolderSlug,
              description: folderPath.length > 0 ? `Folder: ${folderPath.join(' > ')}` : 'Imported Bookmark',
              icon: 'Folder',
              color: getNextColor(),
              parentSlug,
              isCustom: true,
              createdAt: Date.now(),
            });
          }

          const faviconUrl = iconAttr && iconAttr.startsWith('data:')
            ? iconAttr
            : metadata.faviconUrl;

          bookmarks.push({
            url: metadata.url,
            title: rawTitle || metadata.title,
            domain: metadata.domain,
            platform: metadata.platform,
            platformDetail: metadata.platformDetail,
            thumbnailUrl: metadata.thumbnailUrl,
            faviconUrl,
            categorySlug: currentFolderSlug,
            description: folderPath.length > 0 ? `Folder: ${folderPath.join(' > ')}` : undefined,
            tags: folderPath.map((f) => f.toLowerCase()),
            isPinned: false,
            createdAt: validTimestamp,
            updatedAt: validTimestamp,
          });
        }
      } else if (tagName === 'DL') {
        traverseContainer(child, folderPath, parentSlug);
      }
    }
  }

  const rootDl = doc.querySelector('dl, DL') || doc.body;
  if (rootDl) {
    traverseContainer(rootDl, []);
  }

  // Fallback if DOM tree traversal was empty
  if (bookmarks.length === 0) {
    const allLinks = Array.from(doc.querySelectorAll('a, A'));
    for (const a of allLinks) {
      const href = a.getAttribute('href') || a.getAttribute('HREF') || '';
      if (!href || href.startsWith('javascript:')) continue;

      const rawTitle = unescapeHtml(a.textContent || '').trim();
      const iconAttr = a.getAttribute('icon') || a.getAttribute('ICON');
      const addDateAttr = a.getAttribute('add_date') || a.getAttribute('ADD_DATE');

      const timestamp = addDateAttr ? parseInt(addDateAttr, 10) * 1000 : Date.now();
      const metadata = parseUrlMetadata(href);
      const categorySlug = metadata.suggestedCategorySlug;

      if (!categoriesMap.has(categorySlug)) {
        categoriesMap.set(categorySlug, {
          name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
          slug: categorySlug,
          description: 'Imported Bookmark',
          icon: 'Folder',
          color: getNextColor(),
          isCustom: true,
          createdAt: Date.now(),
        });
      }

      bookmarks.push({
        url: metadata.url,
        title: rawTitle || metadata.title,
        domain: metadata.domain,
        platform: metadata.platform,
        platformDetail: metadata.platformDetail,
        thumbnailUrl: metadata.thumbnailUrl,
        faviconUrl: iconAttr && iconAttr.startsWith('data:') ? iconAttr : metadata.faviconUrl,
        categorySlug,
        tags: ['imported'],
        isPinned: false,
        createdAt: isNaN(timestamp) ? Date.now() : timestamp,
        updatedAt: isNaN(timestamp) ? Date.now() : timestamp,
      });
    }
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: Array.from(categoriesMap.values()),
    bookmarks,
  };
}
