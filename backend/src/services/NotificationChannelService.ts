import { NotificationChannel } from '../types';
import { NotificationChannelRepository } from '../repositories/NotificationChannelRepository';
import { AlertRepository } from '../repositories/AlertRepository';
import { isValidEmail, isValidSlackWebhookUrl } from '../utils';

/**
 * Service for managing notification channels
 * Handles business logic for channel operations
 */
class NotificationChannelService {
  constructor(
    private channelRepository: NotificationChannelRepository,
    private alertRepository: AlertRepository,
  ) {}

  /**
   * Add a notification channel to an alert
   * @param alertId - Alert ID
   * @param type - Channel type (email or slack)
   * @param destination - Email address or Slack webhook URL
   * @returns Created channel
   * @throws Error if alert not found or validation fails
   */
  async addChannel(
    alertId: string,
    type: 'email' | 'slack',
    destination: string,
  ): Promise<NotificationChannel> {
    // Verify alert exists
    const alert = await this.alertRepository.getById(alertId);
    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    // Validate destination based on type
    if (type === 'email') {
      if (!isValidEmail(destination)) {
        throw new Error('Invalid email address');
      }
    } else if (type === 'slack') {
      if (!isValidSlackWebhookUrl(destination)) {
        throw new Error('Invalid Slack webhook URL');
      }
    } else {
      throw new Error('Invalid channel type');
    }

    const channel = await this.channelRepository.create({
      alertId,
      type,
      destination: destination.trim(),
      isEnabled: true,
    });

    return channel;
  }

  /**
   * Update a notification channel
   * @param channelId - Channel ID
   * @param updates - Partial channel update
   * @returns Updated channel
   * @throws Error if channel not found or validation fails
   */
  async updateChannel(
    channelId: string,
    updates: Partial<Omit<NotificationChannel, 'id' | 'alertId' | 'createdAt'>>,
  ): Promise<NotificationChannel> {
    const channel = await this.channelRepository.getById(channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }

    // Validate destination if being updated
    if (updates.destination) {
      if (channel.type === 'email') {
        if (!isValidEmail(updates.destination)) {
          throw new Error('Invalid email address');
        }
      } else if (channel.type === 'slack') {
        if (!isValidSlackWebhookUrl(updates.destination)) {
          throw new Error('Invalid Slack webhook URL');
        }
      }
    }

    const updatedChannel = await this.channelRepository.update(channelId, updates);
    if (!updatedChannel) {
      throw new Error(`Failed to update channel with ID ${channelId}`);
    }
    return updatedChannel;
  }

  /**
   * Remove a notification channel
   * @param channelId - Channel ID
   * @throws Error if channel not found
   */
  async removeChannel(channelId: string): Promise<void> {
    const channel = await this.channelRepository.getById(channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }

    await this.channelRepository.delete(channelId);
  }

  /**
   * Toggle channel enabled/disabled status
   * @param channelId - Channel ID
   * @returns Updated channel
   * @throws Error if channel not found
   */
  async toggleChannel(channelId: string): Promise<NotificationChannel> {
    const channel = await this.channelRepository.getById(channelId);
    if (!channel) {
      throw new Error(`Channel with ID ${channelId} not found`);
    }

    const updatedChannel = await this.channelRepository.update(channelId, {
      isEnabled: !channel.isEnabled,
    });

    if (!updatedChannel) {
      throw new Error(`Failed to toggle channel with ID ${channelId}`);
    }

    return updatedChannel;
  }

  /**
   * Get all channels for an alert
   * @param alertId - Alert ID
   * @returns Array of channels
   * @throws Error if alert not found
   */
  async getChannels(alertId: string): Promise<NotificationChannel[]> {
    const alert = await this.alertRepository.getById(alertId);
    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }

    return this.channelRepository.getByAlertId(alertId);
  }
}

export default NotificationChannelService;
