import { NotificationLog } from '../types';
import { NotificationLogRepository } from '../repositories/NotificationLogRepository';
import { NotificationChannelRepository } from '../repositories/NotificationChannelRepository';

/**
 * Service for sending and logging notifications
 * Handles notification delivery workflow
 */
class NotificationService {
  constructor(
    private logRepository: NotificationLogRepository,
    private channelRepository: NotificationChannelRepository,
  ) {}

  /**
   * Send a notification through enabled channels
   * Creates log entries for each channel
   * @param alertId - Alert ID
   * @param newsItemId - News item ID that triggered the alert
   * @param channelIds - Specific channel IDs to notify (if empty, use all enabled channels)
   * @returns Array of created notification logs
   * @throws Error if alert or channels not found
   */
  async sendNotification(
    alertId: string,
    newsItemId: string,
    channelIds?: string[],
  ): Promise<NotificationLog[]> {
    // Get channels for this alert
    let channels = await this.channelRepository.getByAlertId(alertId);

    if (!channels || channels.length === 0) {
      throw new Error(`No notification channels found for alert ${alertId}`);
    }

    // Filter to only enabled channels
    channels = channels.filter((c) => c.isEnabled);

    if (channelIds && channelIds.length > 0) {
      channels = channels.filter((c) => channelIds.includes(c.id));
    }

    if (channels.length === 0) {
      throw new Error('No enabled notification channels available');
    }

    const logs: NotificationLog[] = [];

    // Create log entry for each channel
    for (const channel of channels) {
      const log = await this.logRepository.create({
        alertId,
        newsItemId,
        channelType: channel.type,
        destination: channel.destination,
        status: 'pending',
      });

      logs.push(log);
    }

    return logs;
  }

  /**
   * Update notification status after sending attempt
   * @param logId - Notification log ID
   * @param status - New status (sent or failed)
   * @param errorMessage - Optional error message if failed
   * @returns Updated notification log
   * @throws Error if log not found
   */
  async updateNotificationStatus(
    logId: string,
    status: 'sent' | 'failed' | 'pending',
    errorMessage?: string,
  ): Promise<NotificationLog> {
    const log = await this.logRepository.getById(logId);
    if (!log) {
      throw new Error(`Notification log with ID ${logId} not found`);
    }

    const updates: any = {
      status,
      sentAt: new Date().toISOString(),
    };

    if (errorMessage) {
      updates.errorMessage = errorMessage;
    }

    const updated = await this.logRepository.update(logId, updates);
    if (!updated) {
      throw new Error(`Failed to update notification log with ID ${logId}`);
    }

    return updated;
  }

  /**
   * Get notification status for a specific log entry
   * @param logId - Notification log ID
   * @returns Notification log or null
   */
  async getNotificationStatus(logId: string): Promise<NotificationLog | null> {
    return this.logRepository.getById(logId);
  }

  /**
   * Get all notifications for an alert
   * @param alertId - Alert ID
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 20)
   * @returns Paginated notification logs
   */
  async getAlertNotifications(alertId: string, page: number = 1, limit: number = 20) {
    return this.logRepository.getByAlertId(alertId, { page, limit });
  }

  /**
   * Get all notifications for a news item
   * @param newsItemId - News item ID
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 20)
   * @returns Paginated notification logs
   */
  async getNewsNotifications(newsItemId: string, page: number = 1, limit: number = 20) {
    return this.logRepository.getByNewsItemId(newsItemId, { page, limit });
  }

  /**
   * Get notifications by status
   * @param status - Notification status
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 20)
   * @returns Paginated notification logs
   */
  async getNotificationsByStatus(status: 'sent' | 'failed' | 'pending', page: number = 1, limit: number = 20) {
    return this.logRepository.getByStatus(status, { page, limit });
  }
}

export default NotificationService;
