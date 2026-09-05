/**
 * Input validation utilities
 */

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a Slack webhook URL
 */
export function isValidSlackWebhookUrl(url: string): boolean {
  return isValidUrl(url) && url.includes('hooks.slack.com');
}

/**
 * Validates and parses keywords from a string or array
 * Handles comma-separated, space-separated, or array input
 */
export function parseKeywords(input: string | string[]): string[] {
  let keywords: string[] = [];

  if (Array.isArray(input)) {
    keywords = input;
  } else if (typeof input === 'string') {
    // Try comma-separated first
    if (input.includes(',')) {
      keywords = input.split(',').map((k) => k.trim());
    } else {
      // Otherwise treat as single keyword
      keywords = [input.trim()];
    }
  }

  // Filter out empty strings and remove duplicates (case-insensitive)
  keywords = keywords
    .filter((k) => k.length > 0)
    .filter((k, idx, arr) => arr.findIndex((a) => a.toLowerCase() === k.toLowerCase()) === idx);

  return keywords;
}

/**
 * Validates that keywords are provided
 */
export function hasValidKeywords(keywords: string | string[]): boolean {
  const parsed = parseKeywords(keywords);
  return parsed.length > 0;
}

/**
 * Validates alert name
 */
export function isValidAlertName(name: string): boolean {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 255;
}

/**
 * Validates alert description
 */
export function isValidAlertDescription(description?: string): boolean {
  return description === undefined || (typeof description === 'string' && description.length <= 1000);
}

/**
 * Validates notification channel type
 */
export function isValidChannelType(type: string): type is 'email' | 'slack' {
  return type === 'email' || type === 'slack';
}

/**
 * Validates notification channel destination based on type
 */
export function isValidChannelDestination(type: 'email' | 'slack', destination: string): boolean {
  if (type === 'email') {
    return isValidEmail(destination);
  } else if (type === 'slack') {
    return isValidSlackWebhookUrl(destination);
  }
  return false;
}

/**
 * Validates a news category
 */
export function isValidNewsCategory(category: string): category is 'breaking_news' | 'market' | 'disaster' | 'other' {
  return ['breaking_news', 'market', 'disaster', 'other'].includes(category);
}

/**
 * Validates news title
 */
export function isValidNewsTitle(title: string): boolean {
  return typeof title === 'string' && title.trim().length > 0 && title.length <= 500;
}

/**
 * Validates news content
 */
export function isValidNewsContent(content: string): boolean {
  return typeof content === 'string' && content.trim().length > 0;
}
