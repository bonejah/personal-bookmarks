import { describe, it, expect } from 'vitest';
import { parseHTMLBookmarks } from './htmlBookmarkParser';

const nested = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<DL><p>
  <DT><H3>Dev</H3>
  <DL><p>
    <DT><A HREF="https://github.com/facebook/react">react</A>
    <DT><H3>Frontend</H3>
    <DL><p>
      <DT><A HREF="https://vitejs.dev">Vite</A>
    </DL><p>
  </DL><p>
</DL>`;

describe('parseHTMLBookmarks', () => {
  it('builds a category hierarchy with parentSlug from nested folders', () => {
    const data = parseHTMLBookmarks(nested);
    const dev = data.categories.find((c) => c.name === 'Dev');
    const frontend = data.categories.find((c) => c.name === 'Frontend');

    expect(dev).toBeDefined();
    expect(frontend).toBeDefined();
    expect(dev!.parentSlug).toBeUndefined();
    expect(frontend!.parentSlug).toBe(dev!.slug);
  });

  it('assigns bookmarks to their folder', () => {
    const data = parseHTMLBookmarks(nested);
    const react = data.bookmarks.find((b) => b.url.includes('github.com/facebook/react'));
    const vite = data.bookmarks.find((b) => b.url.includes('vitejs.dev'));
    expect(react).toBeDefined();
    expect(vite).toBeDefined();
    expect(vite!.categorySlug).not.toBe(react!.categorySlug);
  });

  it('ignores javascript: bookmarklets', () => {
    const data = parseHTMLBookmarks(
      '<DL><p><DT><A HREF="javascript:void(0)">evil</A><DT><A HREF="https://ok.com">ok</A></DL>',
    );
    expect(data.bookmarks).toHaveLength(1);
    expect(data.bookmarks[0].url).toContain('ok.com');
  });

  it('falls back to scraping loose anchors when there is no DL tree', () => {
    const data = parseHTMLBookmarks('<a href="https://example.com">Example</a>');
    expect(data.bookmarks).toHaveLength(1);
    expect(data.bookmarks[0].url).toBe('https://example.com');
  });
});
