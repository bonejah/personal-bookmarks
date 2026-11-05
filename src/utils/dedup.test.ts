import { describe, it, expect } from 'vitest';
import { normalizeUrl, isDuplicateUrl } from './dedup';

describe('normalizeUrl', () => {
  it('adds a protocol when missing', () => {
    expect(normalizeUrl('github.com/facebook/react')).toBe('github.com/facebook/react');
  });

  it('treats http/https, www and trailing slash as equal', () => {
    expect(normalizeUrl('https://www.example.com/')).toBe(normalizeUrl('http://example.com'));
  });

  it('keeps path case and query (significant for video ids)', () => {
    expect(normalizeUrl('https://youtube.com/watch?v=AbC')).toBe('youtube.com/watch?v=AbC');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeUrl('   ')).toBe('');
  });
});

describe('isDuplicateUrl', () => {
  const existing = ['https://github.com/facebook/react', 'youtube.com/@Fireship'];

  it('detects duplicates ignoring protocol/www/trailing slash', () => {
    expect(isDuplicateUrl('http://www.github.com/facebook/react/', existing)).toBe(true);
  });

  it('returns false for a new url', () => {
    expect(isDuplicateUrl('https://example.com', existing)).toBe(false);
  });
});
