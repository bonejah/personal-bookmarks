import { describe, it, expect } from 'vitest';
import { collectSubtreeSlugs, buildRecursiveCounts } from './categoryTree';
import type { Category } from '../types/bookmark';

const cat = (slug: string, parentSlug?: string): Category => ({
  slug,
  name: slug,
  icon: 'Folder',
  color: '#000',
  parentSlug,
  createdAt: 0,
});

const tree: Category[] = [
  cat('root'),
  cat('a', 'root'),
  cat('b', 'root'),
  cat('a1', 'a'),
  cat('a1x', 'a1'),
  cat('lonely'),
];

describe('collectSubtreeSlugs', () => {
  it('includes the root slug itself', () => {
    expect(collectSubtreeSlugs(tree, 'lonely')).toEqual(['lonely']);
  });

  it('collects all descendants across multiple levels', () => {
    const slugs = collectSubtreeSlugs(tree, 'root');
    expect(new Set(slugs)).toEqual(new Set(['root', 'a', 'b', 'a1', 'a1x']));
  });

  it('collects a mid-level subtree without touching siblings', () => {
    const slugs = collectSubtreeSlugs(tree, 'a');
    expect(new Set(slugs)).toEqual(new Set(['a', 'a1', 'a1x']));
    expect(slugs).not.toContain('b');
  });

  it('returns only the slug when it has no matching category (defensive)', () => {
    expect(collectSubtreeSlugs(tree, 'ghost')).toEqual(['ghost']);
  });
});

describe('buildRecursiveCounts', () => {
  it('rolls child counts up into parents', () => {
    const direct = { root: 1, a: 2, a1: 3, a1x: 4, b: 5, lonely: 0 };
    const counts = buildRecursiveCounts(tree, direct);
    expect(counts.a1x).toBe(4);
    expect(counts.a1).toBe(3 + 4);
    expect(counts.a).toBe(2 + 3 + 4);
    expect(counts.root).toBe(1 + 2 + 3 + 4 + 5);
    expect(counts.lonely).toBe(0);
  });
});
