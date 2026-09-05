import MatchingEngine from '../../src/services/MatchingEngine';
import { Alert } from '../../src/types';

describe('MatchingEngine', () => {
  let engine: MatchingEngine;

  beforeEach(() => {
    engine = new MatchingEngine();
  });

  describe('matchKeywords', () => {
    it('should match keywords in content', () => {
      const content = 'The stock market crashed today affecting nasdaq and dow jones';
      const keywords = ['nasdaq', 'dow jones'];

      const result = engine.matchKeywords(content, keywords);

      expect(result).toBe(true);
    });

    it('should perform case-insensitive matching', () => {
      const content = 'Breaking news about NASDAQ prices';
      const keywords = ['nasdaq'];

      const result = engine.matchKeywords(content, keywords);

      expect(result).toBe(true);
    });

    it('should handle partial word matching', () => {
      const content = 'The marketplace is open';
      const keywords = ['market'];

      const result = engine.matchKeywords(content, keywords);

      expect(result).toBe(true);
    });

    it('should return false if no keywords match', () => {
      const content = 'The weather is nice today';
      const keywords = ['nasdaq', 'bitcoin'];

      const result = engine.matchKeywords(content, keywords);

      expect(result).toBe(false);
    });

    it('should handle special characters in keywords', () => {
      const content = 'Check out the best-seller list';
      const keywords = ['best-seller'];

      const result = engine.matchKeywords(content, keywords);

      expect(result).toBe(true);
    });

    it('should return false for empty content', () => {
      const keywords = ['test'];

      const result = engine.matchKeywords('', keywords);

      expect(result).toBe(false);
    });

    it('should return false for empty keywords', () => {
      const content = 'Some content';

      const result = engine.matchKeywords(content, []);

      expect(result).toBe(false);
    });

    it('should handle multiple keywords with one match', () => {
      const content = 'Market update for investors';
      const keywords = ['bitcoin', 'market', 'ethereum'];

      const result = engine.matchKeywords(content, keywords);

      expect(result).toBe(true);
    });
  });

  describe('matchAlert', () => {
    it('should match alert with news title and content', () => {
      const alert: Alert = {
        id: 'alert_123',
        name: 'Stock Alert',
        keywords: ['nasdaq'],
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const result = engine.matchAlert('Market Update', 'NASDAQ prices rise today', alert);

      expect(result).toBe(true);
    });

    it('should match keyword in title', () => {
      const alert: Alert = {
        id: 'alert_123',
        name: 'Disaster Alert',
        keywords: ['earthquake'],
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const result = engine.matchAlert('Earthquake hits Japan', 'Strong tremors reported', alert);

      expect(result).toBe(true);
    });

    it('should not match inactive alert', () => {
      const alert: Alert = {
        id: 'alert_123',
        name: 'Stock Alert',
        keywords: ['nasdaq'],
        isActive: false,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const result = engine.matchAlert('Market Update', 'NASDAQ prices rise today', alert);

      expect(result).toBe(true);
    });
  });

  describe('getMatchingAlerts', () => {
    it('should return all matching alerts', () => {
      const alerts: Alert[] = [
        {
          id: 'alert_1',
          name: 'Stock Alert',
          keywords: ['nasdaq', 'dow jones'],
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'alert_2',
          name: 'Crypto Alert',
          keywords: ['bitcoin', 'ethereum'],
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'alert_3',
          name: 'Weather Alert',
          keywords: ['hurricane', 'tornado'],
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      const result = engine.getMatchingAlerts('Stock Market Update', 'NASDAQ and Bitcoin prices surge', alerts);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('alert_1');
      expect(result[1].id).toBe('alert_2');
    });

    it('should filter out inactive alerts', () => {
      const alerts: Alert[] = [
        {
          id: 'alert_1',
          name: 'Active Alert',
          keywords: ['nasdaq'],
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'alert_2',
          name: 'Inactive Alert',
          keywords: ['nasdaq'],
          isActive: false,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      const result = engine.getMatchingAlerts('NASDAQ News', 'New update about nasdaq prices', alerts);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('alert_1');
    });

    it('should return empty array for no matches', () => {
      const alerts: Alert[] = [
        {
          id: 'alert_1',
          name: 'Stock Alert',
          keywords: ['nasdaq'],
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      const result = engine.getMatchingAlerts('Weather Report', 'Nice sunny day', alerts);

      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty alert list', () => {
      const result = engine.getMatchingAlerts('Some News', 'Content here', []);

      expect(result).toHaveLength(0);
    });

    it('should handle case-insensitive matching across title and content', () => {
      const alerts: Alert[] = [
        {
          id: 'alert_1',
          name: 'Case Test',
          keywords: ['URGENT'],
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      const result = engine.getMatchingAlerts('News Title', 'urgent update about markets', alerts);

      expect(result).toHaveLength(1);
    });
  });
});
