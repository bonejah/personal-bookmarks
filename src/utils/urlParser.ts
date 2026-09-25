import type { ParsedUrlMetadata, PlatformType } from '../types/bookmark';

export function parseUrlMetadata(inputUrl: string): ParsedUrlMetadata {
  let normalizedUrl = inputUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return {
      url: normalizedUrl,
      title: inputUrl,
      domain: 'unknown',
      platform: 'general',
      suggestedCategorySlug: 'general',
      faviconUrl: '',
    };
  }

  const hostname = parsed.hostname.replace(/^www\./, '');
  const pathname = parsed.pathname;

  let platform: PlatformType = 'general';
  let platformDetail = '';
  let title = '';
  let thumbnailUrl = '';
  let suggestedCategorySlug = 'general';

  // 1. YOUTUBE
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    platform = 'youtube';
    suggestedCategorySlug = 'entertainment';

    // Video check
    let videoId: string | null = null;
    if (hostname.includes('youtu.be')) {
      videoId = pathname.slice(1).split('/')[0] || null;
    } else if (parsed.searchParams.get('v')) {
      videoId = parsed.searchParams.get('v');
    }

    if (videoId) {
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      title = `YouTube Video (${videoId})`;
      platformDetail = 'YouTube Video';
    } else if (pathname.includes('/@')) {
      const channelName = pathname.split('/@')[1]?.split('/')[0];
      title = `@${channelName} • YouTube Channel`;
      platformDetail = `Channel: @${channelName}`;
    } else {
      title = 'YouTube';
      platformDetail = 'YouTube Platform';
    }
  }

  // 2. LINKEDIN
  else if (hostname.includes('linkedin.com')) {
    platform = 'linkedin';
    suggestedCategorySlug = 'work';

    if (pathname.includes('/in/')) {
      const profileName = pathname.split('/in/')[1]?.split('/')[0]?.replace(/-/g, ' ');
      const formattedName = profileName
        ? profileName.charAt(0).toUpperCase() + profileName.slice(1)
        : 'User';
      title = `${formattedName} | LinkedIn`;
      platformDetail = `LinkedIn Profile (${profileName || ''})`;
    } else if (pathname.includes('/company/')) {
      const companyName = pathname.split('/company/')[1]?.split('/')[0]?.replace(/-/g, ' ');
      title = `${companyName ? companyName.toUpperCase() : 'Company'} on LinkedIn`;
      platformDetail = 'LinkedIn Page';
    } else {
      title = 'LinkedIn';
      platformDetail = 'Professional Network';
    }
  }

  // 3. GITHUB
  else if (hostname.includes('github.com')) {
    platform = 'github';
    suggestedCategorySlug = 'dev';

    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const owner = parts[0];
      const repo = parts[1];
      title = `${owner}/${repo}`;
      platformDetail = `GitHub Repo: ${owner}/${repo}`;
    } else if (parts.length === 1) {
      title = `${parts[0]} (GitHub)`;
      platformDetail = `GitHub Profile: ${parts[0]}`;
    } else {
      title = 'GitHub';
      platformDetail = 'Code Repository';
    }
  }

  // 4. TWITTER / X
  else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    platform = 'twitter';
    suggestedCategorySlug = 'news';

    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0 && !['home', 'explore', 'notifications', 'messages'].includes(parts[0])) {
      const username = parts[0];
      title = `@${username} on X`;
      platformDetail = `X Profile: @${username}`;
    } else {
      title = 'X (Twitter)';
      platformDetail = 'Social Network';
    }
  }

  // 5. WEATHER SITES
  else if (
    hostname.includes('weather.com') ||
    hostname.includes('accuweather.com') ||
    hostname.includes('windy.com') ||
    hostname.includes('climatempo.com') ||
    hostname.includes('ventusky.com') ||
    hostname.includes('windguru.cz') ||
    hostname.includes('noaa.gov')
  ) {
    platform = 'weather';
    suggestedCategorySlug = 'weather';
    const siteName = hostname.split('.')[0];
    const capitalized = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    title = `${capitalized} Weather Forecast`;
    platformDetail = 'Weather Service';
  }

  // 6. NEWS SITES
  else if (
    hostname.includes('news') ||
    hostname.includes('bbc.com') ||
    hostname.includes('cnn.com') ||
    hostname.includes('techcrunch.com') ||
    hostname.includes('theverge.com') ||
    hostname.includes('reuters.com') ||
    hostname.includes('bloomberg.com') ||
    hostname.includes('nytimes.com') ||
    hostname.includes('g1.globo.com') ||
    hostname.includes('ycombinator.com')
  ) {
    platform = 'news';
    suggestedCategorySlug = 'news';
    if (hostname.includes('ycombinator.com')) {
      title = 'Hacker News';
      platformDetail = 'Tech & Startup News';
    } else {
      const siteName = hostname.split('.')[0].toUpperCase();
      title = `${siteName} News`;
      platformDetail = 'News Publication';
    }
  }

  // 7. AI & TECH SITES
  else if (
    hostname.includes('openai.com') ||
    hostname.includes('anthropic.com') ||
    hostname.includes('claude.ai') ||
    hostname.includes('huggingface.co') ||
    hostname.includes('midjourney.com') ||
    hostname.includes('perplexity.ai') ||
    hostname.includes('github.copilot') ||
    hostname.includes('replicate.com')
  ) {
    platform = 'general';
    suggestedCategorySlug = 'ai';
    const siteName = hostname.split('.')[0];
    const capitalized = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    title = `${capitalized} AI`;
    platformDetail = 'Artificial Intelligence Platform';
  }

  // GENERAL FALLBACK TITLE GENERATION
  if (!title) {
    const cleanHost = hostname.replace(/\.(com|org|net|io|co|dev|ai|gov|edu|me|br|uk|de)$/, '');
    const formattedHost = cleanHost.charAt(0).toUpperCase() + cleanHost.slice(1);

    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1]
        .replace(/[-_]/g, ' ')
        .replace(/\.(html|php|asp)$/, '');
      if (lastSegment.length > 2 && lastSegment.length < 50) {
        title = `${formattedHost} - ${lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)}`;
      } else {
        title = formattedHost;
      }
    } else {
      title = formattedHost;
    }
    platformDetail = hostname;
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

  return {
    url: normalizedUrl,
    title,
    domain: hostname,
    platform,
    platformDetail,
    thumbnailUrl,
    faviconUrl,
    suggestedCategorySlug,
  };
}
