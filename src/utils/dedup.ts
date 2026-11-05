/**
 * Normalizes a URL for duplicate comparison: ensures a protocol, lowercases
 * the host, drops a trailing slash and a leading "www.". It is intentionally
 * conservative — it does not touch the path case or query, since those can be
 * significant (e.g. YouTube video ids).
 */
export function normalizeUrl(input: string): string {
  let candidate = input.trim();
  if (!candidate) return '';
  if (!candidate.startsWith('http://') && !candidate.startsWith('https://')) {
    candidate = 'https://' + candidate;
  }

  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const path = parsed.pathname.replace(/\/$/, '');
    return `${host}${path}${parsed.search}`;
  } catch {
    return candidate.toLowerCase().replace(/\/$/, '');
  }
}

export function isDuplicateUrl(candidate: string, existing: Iterable<string>): boolean {
  const normalized = normalizeUrl(candidate);
  for (const url of existing) {
    if (normalizeUrl(url) === normalized) return true;
  }
  return false;
}
