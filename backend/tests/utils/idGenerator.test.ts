import { generateId, generatePrefixedId, generateTimestampId } from '../../src/utils/idGenerator';

describe('ID Generator', () => {
  describe('generateId', () => {
    it('should generate a UUID v4', () => {
      const id = generateId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generatePrefixedId', () => {
    it('should generate ID with prefix', () => {
      const id = generatePrefixedId('alert');
      expect(id).toMatch(/^alert_/);
      // Check UUID part after prefix
      const uuidPart = id.substring('alert_'.length);
      expect(uuidPart).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique prefixed IDs', () => {
      const id1 = generatePrefixedId('alert');
      const id2 = generatePrefixedId('alert');
      expect(id1).not.toBe(id2);
    });

    it('should work with different prefixes', () => {
      const alertId = generatePrefixedId('alert');
      const newsId = generatePrefixedId('news');
      expect(alertId).toMatch(/^alert_/);
      expect(newsId).toMatch(/^news_/);
    });
  });

  describe('generateTimestampId', () => {
    it('should generate timestamp-based ID', () => {
      const id = generateTimestampId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should include timestamp', () => {
      const beforeTime = Date.now();
      const id = generateTimestampId();
      const afterTime = Date.now();

      const timestamp = parseInt(id.substring(0, 13), 10);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should generate timestamp-based ID with prefix', () => {
      const id = generateTimestampId('log');
      expect(id).toMatch(/^log_/);
      const idPart = id.substring('log_'.length);
      expect(idPart.length).toBeGreaterThan(0);
    });

    it('should generate unique timestamp IDs', () => {
      const id1 = generateTimestampId();
      const id2 = generateTimestampId();
      expect(id1).not.toBe(id2);
    });
  });
});
