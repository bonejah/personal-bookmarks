import type { Category } from '../types/bookmark';

/**
 * Returns the given category slug plus the slugs of every descendant
 * (children, grandchildren, ...). Used to aggregate bookmarks and counts
 * for a parent folder, and to delete a folder with its whole subtree.
 */
export function collectSubtreeSlugs(categories: Category[], rootSlug: string): string[] {
  const childrenByParent = new Map<string, string[]>();
  for (const cat of categories) {
    if (cat.parentSlug) {
      const siblings = childrenByParent.get(cat.parentSlug) ?? [];
      siblings.push(cat.slug);
      childrenByParent.set(cat.parentSlug, siblings);
    }
  }

  const result: string[] = [];
  const seen = new Set<string>();
  const queue = [rootSlug];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);
    result.push(current);
    for (const child of childrenByParent.get(current) ?? []) {
      queue.push(child);
    }
  }

  return result;
}

/**
 * Count of bookmarks per category slug, rolled up so a parent folder
 * includes the bookmarks of all its descendant folders.
 */
export function buildRecursiveCounts(
  categories: Category[],
  directCounts: Record<string, number>,
): Record<string, number> {
  const recursive: Record<string, number> = {};
  for (const cat of categories) {
    recursive[cat.slug] = collectSubtreeSlugs(categories, cat.slug).reduce(
      (sum, slug) => sum + (directCounts[slug] || 0),
      0,
    );
  }
  return recursive;
}
