import { Database } from 'sqlite';
import { NotificationChannelRepository } from '../../src/repositories';

describe('NotificationChannelRepository', () => {
  let db: Database;
  let repository: NotificationChannelRepository;

  beforeEach(() => {
    db = {
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn(),
    } as any;

    repository = new NotificationChannelRepository(db);
  });

  describe('create', () => {
    it('should create a new notification channel', async () => {
      const channelData = {
        alertId: 'alert-1',
        type: 'email' as const,
        destination: 'test@example.com',
        isEnabled: true,
      };

      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.create(channelData);

      expect(result).toHaveProperty('id');
      expect(result.alertId).toBe(channelData.alertId);
      expect(result.type).toBe('email');
      expect(result.destination).toBe('test@example.com');
      expect(result.isEnabled).toBe(true);
      expect(result).toHaveProperty('createdAt');
    });
  });

  describe('getById', () => {
    it('should retrieve a notification channel by ID', async () => {
      const mockChannel = {
        id: 'channel-1',
        alert_id: 'alert-1',
        alertId: 'alert-1',
        type: 'email',
        destination: 'test@example.com',
        is_enabled: 1,
        isEnabled: 1,
        created_at: '2026-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(mockChannel);

      const result = await repository.getById('channel-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('channel-1');
      expect(result?.type).toBe('email');
    });

    it('should return null for non-existent channel', async () => {
      (db.get as jest.Mock).mockResolvedValue(null);

      const result = await repository.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getByAlertId', () => {
    it('should retrieve all channels for an alert', async () => {
      const mockChannels = [
        {
          id: 'channel-1',
          alert_id: 'alert-1',
          alertId: 'alert-1',
          type: 'email',
          destination: 'test@example.com',
          is_enabled: 1,
          isEnabled: 1,
          created_at: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'channel-2',
          alert_id: 'alert-1',
          alertId: 'alert-1',
          type: 'slack',
          destination: 'https://hooks.slack.com/...',
          is_enabled: 1,
          isEnabled: 1,
          created_at: '2026-01-02T00:00:00Z',
          createdAt: '2026-01-02T00:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockChannels);

      const result = await repository.getByAlertId('alert-1');

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('email');
      expect(result[1].type).toBe('slack');
    });
  });

  describe('getEnabledByAlertId', () => {
    it('should retrieve only enabled channels for an alert', async () => {
      const mockChannels = [
        {
          id: 'channel-1',
          alert_id: 'alert-1',
          alertId: 'alert-1',
          type: 'email',
          destination: 'test@example.com',
          is_enabled: 1,
          isEnabled: 1,
          created_at: '2026-01-01T00:00:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      (db.all as jest.Mock).mockResolvedValue(mockChannels);

      const result = await repository.getEnabledByAlertId('alert-1');

      expect(result).toHaveLength(1);
      expect(result[0].isEnabled).toBe(true);
    });
  });

  describe('toggle', () => {
    it('should toggle channel enabled status', async () => {
      const existingChannel = {
        id: 'channel-1',
        alert_id: 'alert-1',
        alertId: 'alert-1',
        type: 'email',
        destination: 'test@example.com',
        is_enabled: 1,
        isEnabled: 1,
        created_at: '2026-01-01T00:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      };

      (db.get as jest.Mock).mockResolvedValue(existingChannel);
      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.toggle('channel-1');

      expect(result?.isEnabled).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a notification channel', async () => {
      (db.run as jest.Mock).mockResolvedValue({ changes: 1 });

      const result = await repository.delete('channel-1');

      expect(result).toBe(true);
    });

    it('should return false if channel does not exist', async () => {
      (db.run as jest.Mock).mockResolvedValue({ changes: 0 });

      const result = await repository.delete('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should check if channel exists', async () => {
      (db.get as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await repository.exists('alert-1', 'email', 'test@example.com');

      expect(result).toBe(true);
    });

    it('should return false for non-existent channel', async () => {
      (db.get as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await repository.exists('alert-1', 'email', 'test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('countByAlertId', () => {
    it('should count channels for an alert', async () => {
      (db.get as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await repository.countByAlertId('alert-1');

      expect(result).toBe(3);
    });
  });
});
