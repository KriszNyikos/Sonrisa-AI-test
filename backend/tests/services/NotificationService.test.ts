import NotificationService from '../../src/services/NotificationService';
import { NotificationLog, NotificationChannel } from '../../src/types';

jest.mock('../../src/repositories/NotificationLogRepository');
jest.mock('../../src/repositories/NotificationChannelRepository');

describe('NotificationService', () => {
  let service: NotificationService;
  let mockLogRepo: jest.Mocked<any>;
  let mockChannelRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockLogRepo = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      getByAlertId: jest.fn(),
      getByNewsItemId: jest.fn(),
      getByStatus: jest.fn(),
    };
    
    mockChannelRepo = {
      getByAlertId: jest.fn(),
    };
    
    service = new NotificationService(mockLogRepo, mockChannelRepo);
  });

  describe('sendNotification', () => {
    const mockChannels: NotificationChannel[] = [
      {
        id: 'channel_1',
        alertId: 'alert_123',
        type: 'email',
        destination: 'test@example.com',
        isEnabled: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'channel_2',
        alertId: 'alert_123',
        type: 'slack',
        destination: 'https://hooks.slack.com/...',
        isEnabled: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];

    it('should send notification to all enabled channels', async () => {
      const mockLog: NotificationLog = {
        id: 'notif_1',
        alertId: 'alert_123',
        newsItemId: 'news_123',
        channelType: 'email',
        destination: 'test@example.com',
        status: 'pending',
        createdAt: expect.any(String),
      };

      mockChannelRepo.getByAlertId.mockResolvedValue(mockChannels);
      mockLogRepo.create.mockResolvedValue(mockLog);

      const result = await service.sendNotification('alert_123', 'news_123');

      expect(result).toHaveLength(2);
      expect(mockLogRepo.create).toHaveBeenCalledTimes(2);
    });

    it('should filter disabled channels', async () => {
      const channels: NotificationChannel[] = [
        {
          id: 'channel_1',
          alertId: 'alert_123',
          type: 'email',
          destination: 'test@example.com',
          isEnabled: true,
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'channel_2',
          alertId: 'alert_123',
          type: 'slack',
          destination: 'https://hooks.slack.com/...',
          isEnabled: false,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      const mockLog: NotificationLog = {
        id: 'notif_1',
        alertId: 'alert_123',
        newsItemId: 'news_123',
        channelType: 'email',
        destination: 'test@example.com',
        status: 'pending',
        createdAt: expect.any(String),
      };

      mockChannelRepo.getByAlertId.mockResolvedValue(channels);
      mockLogRepo.create.mockResolvedValue(mockLog);

      const result = await service.sendNotification('alert_123', 'news_123');

      expect(result).toHaveLength(1);
      expect(result[0].channelType).toBe('email');
    });

    it('should respect specific channel IDs', async () => {
      const mockLog: NotificationLog = {
        id: 'notif_1',
        alertId: 'alert_123',
        newsItemId: 'news_123',
        channelType: 'email',
        destination: 'test@example.com',
        status: 'pending',
        createdAt: expect.any(String),
      };

      mockChannelRepo.getByAlertId.mockResolvedValue(mockChannels);
      mockLogRepo.create.mockResolvedValue(mockLog);

      const result = await service.sendNotification('alert_123', 'news_123', ['channel_1']);

      expect(result).toHaveLength(1);
      expect(mockLogRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if no channels found', async () => {
      mockChannelRepo.getByAlertId.mockResolvedValue([]);

      await expect(service.sendNotification('alert_123', 'news_123')).rejects.toThrow(
        'No notification channels found for alert alert_123',
      );
    });

    it('should throw error if no enabled channels available', async () => {
      const disabledChannels: NotificationChannel[] = [
        {
          id: 'channel_1',
          alertId: 'alert_123',
          type: 'email',
          destination: 'test@example.com',
          isEnabled: false,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockChannelRepo.getByAlertId.mockResolvedValue(disabledChannels);

      await expect(service.sendNotification('alert_123', 'news_123')).rejects.toThrow(
        'No enabled notification channels available',
      );
    });
  });

  describe('updateNotificationStatus', () => {
    it('should update notification status to sent', async () => {
      const mockLog: NotificationLog = {
        id: 'notif_1',
        alertId: 'alert_123',
        newsItemId: 'news_123',
        channelType: 'email',
        destination: 'test@example.com',
        status: 'pending',
        createdAt: '2026-01-01T00:00:00Z',
      };

      const updatedLog: NotificationLog = {
        ...mockLog,
        status: 'sent',
        sentAt: expect.any(String),
      };

      mockLogRepo.getById.mockResolvedValue(mockLog);
      mockLogRepo.update.mockResolvedValue(updatedLog);

      const result = await service.updateNotificationStatus('notif_1', 'sent');

      expect(mockLogRepo.update).toHaveBeenCalledWith('notif_1', expect.objectContaining({ status: 'sent' }));
      expect(result.status).toBe('sent');
    });

    it('should update notification status to failed with error message', async () => {
      const mockLog: NotificationLog = {
        id: 'notif_1',
        alertId: 'alert_123',
        newsItemId: 'news_123',
        channelType: 'email',
        destination: 'test@example.com',
        status: 'pending',
        createdAt: '2026-01-01T00:00:00Z',
      };

      const updatedLog: NotificationLog = {
        ...mockLog,
        status: 'failed',
        errorMessage: 'Email delivery failed',
        sentAt: expect.any(String),
      };

      mockLogRepo.getById.mockResolvedValue(mockLog);
      mockLogRepo.update.mockResolvedValue(updatedLog);

      const result = await service.updateNotificationStatus('notif_1', 'failed', 'Email delivery failed');

      expect(mockLogRepo.update).toHaveBeenCalledWith(
        'notif_1',
        expect.objectContaining({ status: 'failed', errorMessage: 'Email delivery failed' }),
      );
      expect(result.errorMessage).toBe('Email delivery failed');
    });

    it('should throw error if log not found', async () => {
      mockLogRepo.getById.mockResolvedValue(null);

      await expect(service.updateNotificationStatus('nonexistent', 'sent')).rejects.toThrow(
        'Notification log with ID nonexistent not found',
      );
    });
  });

  describe('getNotificationStatus', () => {
    it('should return notification log', async () => {
      const mockLog: NotificationLog = {
        id: 'notif_1',
        alertId: 'alert_123',
        newsItemId: 'news_123',
        channelType: 'email',
        destination: 'test@example.com',
        status: 'sent',
        sentAt: '2026-01-01T00:01:00Z',
        createdAt: '2026-01-01T00:00:00Z',
      };

      mockLogRepo.getById.mockResolvedValue(mockLog);

      const result = await service.getNotificationStatus('notif_1');

      expect(result).toEqual(mockLog);
    });

    it('should return null if log not found', async () => {
      mockLogRepo.getById.mockResolvedValue(null);

      const result = await service.getNotificationStatus('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAlertNotifications', () => {
    it('should return all notifications for an alert', async () => {
      const mockLogs: NotificationLog[] = [
        {
          id: 'notif_1',
          alertId: 'alert_123',
          newsItemId: 'news_123',
          channelType: 'email',
          destination: 'test@example.com',
          status: 'sent',
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'notif_2',
          alertId: 'alert_123',
          newsItemId: 'news_456',
          channelType: 'slack',
          destination: 'https://hooks.slack.com/...',
          status: 'sent',
          createdAt: '2026-01-02T00:00:00Z',
        },
      ];

      mockLogRepo.getByAlertId.mockResolvedValue({
        items: mockLogs,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await service.getAlertNotifications('alert_123');

      expect(result.items).toHaveLength(2);
      expect(mockLogRepo.getByAlertId).toHaveBeenCalledWith('alert_123', { page: 1, limit: 20 });
    });
  });

  describe('getNewsNotifications', () => {
    it('should return all notifications for a news item', async () => {
      const mockLogs: NotificationLog[] = [
        {
          id: 'notif_1',
          alertId: 'alert_123',
          newsItemId: 'news_123',
          channelType: 'email',
          destination: 'test@example.com',
          status: 'sent',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockLogRepo.getByNewsItemId.mockResolvedValue({
        items: mockLogs,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await service.getNewsNotifications('news_123');

      expect(result.items).toHaveLength(1);
      expect(mockLogRepo.getByNewsItemId).toHaveBeenCalledWith('news_123', { page: 1, limit: 20 });
    });
  });

  describe('getNotificationsByStatus', () => {
    it('should return notifications by status', async () => {
      const mockLogs: NotificationLog[] = [
        {
          id: 'notif_1',
          alertId: 'alert_123',
          newsItemId: 'news_123',
          channelType: 'email',
          destination: 'test@example.com',
          status: 'failed',
          errorMessage: 'Delivery failed',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockLogRepo.getByStatus.mockResolvedValue({
        items: mockLogs,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await service.getNotificationsByStatus('failed');

      expect(result.items).toHaveLength(1);
      expect(mockLogRepo.getByStatus).toHaveBeenCalledWith('failed', { page: 1, limit: 20 });
    });
  });
});
