import { Database } from 'sqlite';
import { NotificationLogRepository } from '../../src/repositories';

describe('NotificationLogRepository', () => {
  let db: Database;
  let repository: NotificationLogRepository;

  beforeEach(() => {
    db = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn(),
    } as any;

    repository = new NotificationLogRepository(db);
  });

  describe('create', () => {
    it('should create a new notification log', async () => {
      const logData = {
        alertId: 'alert-1',
        newsItemId: 'news-1',
        channelType: 'email' as const,
        destination: 'test@example.com',
        status: 'pending' as const,
      };

      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.create(logData);

      expect(result).toHaveProperty('id');
      expect(result.alertId).toBe(logData.alertId);
      expect(result.status).toBe('pending');
      expect(result).toHaveProperty('createdAt');
    });

    it('should handle optional error message and sentAt', async () => {
      const logData = {
        alertId: 'alert-1',
        newsItemId: 'news-1',
        channelType: 'slack' as const,
        destination: 'https://hooks.slack.com/...',
        status: 'sent' as const,
      };

      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.create(logData);

      expect(result.errorMessage).toBeUndefined();
      expect(result.sentAt).toBeUndefined();
    });
  });

  describe('getById', () => {
    it('should retrieve a notification log by ID', async () => {
      const mockLog = {
        id: 'log-1',
        alert_id: 'alert-1',
        alertId: 'alert-1',
        news_item_id: 'news-1',
        newsItemId: 'news-1',
        channel_type: 'email',
        channelType: 'email',
        destination: 'test@example.com',
        status: 'sent',
        error_message: null,
        errorMessage: null,
        sent_at: '2026-01-01T00:00:00Z',
        sentAt: '2026-01-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(mockLog);

      const result = await repository.getById('log-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('log-1');
      expect(result?.status).toBe('sent');
    });

    it('should return null for non-existent log', async () => {
      (db.get as jest.Mock).mockResolvedValue(null);

      const result = await repository.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should retrieve all notification logs with pagination', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          alert_id: 'alert-1',
          alertId: 'alert-1',
          news_item_id: 'news-1',
          newsItemId: 'news-1',
          channel_type: 'email',
          channelType: 'email',
          destination: 'test@example.com',
          status: 'sent',
          error_message: null,
          errorMessage: null,
          sent_at: '2026-01-01T00:00:00Z',
          sentAt: '2026-01-01T00:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockLogs);
      (db.get as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repository.getAll({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getByAlertId', () => {
    it('should retrieve logs for a specific alert', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          alert_id: 'alert-1',
          alertId: 'alert-1',
          news_item_id: 'news-1',
          newsItemId: 'news-1',
          channel_type: 'email',
          channelType: 'email',
          destination: 'test@example.com',
          status: 'sent',
          error_message: null,
          errorMessage: null,
          sent_at: '2026-01-01T00:00:00Z',
          sentAt: '2026-01-01T00:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockLogs);
      (db.get as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repository.getByAlertId('alert-1', { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].alertId).toBe('alert-1');
    });
  });

  describe('getByStatus', () => {
    it('should retrieve logs by status', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          alert_id: 'alert-1',
          alertId: 'alert-1',
          news_item_id: 'news-1',
          newsItemId: 'news-1',
          channel_type: 'email',
          channelType: 'email',
          destination: 'test@example.com',
          status: 'sent',
          error_message: null,
          errorMessage: null,
          sent_at: '2026-01-01T00:00:00Z',
          sentAt: '2026-01-01T00:00:00Z',
          created_at: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockLogs);
      (db.get as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repository.getByStatus('sent', { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('sent');
    });
  });

  describe('markAsSent', () => {
    it('should mark notification as sent', async () => {
      const existingLog = {
        id: 'log-1',
        alert_id: 'alert-1',
        alertId: 'alert-1',
        news_item_id: 'news-1',
        newsItemId: 'news-1',
        channel_type: 'email',
        channelType: 'email',
        destination: 'test@example.com',
        status: 'pending',
        error_message: null,
        errorMessage: null,
        sent_at: null,
        sentAt: null,
        created_at: '2026-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(existingLog);
      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.markAsSent('log-1');

      expect(result?.status).toBe('sent');
      expect(result?.sentAt).toBeDefined();
    });
  });

  describe('markAsFailed', () => {
    it('should mark notification as failed', async () => {
      const existingLog = {
        id: 'log-1',
        alert_id: 'alert-1',
        alertId: 'alert-1',
        news_item_id: 'news-1',
        newsItemId: 'news-1',
        channel_type: 'email',
        channelType: 'email',
        destination: 'test@example.com',
        status: 'pending',
        error_message: null,
        errorMessage: null,
        sent_at: null,
        sentAt: null,
        created_at: '2026-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(existingLog);
      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.markAsFailed('log-1', 'Connection timeout');

      expect(result?.status).toBe('failed');
      expect(result?.errorMessage).toBe('Connection timeout');
    });
  });

  describe('countByStatus', () => {
    it('should count logs by status', async () => {
      (db.get as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await repository.countByStatus('sent');

      expect(result).toBe(5);
    });
  });

  describe('getStatistics', () => {
    it('should return notification statistics', async () => {
      (db.get as jest.Mock).mockResolvedValue({
        total: 10,
        sent: 7,
        failed: 2,
        pending: 1,
      });

      const result = await repository.getStatistics();

      expect(result.total).toBe(10);
      expect(result.sent).toBe(7);
      expect(result.failed).toBe(2);
      expect(result.pending).toBe(1);
    });
  });
});
