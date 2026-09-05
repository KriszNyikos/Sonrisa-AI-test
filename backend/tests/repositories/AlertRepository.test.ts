import { Database } from 'sqlite';
import { AlertRepository } from '../../src/repositories';
import { Alert } from '../../src/types';

describe('AlertRepository', () => {
  let db: Database;
  let repository: AlertRepository;

  beforeEach(async () => {
    // Mock database for testing
    db = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn(),
      exec: jest.fn(),
      close: jest.fn(),
    } as any;

    repository = new AlertRepository(db);
  });

  describe('create', () => {
    it('should create a new alert', async () => {
      const alertData = {
        name: 'Test Alert',
        description: 'Test Description',
        keywords: ['test', 'alert'],
        isActive: true,
      };

      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.create(alertData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(alertData.name);
      expect(result.keywords).toEqual(alertData.keywords);
      expect(result.isActive).toBe(true);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle optional description', async () => {
      const alertData = {
        name: 'Test Alert',
        keywords: ['test'],
        isActive: true,
      };

      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.create(alertData);

      expect(result.description).toBeUndefined();
    });
  });

  describe('getById', () => {
    it('should retrieve an alert by ID', async () => {
      const mockAlert = {
        id: 'test-id',
        name: 'Test Alert',
        description: 'Test',
        keywords: '["test"]',
        isActive: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(mockAlert);

      const result = await repository.getById('test-id');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id');
      expect(result?.keywords).toEqual(['test']);
      expect(result?.isActive).toBe(true);
    });

    it('should return null for non-existent alert', async () => {
      (db.get as jest.Mock).mockResolvedValue(null);

      const result = await repository.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should retrieve all alerts', async () => {
      const mockAlerts = [
        {
          id: 'id-1',
          name: 'Alert 1',
          keywords: '["test"]',
          isActive: 1,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'id-2',
          name: 'Alert 2',
          keywords: '["test2"]',
          isActive: 0,
          createdAt: '2026-01-02T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockAlerts);

      const result = await repository.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].keywords).toEqual(['test']);
      expect(result[1].isActive).toBe(false);
    });

    it('should return empty array when no alerts exist', async () => {
      (db.all as jest.Mock).mockResolvedValue([]);

      const result = await repository.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getActiveAlerts', () => {
    it('should retrieve only active alerts', async () => {
      const mockAlerts = [
        {
          id: 'id-1',
          name: 'Alert 1',
          keywords: '["test"]',
          isActive: 1,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockAlerts);

      const result = await repository.getActiveAlerts();

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });
  });

  describe('update', () => {
    it('should update an alert', async () => {
      const existingAlert = {
        id: 'test-id',
        name: 'Original Name',
        keywords: '["test"]',
        isActive: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(existingAlert);
      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.update('test-id', {
        name: 'Updated Name',
        keywords: ['updated'],
      });

      expect(result?.name).toBe('Updated Name');
      expect(result?.keywords).toEqual(['updated']);
    });

    it('should return null if alert does not exist', async () => {
      (db.get as jest.Mock).mockResolvedValue(null);

      const result = await repository.update('non-existent', { name: 'New Name' });

      expect(result).toBeNull();
    });
  });

  describe('toggle', () => {
    it('should toggle alert active status', async () => {
      const existingAlert = {
        id: 'test-id',
        name: 'Test Alert',
        keywords: '["test"]',
        isActive: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(existingAlert);
      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.toggle('test-id');

      expect(result?.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete an alert', async () => {
      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.delete('test-id');

      expect(result).toBe(true);
    });

    it('should return false if alert does not exist', async () => {
      (db.run as jest.Mock).mockResolvedValue({ changes: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return total count of alerts', async () => {
      (db.get as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await repository.count();

      expect(result).toBe(5);
    });

    it('should return 0 if no alerts exist', async () => {
      (db.get as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });
});
