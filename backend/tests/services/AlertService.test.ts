import AlertService from '../../src/services/AlertService';
import { Alert } from '../../src/types';

jest.mock('../../src/repositories/AlertRepository');
jest.mock('../../src/repositories/NotificationChannelRepository');

describe('AlertService', () => {
  let service: AlertService;
  let mockAlertRepo: jest.Mocked<any>;
  let mockChannelRepo: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockAlertRepo = {
      create: jest.fn(),
      getById: jest.fn(),
      getAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    
    mockChannelRepo = {
      deleteByAlertId: jest.fn(),
    };
    
    service = new AlertService(mockAlertRepo, mockChannelRepo);
  });

  describe('createAlert', () => {
    it('should create an alert with valid inputs', async () => {
      const mockAlert: Alert = {
        id: 'alert_12345',
        name: 'Stock Market Alert',
        description: 'Monitor stock prices',
        keywords: ['nasdaq', 'dow jones'],
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      mockAlertRepo.create.mockResolvedValue(mockAlert);

      const result = await service.createAlert('Stock Market Alert', ['nasdaq', 'Dow Jones'], 'Monitor stock prices');

      expect(mockAlertRepo.create).toHaveBeenCalled();
      expect(result.name).toBe('Stock Market Alert');
      expect(result.keywords).toEqual(expect.arrayContaining(['nasdaq', 'dow jones']));
    });

    it('should throw error for invalid alert name', async () => {
      await expect(service.createAlert('', ['keyword'])).rejects.toThrow('Invalid alert name');
    });

    it('should throw error for empty keywords', async () => {
      await expect(service.createAlert('Valid Name', [])).rejects.toThrow('At least one keyword is required');
    });

    it('should throw error for invalid description', async () => {
      await expect(service.createAlert('Valid Name', ['keyword'], 'a'.repeat(1001))).rejects.toThrow(
        'Invalid description',
      );
    });

    it('should deduplicate keywords', async () => {
      const mockAlert: Alert = {
        id: 'alert_12345',
        name: 'Test Alert',
        keywords: ['duplicate'],
        isActive: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      };

      mockAlertRepo.create.mockResolvedValue(mockAlert);

      await service.createAlert('Test Alert', ['duplicate', 'DUPLICATE', 'Duplicate']);

      const call = mockAlertRepo.create.mock.calls[0][0];
      expect(call.keywords).toHaveLength(1);
    });
  });

  describe('updateAlert', () => {
    it('should update alert with valid inputs', async () => {
      const existingAlert: Alert = {
        id: 'alert_123',
        name: 'Original Name',
        keywords: ['keyword1'],
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const updatedAlert: Alert = {
        ...existingAlert,
        name: 'Updated Name',
        updatedAt: expect.any(String),
      };

      mockAlertRepo.getById.mockResolvedValue(existingAlert);
      mockAlertRepo.update.mockResolvedValue(updatedAlert);

      const result = await service.updateAlert('alert_123', { name: 'Updated Name' });

      expect(mockAlertRepo.update).toHaveBeenCalledWith('alert_123', expect.objectContaining({ name: 'Updated Name' }));
      expect(result.name).toBe('Updated Name');
    });

    it('should throw error if alert not found', async () => {
      mockAlertRepo.getById.mockResolvedValue(null);

      await expect(service.updateAlert('nonexistent', { name: 'New Name' })).rejects.toThrow('Alert with ID nonexistent not found');
    });

    it('should validate keywords on update', async () => {
      const existingAlert: Alert = {
        id: 'alert_123',
        name: 'Test Alert',
        keywords: ['keyword1'],
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      mockAlertRepo.getById.mockResolvedValue(existingAlert);

      await expect(service.updateAlert('alert_123', { keywords: [] })).rejects.toThrow('At least one keyword is required');
    });
  });

  describe('deleteAlert', () => {
    it('should delete alert and its channels', async () => {
      const alert: Alert = {
        id: 'alert_123',
        name: 'Test Alert',
        keywords: ['keyword1'],
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      mockAlertRepo.getById.mockResolvedValue(alert);
      mockChannelRepo.deleteByAlertId.mockResolvedValue();
      mockAlertRepo.delete.mockResolvedValue();

      await service.deleteAlert('alert_123');

      expect(mockChannelRepo.deleteByAlertId).toHaveBeenCalledWith('alert_123');
      expect(mockAlertRepo.delete).toHaveBeenCalledWith('alert_123');
    });

    it('should throw error if alert not found', async () => {
      mockAlertRepo.getById.mockResolvedValue(null);

      await expect(service.deleteAlert('nonexistent')).rejects.toThrow('Alert with ID nonexistent not found');
    });
  });

  describe('getAlert', () => {
    it('should return alert by ID', async () => {
      const alert: Alert = {
        id: 'alert_123',
        name: 'Test Alert',
        keywords: ['keyword1'],
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      mockAlertRepo.getById.mockResolvedValue(alert);

      const result = await service.getAlert('alert_123');

      expect(result).toEqual(alert);
    });

    it('should return null if alert not found', async () => {
      mockAlertRepo.getById.mockResolvedValue(null);

      const result = await service.getAlert('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('listAlerts', () => {
    it('should return all alerts', async () => {
      const alerts: Alert[] = [
        {
          id: 'alert_1',
          name: 'Alert 1',
          keywords: ['keyword1'],
          isActive: true,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        },
        {
          id: 'alert_2',
          name: 'Alert 2',
          keywords: ['keyword2'],
          isActive: false,
          createdAt: '2026-01-02T00:00:00Z',
          updatedAt: '2026-01-02T00:00:00Z',
        },
      ];

      mockAlertRepo.getAll.mockResolvedValue(alerts);

      const result = await service.listAlerts();

      expect(result).toEqual(alerts);
      expect(result).toHaveLength(2);
    });
  });

  describe('toggleAlert', () => {
    it('should toggle alert active status', async () => {
      const alert: Alert = {
        id: 'alert_123',
        name: 'Test Alert',
        keywords: ['keyword1'],
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const toggledAlert: Alert = {
        ...alert,
        isActive: false,
        updatedAt: expect.any(String),
      };

      mockAlertRepo.getById.mockResolvedValue(alert);
      mockAlertRepo.update.mockResolvedValue(toggledAlert);

      const result = await service.toggleAlert('alert_123');

      expect(mockAlertRepo.update).toHaveBeenCalledWith('alert_123', expect.objectContaining({ isActive: false }));
      expect(result.isActive).toBe(false);
    });

    it('should throw error if alert not found', async () => {
      mockAlertRepo.getById.mockResolvedValue(null);

      await expect(service.toggleAlert('nonexistent')).rejects.toThrow('Alert with ID nonexistent not found');
    });
  });
});
