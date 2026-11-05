import { describe, it, expect } from 'vitest';
import { parseUrlMetadata } from './urlParser';

describe('parseUrlMetadata', () => {
  it('prepends https:// when the scheme is missing', () => {
    expect(parseUrlMetadata('example.com').url).toBe('https://example.com');
  });

  it('strips a leading www. from the domain', () => {
    expect(parseUrlMetadata('https://www.example.com').domain).toBe('example.com');
  });

  describe('YouTube', () => {
    it('detects a video via ?v= and builds a thumbnail', () => {
      const meta = parseUrlMetadata('https://youtube.com/watch?v=dQw4w9WgXcQ');
      expect(meta.platform).toBe('youtube');
      expect(meta.thumbnailUrl).toContain('dQw4w9WgXcQ');
      expect(meta.suggestedCategorySlug).toBe('entertainment');
    });

    it('detects a video via youtu.be short links', () => {
      const meta = parseUrlMetadata('https://youtu.be/abc123');
      expect(meta.thumbnailUrl).toContain('abc123');
    });

    it('detects a channel handle', () => {
      const meta = parseUrlMetadata('https://youtube.com/@Fireship');
      expect(meta.platformDetail).toContain('@Fireship');
    });
  });

  describe('LinkedIn', () => {
    it('formats a profile under /in/', () => {
      const meta = parseUrlMetadata('https://linkedin.com/in/john-doe');
      expect(meta.platform).toBe('linkedin');
      expect(meta.title).toBe('John doe | LinkedIn');
      expect(meta.suggestedCategorySlug).toBe('work');
    });

    it('formats a company page', () => {
      const meta = parseUrlMetadata('https://linkedin.com/company/acme');
      expect(meta.title).toContain('LinkedIn');
    });
  });

  it('extracts owner/repo from GitHub', () => {
    const meta = parseUrlMetadata('https://github.com/facebook/react');
    expect(meta.platform).toBe('github');
    expect(meta.title).toBe('facebook/react');
    expect(meta.suggestedCategorySlug).toBe('dev');
  });

  it('extracts an X/Twitter handle', () => {
    const meta = parseUrlMetadata('https://x.com/elonmusk');
    expect(meta.platform).toBe('twitter');
    expect(meta.platformDetail).toContain('@elonmusk');
  });

  it('classifies weather sites', () => {
    expect(parseUrlMetadata('https://weather.com').platform).toBe('weather');
  });

  it('classifies news sites', () => {
    const meta = parseUrlMetadata('https://news.ycombinator.com');
    expect(meta.platform).toBe('news');
    expect(meta.title).toBe('Hacker News');
  });

  it('falls back to a domain-derived title for unknown sites', () => {
    const meta = parseUrlMetadata('https://example.com');
    expect(meta.platform).toBe('general');
    expect(meta.title).toBe('Example');
  });

  it('does not throw on malformed input', () => {
    const meta = parseUrlMetadata('http://');
    expect(meta.platform).toBe('general');
    expect(meta.domain).toBeDefined();
  });

  it('always provides a favicon url', () => {
    expect(parseUrlMetadata('https://example.com').faviconUrl).toContain('example.com');
  });
});
