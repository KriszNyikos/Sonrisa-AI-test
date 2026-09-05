import NotificationChannelService from '../../src/services/NotificationChannelService';
import { NotificationChannelRepository } from '../../src/repositories/NotificationChannelRepository';
import { AlertRepository } from '../../src/repositories/AlertRepository';
import { NotificationChannel, Alert } from '../../src/types';

jest.mock('../../src/repositories/NotificationChannelRepository');
jest.mock('../../src/repositories/AlertRepository');

describe('NotificationChannelService', () => {
  let service: NotificationChannelService;
  let mockChannelRepo: jest.Mocked<any>;
  let mockAlertRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockChannelRepo = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getByAlertId: jest.fn(),
    };
    
    mockAlertRepo = {
      getById: jest.fn(),
    };
    
    service = new NotificationChannelService(mockChannelRepo, mockAlertRepo);
  });

  describe('addChannel', () => {
    const mockAlert: Alert = {
      id: 'alert_123',
      name: 'Test Alert',
      keywords: ['test'],
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    it('should add email channel to alert', async () => {
      const mockChannel: NotificationChannel = {
        id: 'channel_123',
        alertId: 'alert_123',
        type: 'email',
        destination: 'test@example.com',
        isEnabled: true,
        createdAt: expect.any(String),
      };

      mockAlertRepo.getById.mockResolvedValue(mockAlert);
      mockChannelRepo.create.mockResolvedValue(mockChannel);

      const result = await service.addChannel('alert_123', 'email', 'test@example.com');

      expect(mockChannelRepo.create).toHaveBeenCalled();
      expect(result.destination).toBe('test@example.com');
      expect(result.type).toBe('email');
    });

    it('should add Slack channel to alert', async () => {
      const mockChannel: NotificationChannel = {
        id: 'channel_123',
        alertId: 'alert_123',
        type: 'slack',
        destination: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
        isEnabled: true,
        createdAt: expect.any(String),
      };

      mockAlertRepo.getById.mockResolvedValue(mockAlert);
      mockChannelRepo.create.mockResolvedValue(mockChannel);

      const result = await service.addChannel(
        'alert_123',
        'slack',
        'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
      );

      expect(result.type).toBe('slack');
    });

    it('should throw error for invalid email', async () => {
      mockAlertRepo.getById.mockResolvedValue(mockAlert);

      await expect(service.addChannel('alert_123', 'email', 'invalid-email')).rejects.toThrow('Invalid email address');
    });

    it('should throw error for invalid Slack webhook', async () => {
      mockAlertRepo.getById.mockResolvedValue(mockAlert);

      await expect(service.addChannel('alert_123', 'slack', 'not-a-webhook')).rejects.toThrow(
        'Invalid Slack webhook URL',
      );
    });

    it('should throw error if alert not found', async () => {
      mockAlertRepo.getById.mockResolvedValue(null);

      await expect(service.addChannel('nonexistent', 'email', 'test@example.com')).rejects.toThrow(
        'Alert with ID nonexistent not found',
      );
    });

    it('should throw error for invalid channel type', async () => {
      mockAlertRepo.getById.mockResolvedValue(mockAlert);

      await expect(service.addChannel('alert_123', 'sms' as any, 'test@example.com')).rejects.toThrow(
        'Invalid channel type',
      );
    });
  });

  describe('updateChannel', () => {
    const mockChannel: NotificationChannel = {
      id: 'channel_123',
      alertId: 'alert_123',
      type: 'email',
      destination: 'old@example.com',
      isEnabled: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    it('should update channel destination', async () => {
      const updatedChannel: NotificationChannel = {
        ...mockChannel,
        destination: 'new@example.com',
      };

      mockChannelRepo.getById.mockResolvedValue(mockChannel);
      mockChannelRepo.update.mockResolvedValue(updatedChannel);

      const result = await service.updateChannel('channel_123', { destination: 'new@example.com' });

      expect(mockChannelRepo.update).toHaveBeenCalledWith('channel_123', expect.objectContaining({ destination: 'new@example.com' }));
      expect(result.destination).toBe('new@example.com');
    });

    it('should throw error if channel not found', async () => {
      mockChannelRepo.getById.mockResolvedValue(null);

      await expect(service.updateChannel('nonexistent', { isEnabled: false })).rejects.toThrow(
        'Channel with ID nonexistent not found',
      );
    });

    it('should validate new email on update', async () => {
      mockChannelRepo.getById.mockResolvedValue(mockChannel);

      await expect(service.updateChannel('channel_123', { destination: 'invalid-email' })).rejects.toThrow(
        'Invalid email address',
      );
    });
  });

  describe('removeChannel', () => {
    const mockChannel: NotificationChannel = {
      id: 'channel_123',
      alertId: 'alert_123',
      type: 'email',
      destination: 'test@example.com',
      isEnabled: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    it('should delete channel', async () => {
      mockChannelRepo.getById.mockResolvedValue(mockChannel);
      mockChannelRepo.delete.mockResolvedValue();

      await service.removeChannel('channel_123');

      expect(mockChannelRepo.delete).toHaveBeenCalledWith('channel_123');
    });

    it('should throw error if channel not found', async () => {
      mockChannelRepo.getById.mockResolvedValue(null);

      await expect(service.removeChannel('nonexistent')).rejects.toThrow('Channel with ID nonexistent not found');
    });
  });

  describe('toggleChannel', () => {
    it('should toggle channel enabled status', async () => {
      const mockChannel: NotificationChannel = {
        id: 'channel_123',
        alertId: 'alert_123',
        type: 'email',
        destination: 'test@example.com',
        isEnabled: true,
        createdAt: '2026-01-01T00:00:00Z',
      };

      const toggledChannel: NotificationChannel = {
        ...mockChannel,
        isEnabled: false,
      };

      mockChannelRepo.getById.mockResolvedValue(mockChannel);
      mockChannelRepo.update.mockResolvedValue(toggledChannel);

      const result = await service.toggleChannel('channel_123');

      expect(mockChannelRepo.update).toHaveBeenCalledWith('channel_123', expect.objectContaining({ isEnabled: false }));
      expect(result.isEnabled).toBe(false);
    });

    it('should throw error if channel not found', async () => {
      mockChannelRepo.getById.mockResolvedValue(null);

      await expect(service.toggleChannel('nonexistent')).rejects.toThrow('Channel with ID nonexistent not found');
    });
  });

  describe('getChannels', () => {
    const mockAlert: Alert = {
      id: 'alert_123',
      name: 'Test Alert',
      keywords: ['test'],
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    it('should return all channels for an alert', async () => {
      const channels: NotificationChannel[] = [
        {
          id: 'channel_1',
          alertId: 'alert_123',
          type: 'email',
          destination: 'email@example.com',
          isEnabled: true,
          createdAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'channel_2',
          alertId: 'alert_123',
          type: 'slack',
          destination: 'https://hooks.slack.com/services/...',
          isEnabled: true,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ];

      mockAlertRepo.getById.mockResolvedValue(mockAlert);
      mockChannelRepo.getByAlertId.mockResolvedValue(channels);

      const result = await service.getChannels('alert_123');

      expect(result).toEqual(channels);
      expect(result).toHaveLength(2);
    });

    it('should throw error if alert not found', async () => {
      mockAlertRepo.getById.mockResolvedValue(null);

      await expect(service.getChannels('nonexistent')).rejects.toThrow('Alert with ID nonexistent not found');
    });
  });
});
