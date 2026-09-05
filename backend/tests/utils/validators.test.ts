import {
  isValidEmail,
  isValidUrl,
  isValidSlackWebhookUrl,
  parseKeywords,
  hasValidKeywords,
  isValidAlertName,
  isValidAlertDescription,
  isValidChannelType,
  isValidChannelDestination,
  isValidNewsCategory,
  isValidNewsTitle,
  isValidNewsContent,
} from '../../src/utils/validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
      expect(isValidUrl('https://sub.example.com:8080')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('://invalid')).toBe(false);
    });
  });

  describe('isValidSlackWebhookUrl', () => {
    it('should validate Slack webhook URLs', () => {
      expect(
        isValidSlackWebhookUrl('https://hooks.slack.com/services/TTEST0000/BTEST0000/test0000000000000000000'),
      ).toBe(true);
    });

    it('should reject non-Slack webhook URLs', () => {
      expect(isValidSlackWebhookUrl('https://example.com/webhook')).toBe(false);
      expect(isValidSlackWebhookUrl('not a url')).toBe(false);
    });
  });

  describe('parseKeywords', () => {
    it('should parse comma-separated keywords', () => {
      const result = parseKeywords('test, alert, notification');
      expect(result).toEqual(['test', 'alert', 'notification']);
    });

    it('should handle array input', () => {
      const result = parseKeywords(['test', 'alert']);
      expect(result).toEqual(['test', 'alert']);
    });

    it('should treat single string as one keyword', () => {
      const result = parseKeywords('single');
      expect(result).toEqual(['single']);
    });

    it('should remove duplicates (case-insensitive)', () => {
      const result = parseKeywords('test, Test, TEST');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('test');
    });

    it('should filter out empty strings', () => {
      const result = parseKeywords('test, , alert, ');
      expect(result).toEqual(['test', 'alert']);
    });

    it('should trim whitespace', () => {
      const result = parseKeywords('  test  ,  alert  ');
      expect(result).toEqual(['test', 'alert']);
    });
  });

  describe('hasValidKeywords', () => {
    it('should return true for valid keywords', () => {
      expect(hasValidKeywords('test, alert')).toBe(true);
      expect(hasValidKeywords(['test', 'alert'])).toBe(true);
    });

    it('should return false for empty keywords', () => {
      expect(hasValidKeywords('')).toBe(false);
      expect(hasValidKeywords([])).toBe(false);
      expect(hasValidKeywords('   ')).toBe(false);
    });
  });

  describe('isValidAlertName', () => {
    it('should validate valid alert names', () => {
      expect(isValidAlertName('Test Alert')).toBe(true);
      expect(isValidAlertName('A')).toBe(true);
    });

    it('should reject empty names', () => {
      expect(isValidAlertName('')).toBe(false);
      expect(isValidAlertName('   ')).toBe(false);
    });

    it('should reject names exceeding 255 characters', () => {
      const longName = 'a'.repeat(256);
      expect(isValidAlertName(longName)).toBe(false);
    });
  });

  describe('isValidAlertDescription', () => {
    it('should accept undefined', () => {
      expect(isValidAlertDescription(undefined)).toBe(true);
    });

    it('should validate valid descriptions', () => {
      expect(isValidAlertDescription('Test description')).toBe(true);
    });

    it('should reject descriptions exceeding 1000 characters', () => {
      const longDesc = 'a'.repeat(1001);
      expect(isValidAlertDescription(longDesc)).toBe(false);
    });
  });

  describe('isValidChannelType', () => {
    it('should accept email and slack', () => {
      expect(isValidChannelType('email')).toBe(true);
      expect(isValidChannelType('slack')).toBe(true);
    });

    it('should reject other types', () => {
      expect(isValidChannelType('sms')).toBe(false);
      expect(isValidChannelType('webhook')).toBe(false);
    });
  });

  describe('isValidChannelDestination', () => {
    it('should validate email destinations', () => {
      expect(isValidChannelDestination('email', 'test@example.com')).toBe(true);
    });

    it('should reject invalid email destinations', () => {
      expect(isValidChannelDestination('email', 'notanemail')).toBe(false);
    });

    it('should validate Slack webhook destinations', () => {
      expect(
        isValidChannelDestination(
          'slack',
          'https://hooks.slack.com/services/TTEST0000/BTEST0000/test0000000000000000000',
        ),
      ).toBe(true);
    });

    it('should reject invalid Slack webhook destinations', () => {
      expect(isValidChannelDestination('slack', 'https://example.com/webhook')).toBe(false);
    });
  });

  describe('isValidNewsCategory', () => {
    it('should accept valid categories', () => {
      expect(isValidNewsCategory('breaking_news')).toBe(true);
      expect(isValidNewsCategory('market')).toBe(true);
      expect(isValidNewsCategory('disaster')).toBe(true);
      expect(isValidNewsCategory('other')).toBe(true);
    });

    it('should reject invalid categories', () => {
      expect(isValidNewsCategory('invalid')).toBe(false);
      expect(isValidNewsCategory('news')).toBe(false);
    });
  });

  describe('isValidNewsTitle', () => {
    it('should validate valid titles', () => {
      expect(isValidNewsTitle('Test News Title')).toBe(true);
    });

    it('should reject empty titles', () => {
      expect(isValidNewsTitle('')).toBe(false);
      expect(isValidNewsTitle('   ')).toBe(false);
    });

    it('should reject titles exceeding 500 characters', () => {
      const longTitle = 'a'.repeat(501);
      expect(isValidNewsTitle(longTitle)).toBe(false);
    });
  });

  describe('isValidNewsContent', () => {
    it('should validate valid content', () => {
      expect(isValidNewsContent('Test news content')).toBe(true);
    });

    it('should reject empty content', () => {
      expect(isValidNewsContent('')).toBe(false);
      expect(isValidNewsContent('   ')).toBe(false);
    });
  });
});
